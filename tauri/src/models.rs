use std::sync::{mpsc, Mutex};

use lib::{App, Events};
use tauri::{Manager, Window};

pub struct State(pub Mutex<App>);

impl State {
    pub fn new(window: Window) -> Self {
        let (sender, reciever) = mpsc::channel::<lib::Events>();
        // this thread is to send messages from the worker to the client
        let _emitter = std::thread::spawn(move || loop {
            let event = reciever.recv().unwrap();
            window.emit_all(&event.to_string(), event).unwrap();
        });

        Self(Mutex::new(App::new(sender)))
    }
}
