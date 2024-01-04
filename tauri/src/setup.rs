use std::sync::mpsc;

use tauri::{App, Manager, PhysicalPosition};

use crate::models::{Events, State};

pub fn handle_setup(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    app.listen_global("client-event", |event| {
        println!("got window my-event with payload {:?}", event.payload());
    });

    let (sender, reciever) = mpsc::channel::<Events>();

    let window = app.get_window("main").unwrap();
    let w = window.clone();

    // this thread is to send messages from the worker to the client
    let _emitter = std::thread::spawn(move || loop {
        let event = reciever.recv().unwrap();
        w.emit_all(&event.to_string(), event).unwrap();
    });

    app.manage(State::new(sender));

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
