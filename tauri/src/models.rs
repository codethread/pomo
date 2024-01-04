extern crate chrono;

use std::{sync::mpsc, thread::JoinHandle};

pub struct State {
    count: i32,
    _worker: JoinHandle<()>,
    sender: mpsc::Sender<Events>,
}

#[derive(Debug, Copy, Clone)]
pub enum Events {
    Start,
    Stop,
}

impl std::fmt::Display for Events {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Events::Start => "start",
            Events::Stop => "start",
        };
        write!(f, "{s}")
    }
}

impl State {
    pub fn new(sender: mpsc::Sender<Events>) -> Self {
        let (work_sender, work_reciever) = mpsc::channel::<Events>();

        let handle = std::thread::spawn(move || loop {
            println!("recieve");
            let event = work_reciever.recv().unwrap();
            sender.send(event).unwrap();
            println!("{event:?}");
        });

        Self {
            _worker: handle,
            sender: work_sender,
            count: 0,
        }
    }

    pub fn start(&self) {
        self.sender.send(Events::Start).unwrap();
        // let timer = timer::Timer::new();
        // let (tx, rx) = mpsc::channel();
        // timer.schedule_with_delay(chrono::Duration::seconds(3), move || {
        //     tx.send(()).unwrap();
        // });
        // println!("start");
    }

    pub fn inc(&self) {
        println!("{}", &self.count)
    }
}

struct Timer {
    minutes: u8,
    seconds: u8,
    timer: String,
    auto_start: bool,
}
