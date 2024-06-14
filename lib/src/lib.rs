use crossbeam::channel;
use events::Events;
pub use events::EventsToClient;
use std::{collections::HashMap, sync::Arc, thread::sleep, time::Duration};
pub use timer::TimePayload;

mod events;
mod timer;

type Emit = Arc<dyn Fn(EventsToClient) + Send + Sync>;

pub struct App {
    /// handles for each timer
    timers: HashMap<String, channel::Sender<Events>>,
    /// this is a callback through which the worker communicates with tauri
    emitter: Emit,
    /// temporary hack to figure out the current running timer, will do something more robust in
    /// future when there are multiple timers
    current: Option<String>,
}

impl App {
    pub fn new(emitter: Emit) -> Self {
        let timers = HashMap::new();

        Self {
            timers,
            emitter,
            current: None,
        }
    }

    pub fn start(&mut self, time: timer::TimePayload) {
        let id = time.id.clone();
        // one day will have multple timers, for now will just use one
        if self.timers.contains_key(&id) {
            println!("timer exists {}", &id)
        } else {
            let emitter = self.emitter.clone();
            let (timer_sender, timer_reciever) = channel::unbounded::<Events>();

            let t = timer::Timer {
                id: time.id.clone(),
                channel: timer_reciever,
                time,
                paused: true,
            };
            std::thread::spawn(move || run_timer(t, emitter));

            self.current = Some(id.clone());
            self.timers.insert(id, timer_sender);
        }
    }

    pub fn stop(&mut self, id: String) {
        if let Some(timer) = self.timers.get_mut(&id) {
            timer.send(Events::Stop).unwrap();
            self.timers.remove(&id).unwrap();
            self.current = None;
        }
    }

    pub fn time(&self, _: String) {
        if let Some(current) = &self.current {
            if let Some(timer) = self.timers.get(current) {
                timer.send(Events::RequestTime).unwrap();
            }
        }
    }

    pub fn pause(&self, id: String) {
        if let Some(timer) = self.timers.get(&id) {
            timer.send(Events::Pause).unwrap();
        }
    }

    pub fn play(&self, id: String) {
        if let Some(timer) = self.timers.get(&id) {
            timer.send(Events::Play).unwrap();
        }
    }

    pub fn update(&self, id: String, duration: u8) {
        if let Some(timer) = self.timers.get(&id) {
            timer.send(Events::Update(duration)).unwrap();
        }
    }
}

fn run_timer(mut timer: timer::Timer, emitter: Emit) {
    loop {
        if timer.paused {
            match timer.channel.recv().unwrap() {
                Events::Stop => {
                    continue;
                }
                Events::RequestTime => {
                    emitter(EventsToClient::UpdateTime(timer.time.clone()));
                    continue;
                }
                Events::Pause => {
                    continue;
                }
                Events::Play => {
                    timer.paused = false;
                }
                Events::Update(duration) => {
                    timer.update(duration);
                    continue;
                }
            }
        }
        #[cfg(debug_assertions)]
        {
            sleep(Duration::from_millis(100))
            // sleep(Duration::from_millis(10))
        }
        #[cfg(not(debug_assertions))]
        {
            sleep(Duration::new(1, 0));
        }
        // TODO this is far from ideal as there is potential for sleep
        // need to use a channel to recieve this at a later date
        if let Ok(event) = timer.channel.try_recv() {
            match event {
                Events::Stop => break,
                Events::Pause => {
                    timer.paused = true;
                    continue;
                }
                Events::RequestTime => {
                    emitter(EventsToClient::UpdateTime(timer.time.clone()));
                }
                Events::Play => (),
                Events::Update(_) => (),
            }
        }
        timer.countdown();
        println!("{} tick {:?}", timer.id, timer.time);
        emitter(EventsToClient::Tick(timer.id.clone()));

        if timer.is_complete() {
            emitter(EventsToClient::Complete(timer.id.clone()));
            break;
        }
    }
    // TODO
    // do something to remove this from the parent
}
