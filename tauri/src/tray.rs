use std::path::PathBuf;

use tauri::{
    AppHandle, CustomMenuItem, Icon, Manager, PhysicalPosition, State, SystemTray, SystemTrayEvent,
};

use crate::models;

const READY_ICON: &[u8] = {
    #[cfg(debug_assertions)]
    {
        include_bytes!("../icons/IconTemplateDev@2x.png")
    }
    #[cfg(not(debug_assertions))]
    {
        include_bytes!("../icons/IconTemplate@2x.png")
    }
};

const RUNNING_ICON: &[u8] = {
    #[cfg(debug_assertions)]
    {
        include_bytes!("../icons/IconActiveTemplateDev@2x.png")
    }
    #[cfg(not(debug_assertions))]
    {
        include_bytes!("../icons/IconActiveTemplate@2x.png")
    }
};

pub enum Icons {
    Ready,
    Running,
}
pub fn get_icon(icon: Icons) -> Icon {
    match icon {
        Icons::Ready => Icon::Raw(READY_ICON.to_vec()),
        Icons::Running => Icon::Raw(RUNNING_ICON.to_vec()),
    }
}

pub fn create_system_tray() -> SystemTray {
    // here `"quit".to_string()` defines the menu item id, and the second parameter is the menu item label.
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(hide);

    SystemTray::new()
        .with_menu(tray_menu)
        .with_icon(get_icon(Icons::Ready))
}

pub fn handle_system_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        tauri::SystemTrayEvent::LeftClick { position, .. } => {
            let window = app.get_window("main").unwrap();
            window
                .set_position(PhysicalPosition {
                    x: position.x - (window.inner_size().unwrap().width / 2) as f64,
                    y: position.y,
                })
                .unwrap();
            match window.is_visible().unwrap() {
                true => window.hide().unwrap(),
                false => {
                    window.show().unwrap();
                    // TODO needs to be a client event to request the current time on wake
                    app.state::<models::State>()
                        .0
                        .lock()
                        .unwrap()
                        .time("not used yet".to_string());
                }
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
    }
}
