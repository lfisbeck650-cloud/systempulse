use crate::system::{AppSystem, SystemSnapshot};
use tauri::State;

#[tauri::command]
pub fn get_system_snapshot(system: State<AppSystem>) -> SystemSnapshot {
    system.refresh()
}

#[tauri::command]
pub fn kill_process(system: State<AppSystem>, pid: u32) -> Result<(), String> {
    system.kill_process(pid)
}
