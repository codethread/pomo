use serde::Serialize;
use tauri::State;

use crate::models;

#[tauri::command]
pub fn start(state: State<models::State>) {
    let mut s = state.0.lock().unwrap();
    s.start();
}

#[tauri::command]
pub fn stop(state: State<models::State>) {
    let mut s = state.0.lock().unwrap();
    s.stop();
}

// pause
// stop
// update
