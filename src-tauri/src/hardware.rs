use serde::Serialize;

#[derive(Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Hardware {
    graphics: Vec<String>,
    motherboard: Vec<String>,
    drives: Vec<String>,
    memory_modules: Vec<MemoryModule>,
}

#[derive(Clone, Serialize)]
#[cfg_attr(windows, derive(serde::Deserialize))]
pub struct MemoryModule {
    #[serde(rename(deserialize = "Capacity"))]
    capacity: Option<u64>,
    #[serde(rename(serialize = "memoryType", deserialize = "SMBIOSMemoryType"))]
    memory_type: Option<u32>,
    #[serde(rename(serialize = "speed", deserialize = "ConfiguredClockSpeed"))]
    speed: Option<u32>,
}

#[cfg(windows)]
pub fn read() -> Hardware {
    use serde::Deserialize;
    use wmi::WMIConnection;

    #[derive(Deserialize)]
    #[serde(rename_all = "PascalCase")]
    struct Adapter {
        name: Option<String>,
    }

    #[derive(Deserialize)]
    #[serde(rename_all = "PascalCase")]
    struct Board {
        manufacturer: Option<String>,
        product: Option<String>,
    }

    let Ok(wmi) = WMIConnection::new() else {
        return Hardware::default();
    };

    Hardware {
        graphics: wmi
            .raw_query::<Adapter>("SELECT Name FROM Win32_VideoController")
            .unwrap_or_default()
            .into_iter()
            .filter_map(|adapter| adapter.name)
            .collect(),
        motherboard: wmi
            .raw_query::<Board>("SELECT Manufacturer, Product FROM Win32_BaseBoard")
            .unwrap_or_default()
            .into_iter()
            .map(|board| {
                [board.manufacturer, board.product]
                    .into_iter()
                    .flatten()
                    .collect::<Vec<_>>()
                    .join(" ")
            })
            .collect(),
        drives: read_drives(&wmi),
        memory_modules: wmi
            .raw_query(
                "SELECT Capacity, SMBIOSMemoryType, ConfiguredClockSpeed FROM Win32_PhysicalMemory",
            )
            .unwrap_or_default(),
    }
}

#[cfg(windows)]
fn read_drives(wmi: &wmi::WMIConnection) -> Vec<String> {
    use serde::Deserialize;

    #[derive(Deserialize)]
    #[serde(rename = "Win32_DiskDrive")]
    struct Drive {
        #[serde(rename = "__RELPATH")]
        path: Option<String>,
        #[serde(rename = "Model")]
        model: Option<String>,
    }

    #[derive(Deserialize)]
    #[serde(rename = "Win32_DiskPartition")]
    struct Partition {
        #[serde(rename = "__RELPATH")]
        path: String,
    }

    #[derive(Deserialize)]
    #[serde(rename = "Win32_LogicalDisk")]
    struct Volume {
        #[serde(rename = "DeviceID")]
        letter: String,
    }

    #[derive(Deserialize)]
    #[serde(rename = "Win32_DiskDriveToDiskPartition")]
    struct DriveToPartition;

    #[derive(Deserialize)]
    #[serde(rename = "Win32_LogicalDiskToPartition")]
    struct PartitionToVolume;

    wmi.query::<Drive>()
        .unwrap_or_default()
        .into_iter()
        .filter_map(|drive| {
            let model = drive.model?;
            let mut letters: Vec<_> = drive
                .path
                .and_then(|path| wmi.associators::<Partition, DriveToPartition>(&path).ok())
                .unwrap_or_default()
                .into_iter()
                .flat_map(|partition| {
                    wmi.associators::<Volume, PartitionToVolume>(&partition.path)
                        .unwrap_or_default()
                })
                .map(|volume| volume.letter)
                .collect();
            letters.sort_unstable();
            letters.dedup();

            Some(if letters.is_empty() {
                model
            } else {
                format!("({}) {}", letters.join(", "), model.trim())
            })
        })
        .collect()
}

#[cfg(not(windows))]
pub fn read() -> Hardware {
    Hardware::default()
}
