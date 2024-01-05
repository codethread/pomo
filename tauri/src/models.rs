use std::sync::{Arc, Mutex};

use lib::{App, EventsToClient};
use tauri::{Manager, Window};

pub struct State(pub Mutex<App>);

impl State {
    pub fn new(window: Window) -> Self {
        let emitter = move |e: EventsToClient| match e {
            EventsToClient::Tick(id) => {
                window.emit_all(&format!("tick_{}", &id), ()).unwrap();
            }
            EventsToClient::Complete(id) => {
                window.show().unwrap();
                window.emit_all(&format!("complete_{}", &id), ()).unwrap();
            }
            EventsToClient::UpdateTime(time) => {
                window
                    .emit_all(&format!("setTime_{}", &time.id), time)
                    .unwrap();
            }
        };

        Self(Mutex::new(App::new(Arc::new(emitter))))
    }
}
