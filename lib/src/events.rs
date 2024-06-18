use serde::Serialize;

use crate::TimePayload;

#[derive(Debug, Clone, Serialize)]
pub enum EventsToClient {
    Tick(TimePayload),
}

#[derive(Debug, Copy, Clone, Serialize)]
pub enum Events {
    Stop,
    RequestTime,
    Pause,
    Play,
    Update(u8),
}
