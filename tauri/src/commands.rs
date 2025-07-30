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
    let output = Command::new("shortcuts").arg("run").arg(&mode).output();

    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let stderr = String::from_utf8_lossy(&output.stderr);
            
            println!("shortcuts run {} - stdout: {}", mode, stdout);
            println!("shortcuts run {} - stderr: {}", mode, stderr);
            
            if output.status.success() {
                Ok(())
            } else {
                let error_msg = if !stderr.is_empty() {
                    format!("Failed to run shortcut {}: {}", mode, stderr.trim())
                } else {
                    format!("Failed to run shortcut {} with exit code: {:?}", mode, output.status.code())
                };
                Err(error_msg)
            }
        }
        Err(e) => Err(format!("Failed to execute shortcut command {}: {}", mode, e)),
    }
}

#[tauri::command]
#[specta]
pub fn macos_shortcuts_list() -> Result<Vec<String>, String> {
    let output = Command::new("shortcuts").arg("list").output();

    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let stderr = String::from_utf8_lossy(&output.stderr);
            
            println!("shortcuts list - stdout: {}", stdout);
            println!("shortcuts list - stderr: {}", stderr);
            
            if output.status.success() {
                let shortcuts: Vec<String> = stdout
                    .lines()
                    .map(|line| line.trim().to_string())
                    .filter(|line| !line.is_empty())
                    .collect();
                Ok(shortcuts)
            } else {
                let error_msg = if !stderr.is_empty() {
                    format!("Failed to list shortcuts: {}", stderr.trim())
                } else {
                    format!("Failed to list shortcuts with exit code: {:?}", output.status.code())
                };
                Err(error_msg)
            }
        }
        Err(e) => Err(format!("Failed to execute shortcuts list command: {}", e)),
    }
}
