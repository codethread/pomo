// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    CustomMenuItem, Manager, PhysicalPosition, SystemTray, SystemTrayMenu, SystemTrayMenuItem,
};

fn main() {
    // here `"quit".to_string()` defines the menu item id, and the second parameter is the menu item label.
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(hide);

    let tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .setup(|app| {
            // hide icon from dock
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            Ok(())
        })
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            tauri::SystemTrayEvent::LeftClick { position, .. } => {
                println!("{position:?}");
                let window = app.get_window("main").unwrap();
                window
                    .set_position(PhysicalPosition {
                        x: position.x - (window.inner_size().unwrap().width / 2) as f64,
                        y: position.y,
                    })
                    .unwrap();
                match window.is_visible().unwrap() {
                    true => window.hide().unwrap(),
                    false => window.show().unwrap(),
                };
            }
            tauri::SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
