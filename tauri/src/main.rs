// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod setup;
mod tray;

fn main() {
    tauri::Builder::default()
        .setup(setup::handle_setup)
        .system_tray(tray::create_system_tray())
        .on_system_tray_event(tray::handle_system_tray_event)
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::start,
            commands::stop,
            commands::pause,
            commands::play,
            commands::update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
