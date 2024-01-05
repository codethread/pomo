use tauri::State;

use crate::models;

#[tauri::command]
pub fn start(state: State<models::State>) {
    state.0.lock().unwrap().start();
}

#[tauri::command]
pub fn stop(state: State<models::State>) {
    state.0.lock().unwrap().stop();
}

#[tauri::command]
pub fn pause(state: State<models::State>) {
    state.0.lock().unwrap().pause();
}
