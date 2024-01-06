use crossbeam::channel;

use crate::events::Events;

pub struct Timer {
    pub id: String,
    pub channel: channel::Receiver<Events>,
    pub time: TimePayload,
    pub paused: bool,
}

impl Timer {
    pub fn countdown(&mut self) {
        self.time.countdown();
    }

    pub fn is_complete(&self) -> bool {
        self.time.complete
    }
}

#[derive(serde::Serialize, Clone, Debug)]
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
