use crate::hardware::{self, Hardware};
use serde::Serialize;
use std::{
    path::PathBuf,
    sync::{Arc, Mutex, OnceLock},
    time::Instant,
};
use sysinfo::{Disks, Networks, System, MINIMUM_CPU_UPDATE_INTERVAL};

pub struct Sampler {
    system: System,
    cpu_started: Instant,
    networks: Networks,
    network_sampled_at: Option<Instant>,
    system_volume: PathBuf,
    device_name: Option<String>,
    os_version: Option<String>,
    architecture: String,
    hardware: Arc<OnceLock<Hardware>>,
    #[cfg(windows)]
    gpu: Option<nvml_wrapper::Nvml>,
}

impl Sampler {
    pub fn new() -> Self {
        let mut system = System::new();
        system.refresh_cpu_usage();
        let system_volume = if cfg!(windows) {
            let drive = std::env::var("SystemDrive").unwrap_or_else(|_| "C:".into());
            PathBuf::from(format!("{drive}\\"))
        } else {
            PathBuf::from("/")
        };
        let hardware = Arc::new(OnceLock::new());
        let inventory = Arc::clone(&hardware);
        if std::thread::Builder::new()
            .name("hardware-inventory".into())
            .spawn(move || {
                inventory.get_or_init(hardware::read);
            })
            .is_err()
        {
            hardware.get_or_init(Hardware::default);
        }
        Self {
            system,
            cpu_started: Instant::now(),
            networks: Networks::new(),
            network_sampled_at: None,
            system_volume,
            device_name: System::host_name(),
            os_version: System::long_os_version(),
            architecture: System::cpu_arch(),
            hardware,
            #[cfg(windows)]
            gpu: init_gpu(),
        }
    }

    fn read(&mut self) -> Metrics {
        let cpu = (self.cpu_started.elapsed() >= MINIMUM_CPU_UPDATE_INTERVAL).then(|| {
            self.system.refresh_cpu_usage();
            self.system.global_cpu_usage()
        });
        self.system.refresh_memory();
        self.networks.refresh(true);
        let sampled_at = Instant::now();
        let network = self
            .network_sampled_at
            .replace(sampled_at)
            .and_then(|previous| {
                let seconds = sampled_at.duration_since(previous).as_secs_f64();
                if self.networks.is_empty() || seconds <= 0.0 {
                    return None;
                }
                let (received, sent) =
                    self.networks
                        .values()
                        .fold((0.0, 0.0), |(down, up), adapter| {
                            (
                                down + adapter.received() as f64,
                                up + adapter.transmitted() as f64,
                            )
                        });
                Some(NetworkReading {
                    download: received / seconds,
                    upload: sent / seconds,
                })
            });

        let disks = Disks::new_with_refreshed_list();
        let storage = disks
            .list()
            .iter()
            .find(|disk| {
                disk.mount_point()
                    .as_os_str()
                    .eq_ignore_ascii_case(self.system_volume.as_os_str())
                    && disk.total_space() > 0
            })
            .map(|disk| Storage {
                volume: disk.mount_point().display().to_string(),
                used: disk.total_space().saturating_sub(disk.available_space()),
                total: disk.total_space(),
            });

        Metrics {
            cpu,
            network,
            #[cfg(windows)]
            gpu: self.gpu.as_ref().and_then(read_gpu),
            #[cfg(not(windows))]
            gpu: None,
            memory_used: self.system.used_memory(),
            memory_total: self.system.total_memory(),
            storage,
            device_name: self.device_name.clone(),
            os_version: self.os_version.clone(),
            architecture: self.architecture.clone(),
            uptime_seconds: System::uptime(),
            processor_model: self
                .system
                .cpus()
                .first()
                .map(|cpu| cpu.brand().trim().to_owned()),
            hardware: self.hardware.get().cloned(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Metrics {
    cpu: Option<f32>,
    network: Option<NetworkReading>,
    gpu: Option<GpuReading>,
    memory_used: u64,
    memory_total: u64,
    storage: Option<Storage>,
    device_name: Option<String>,
    os_version: Option<String>,
    architecture: String,
    uptime_seconds: u64,
    processor_model: Option<String>,
    hardware: Option<Hardware>,
}

#[derive(Serialize)]
struct NetworkReading {
    download: f64,
    upload: f64,
}

#[derive(Serialize)]
struct GpuReading {
    name: String,
    usage: u32,
    temperature: Option<u32>,
}

#[cfg(windows)]
fn init_gpu() -> Option<nvml_wrapper::Nvml> {
    let driver_paths = [
        ("SystemRoot", "System32/nvml.dll"),
        ("ProgramW6432", "NVIDIA Corporation/NVSMI/nvml.dll"),
    ];

    driver_paths.into_iter().find_map(|(variable, relative)| {
        let path = PathBuf::from(std::env::var_os(variable)?).join(relative);
        nvml_wrapper::Nvml::builder()
            .lib_path(path.as_os_str())
            .init()
            .ok()
    })
}

#[cfg(windows)]
fn read_gpu(nvml: &nvml_wrapper::Nvml) -> Option<GpuReading> {
    use nvml_wrapper::enum_wrappers::device::TemperatureSensor;

    let device = nvml.device_by_index(0).ok()?;
    Some(GpuReading {
        usage: device.utilization_rates().ok()?.gpu.min(100),
        name: device.name().unwrap_or_else(|_| "NVIDIA GPU".into()),
        temperature: device.temperature(TemperatureSensor::Gpu).ok(),
    })
}

#[derive(Serialize)]
struct Storage {
    volume: String,
    used: u64,
    total: u64,
}

#[tauri::command]
pub async fn read_metrics(state: tauri::State<'_, Mutex<Sampler>>) -> Result<Metrics, String> {
    let mut sampler = state
        .lock()
        .map_err(|_| "Systeemmetingen zijn niet beschikbaar.")?;
    Ok(sampler.read())
}
