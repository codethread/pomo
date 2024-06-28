use lib::TimePayload;
use tauri::{AppHandle, State};

use crate::{
    models,
    tray::{get_icon, Icons},
};

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
pub fn stop(app: AppHandle, state: State<models::State>, id: String) {
    state.0.lock().unwrap().stop(id);
    app.tray_handle().set_icon(get_icon(Icons::Ready));
}

#[tauri::command]
pub fn pause(state: State<models::State>, id: String) {
    state.0.lock().unwrap().pause(id);
}

#[tauri::command]
pub fn play(app: AppHandle, state: State<models::State>, id: String) {
    state.0.lock().unwrap().play(id);
    app.tray_handle().set_icon(get_icon(Icons::Running));
}

#[tauri::command]
pub fn update(state: State<models::State>, id: String, duration: u8) {
    state.0.lock().unwrap().update(id, duration);
}
