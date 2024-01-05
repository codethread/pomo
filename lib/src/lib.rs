use std::{
    collections::HashMap,
    sync::{mpsc, Arc},
    thread::{sleep, JoinHandle},
    time::Duration,
};

use serde::Serialize;

type Emit = Arc<dyn Fn(Events) + Send + Sync>;

pub struct App {
    /// handles for each timer
    timers: HashMap<u8, mpsc::Sender<Events>>,
    /// this is a callback through which the worker communicates with tauri
    emitter: Emit,
}

#[derive(Debug, Copy, Clone, Serialize)]
pub enum Events {
    Start,
    Stop,
    Tick,
}

impl std::fmt::Display for Events {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Events::Start => "start",
            Events::Stop => "stop",
            Events::Tick => "tick",
        };
        write!(f, "{s}")
    }
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
                emitter(Events::Tick);
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
