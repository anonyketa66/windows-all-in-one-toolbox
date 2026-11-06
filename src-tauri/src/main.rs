#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod hardware;
mod metrics;

fn main() {
    tauri::Builder::default()
        .manage(std::sync::Mutex::new(metrics::Sampler::new()))
        .invoke_handler(tauri::generate_handler![metrics::read_metrics])
        .run(tauri::generate_context!())
        .expect("Windows All-in-One Toolbox could not start");
}
