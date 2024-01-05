use std::sync::{mpsc, Arc, Mutex};

use lib::{App, Events};
use tauri::{Manager, Window};

pub struct State(pub Mutex<App>);

impl State {
    pub fn new(window: Window) -> Self {
        let emitter = move |e: Events| {
            window.emit_all(&e.to_string(), e).unwrap();
        };

        Self(Mutex::new(App::new(Arc::new(emitter))))
    }
}
