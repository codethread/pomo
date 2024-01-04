use serde::Serialize;
use tauri::State;

use crate::models;

#[derive(Clone, Serialize, Default)]
struct Payload {
    foo: i32,
}

#[tauri::command]
pub fn start(state: State<models::State>) {
    state.start();
}

// pause
// stop
// update
