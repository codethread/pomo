use serde::Serialize;

#[derive(Debug, Copy, Clone, Serialize)]
pub enum EventsToClient {
    Tick,
}

impl std::fmt::Display for EventsToClient {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            EventsToClient::Tick => "tick",
        };
        write!(f, "{s}")
    }
}

#[derive(Debug, Copy, Clone, Serialize)]
pub enum Events {
    Stop,
}
