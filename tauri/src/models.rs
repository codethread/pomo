use std::sync::{Arc, Mutex};

use lib::{App, EventsToClient};
use tauri::{Manager, SystemTrayHandle, Window};

use crate::tray::get_icon;

pub struct State(pub Mutex<App>);

impl State {
    pub fn new(window: Window, tray: SystemTrayHandle) -> Self {
        let emitter = move |e: EventsToClient| match e {
            EventsToClient::Tick(time) => {
                let emit = || {
                    #[cfg(debug_assertions)]
                    {
                        println!("tick {:?}", &time);
                    }
                    if time.complete {
                        tray.set_icon(get_icon(crate::tray::Icons::Ready));
                    }
                    window
                        .emit_all(&format!("tick_{}", &time.id), time.clone())
                        .unwrap();
                };

                match (window.is_visible().unwrap(), time.complete) {
                    (true, _) => emit(),
                    (false, true) => {
                        window.show().unwrap();
                        emit();
                    }
                    (false, false) => {
                        // send a forceful tick to the client every minute to satisfy integrations
                        if time.seconds == 0 {
                            emit();
                        }
                    }
                }
            }
        };

        Self(Mutex::new(App::new(Arc::new(emitter))))
    }
}
