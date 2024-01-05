use serde::Serialize;
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

#[derive(Serialize, Clone, Debug)]
pub struct TimePayload {
    pub id: String,
    pub seconds: u8,
    pub minutes: u8,
    pub complete: bool,
}

impl TimePayload {
    pub fn new(minutes: u8, seconds: u8, id: String) -> Self {
        Self {
            id,
            minutes,
            seconds,
            complete: false,
        }
    }

    fn countdown(&mut self) {
        if self.complete {
            return;
        }

        match (self.minutes, self.seconds) {
            (0, 1) => {
                self.seconds = 0;
                self.complete = true
            }
            (_, 0) => {
                self.seconds = 59;
                self.minutes -= 1
            }
            _ => self.seconds -= 1,
        }
    }
}

pub struct Timer {
    id: String,
    channel: mpsc::Receiver<Events>,
    time: TimePayload,
}

impl Timer {
    pub fn countdown(&mut self) {
        self.time.countdown();
    }

    pub fn is_complete(&self) -> bool {
        self.time.complete
    }
}

pub struct App {
    /// handles for each timer
    timers: HashMap<String, mpsc::Sender<Events>>,
    /// this is a callback through which the worker communicates with tauri
    emitter: Emit,
}

impl App {
    pub fn new(emitter: Emit) -> Self {
        let timers = HashMap::new();

        Self { timers, emitter }
    }

    pub fn start(&mut self, time: TimePayload) {
        let id = time.id.clone();
        // one day will have multple timers, for now will just use one
        if self.timers.contains_key(&id) {
            println!("timer exists {}", &id)
        } else {
            let emitter = self.emitter.clone();
            let (timer_sender, timer_reciever) = mpsc::channel::<Events>();

            std::thread::spawn(move || {
                let mut t = Timer {
                    id: time.id.clone(),
                    channel: timer_reciever,
                    time,
                };
                loop {
                    #[cfg(debug_assertions)]
                    {
                        // 100ms
                        sleep(Duration::new(0, 100_000_000));
                    }
                    #[cfg(not(debug_assertions))]
                    {
                        sleep(Duration::new(1, 0));
                    }
                    // TODO this is far from ideal as there is potential for sleep
                    // need to use a channel to recieve this at a later date
                    if let Ok(event) = t.channel.try_recv() {
                        match event {
                            Events::Stop => break,
                            Events::RequestTime => {
                                emitter(EventsToClient::UpdateTime(t.time.clone()))
                            }
                        }
                    }
                    t.countdown();
                    println!("{} tick {:?}", t.id, t.time);
                    emitter(EventsToClient::Tick(t.id.clone()));

                    if t.is_complete() {
                        emitter(EventsToClient::Complete(t.id.clone()));
                        break;
                    }
                }
            });

            self.timers.insert(id, timer_sender);
        }
    }

    pub fn stop(&mut self, id: String) {
        if let Some(timer) = self.timers.get_mut(&id) {
            timer.send(Events::Stop).unwrap();
            self.timers.remove(&id).unwrap();
        }
    }

    pub fn time(&self, id: String) {
        if let Some(timer) = self.timers.get(&id) {
            timer.send(Events::RequestTime).unwrap();
        }
    }

    pub fn pause(&self) {}
}
