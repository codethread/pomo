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
    app.tray_handle().set_icon(get_icon(Icons::Ready));
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
    app.tray_handle().set_icon(get_icon(Icons::Running));
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
