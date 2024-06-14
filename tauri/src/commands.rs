use lib::TimePayload;
use tauri::State;

use crate::models;

#[tauri::command]
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
pub fn stop(state: State<models::State>, id: String) {
    state.0.lock().unwrap().stop(id);
}

#[tauri::command]
pub fn pause(state: State<models::State>, id: String) {
    state.0.lock().unwrap().pause(id);
}

#[tauri::command]
pub fn play(state: State<models::State>, id: String) {
    state.0.lock().unwrap().play(id);
}

#[tauri::command]
pub fn update(state: State<models::State>, id: String, duration: u8) {
    state.0.lock().unwrap().update(id, duration);
}
