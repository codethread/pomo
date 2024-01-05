use tauri::{App, Manager, PhysicalPosition};

use crate::models;

pub fn handle_setup(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let window = app.get_window("main").unwrap();
    app.manage(models::State::new(window.clone()));

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
