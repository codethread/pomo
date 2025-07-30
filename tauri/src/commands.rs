use std::process::Command;

use lib::TimePayload;
use specta::specta;
use tauri::{AppHandle, State};

use crate::{
    models,
    tray::{get_icon, Icons},
};

#[tauri::command]
#[specta]
pub fn start(state: State<models::State>, minutes: u8, seconds: u8, timerid: String) {
    let id = timerid;
    println!("{}", &id);
    state
        .0
        .lock()
        .unwrap()
        .start(TimePayload::new(minutes, seconds, id));
}

#[tauri::command]
#[specta]
pub fn stop(app: AppHandle, state: State<models::State>, id: String) {
    state.0.lock().unwrap().stop(id);
    let _ = app.tray_handle().set_icon(get_icon(Icons::Ready));
}

#[tauri::command]
#[specta]
pub fn pause(state: State<models::State>, id: String) {
    state.0.lock().unwrap().pause(id);
}

#[tauri::command]
#[specta]
pub fn play(app: AppHandle, state: State<models::State>, id: String) {
    state.0.lock().unwrap().play(id);
    let _ = app.tray_handle().set_icon(get_icon(Icons::Running));
}

#[tauri::command]
#[specta]
pub fn update(state: State<models::State>, id: String, duration: u8) {
    state.0.lock().unwrap().update(id, duration);
}

#[tauri::command]
#[specta]
pub fn is_dev() -> bool {
    #[cfg(debug_assertions)]
    return true;
    #[cfg(not(debug_assertions))]
    return false;
}

#[tauri::command]
#[specta]
pub fn macos_shorcuts_run(mode: String) -> Result<(), String> {
    let status = Command::new("shortcuts").arg("run").arg(&mode).status();

    match status {
        Ok(exit_status) => {
            if exit_status.success() {
                Ok(())
            } else {
                Err(format!("Failed to run shortcut {mode}"))
            }
        }
        Err(_) => Err(format!("Failed to run shortcut {mode}")),
    }
}

#[tauri::command]
#[specta]
pub fn macos_shortcuts_list() -> Result<Vec<String>, String> {
    let output = Command::new("shortcuts").arg("list").output();

    match output {
        Ok(output) => {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let shortcuts: Vec<String> = stdout
                    .lines()
                    .map(|line| line.trim().to_string())
                    .filter(|line| !line.is_empty())
                    .collect();
                Ok(shortcuts)
            } else {
                Err("Failed to list shortcuts".to_string())
            }
        }
        Err(_) => Err("Failed to execute shortcuts list command".to_string()),
    }
}
