use std::sync::mpsc;

use serde::Serialize;
use tauri::{App, Manager, PhysicalPosition};

use crate::models::{Events, State};

#[derive(Serialize, Clone)]
struct Payload {
    foo: i32,
}

pub fn handle_setup(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    app.listen_global("client-event", |event| {
        println!("got window my-event with payload {:?}", event.payload());
    });

    let (main_sender, main_reciever) = mpsc::channel::<Events>();

    let window = app.get_window("main").unwrap();
    let w = window.clone();

    let _emitter = std::thread::spawn(move || loop {
        println!("emit");
        let event = main_reciever.recv().unwrap();
        w.emit_all("Start", Payload { foo: 3 }).unwrap();
        println!("emitt: {event:?}");
    });

    let state = State::new(main_sender);
    app.manage(state);

    // hide icon from dock
    app.set_activation_policy(tauri::ActivationPolicy::Accessory);

    #[cfg(debug_assertions)]
    {
        let monitor = window.current_monitor().unwrap().unwrap();
        let win_width = window.inner_size().unwrap().width;

        window.open_devtools();

        // top right, out the way ish
        window.set_position(PhysicalPosition {
            x: monitor.size().width - win_width,
            y: 0,
        })?;
        window.show()?;
    }
    Ok(())
}
