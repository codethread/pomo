use std::{
    collections::HashMap,
    sync::{mpsc, Arc},
    thread::{sleep, JoinHandle},
    time::Duration,
};

use serde::Serialize;
pub struct App {
    _worker: JoinHandle<()>,
    /// handles for each timer
    timers: HashMap<u8, mpsc::Sender<Events>>,
    /// this is channel through which timers can communicate back to the worker
    sender: Arc<mpsc::Sender<Events>>,
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
    pub fn new(main_sender: mpsc::Sender<Events>) -> Self {
        let timers = HashMap::new();
        let (work_sender, work_reciever) = mpsc::channel::<Events>();

        let work_sender = Arc::new(work_sender);

        let handle = std::thread::spawn(move || loop {
            let event = work_reciever.recv().unwrap();
            match event {
                Events::Tick => {
                    main_sender.send(Events::Tick).unwrap();
                }
                _ => unreachable!(),
            }
        });

        Self {
            _worker: handle,
            timers,
            sender: work_sender,
        }
    }

    pub fn start(&mut self) {
        // one day will have multple timers, for now will just use one
        if self.timers.contains_key(&1) {
        } else {
            let sender = self.sender.clone();
            let (timer_sender, timer_reciever) = mpsc::channel::<Events>();

            std::thread::spawn(move || loop {
                sleep(Duration::new(1, 0));
                if let Ok(Events::Stop) = timer_reciever.try_recv() {
                    break;
                }
                sender.send(Events::Tick).unwrap();
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
