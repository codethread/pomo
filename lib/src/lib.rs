use std::{
    collections::HashMap,
    sync::{mpsc, Arc},
    thread::sleep,
    time::Duration,
};

mod events;
use events::Events;
pub use events::EventsToClient;

type Emit = Arc<dyn Fn(EventsToClient) + Send + Sync>;

pub struct App {
    /// handles for each timer
    timers: HashMap<u8, mpsc::Sender<Events>>,
    /// this is a callback through which the worker communicates with tauri
    emitter: Emit,
}

impl App {
    pub fn new(emitter: Emit) -> Self {
        let timers = HashMap::new();

        Self { timers, emitter }
    }

    pub fn start(&mut self) {
        // one day will have multple timers, for now will just use one
        if self.timers.contains_key(&1) {
        } else {
            let emitter = self.emitter.clone();
            let (timer_sender, timer_reciever) = mpsc::channel::<Events>();

            std::thread::spawn(move || loop {
                sleep(Duration::new(1, 0));
                if let Ok(Events::Stop) = timer_reciever.try_recv() {
                    break;
                }
                emitter(EventsToClient::Tick);
            });

            self.timers.insert(1, timer_sender);
        }
    }

    pub fn stop(&mut self) {
        if let Some(timer) = self.timers.get_mut(&1) {
            timer.send(Events::Stop).unwrap();
            self.timers.remove(&1).unwrap();
        }
    }

    pub fn pause(&self) {}
}
