use serde::Serialize;

use crate::TimePayload;

#[derive(Debug, Clone, Serialize)]
pub enum EventsToClient {
    Tick(String),
    Complete(String),
    UpdateTime(TimePayload),
}

#[derive(Debug, Copy, Clone, Serialize)]
pub enum Events {
    Stop,
    RequestTime,
}
