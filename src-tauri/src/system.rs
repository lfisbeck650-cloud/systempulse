use serde::Serialize;
use std::sync::RwLock;
use std::time::{SystemTime, UNIX_EPOCH};
use sysinfo::{
    CpuRefreshKind, Disks, MemoryRefreshKind, Networks, Pid, ProcessRefreshKind, RefreshKind,
    System,
};

#[derive(Clone, Serialize)]
pub struct CpuInfo {
    pub usage: f32,
    pub name: String,
    pub vendor_id: String,
    pub frequency: u64,
}

#[derive(Clone, Serialize)]
pub struct MemoryInfo {
    pub total: u64,
    pub used: u64,
    pub available: u64,
    pub swap_total: u64,
    pub swap_used: u64,
}

#[derive(Clone, Serialize)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total: u64,
    pub used: u64,
    pub available: u64,
}

#[derive(Clone, Serialize)]
pub struct NetworkInfo {
    pub interface: String,
    pub received: u64,
    pub transmitted: u64,
}

#[derive(Clone, Serialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub memory: u64,
    pub memory_percent: f32,
    pub status: String,
    pub user: String,
    pub command: String,
    pub uptime: u64,
}

#[derive(Clone, Serialize)]
pub struct SystemSnapshot {
    pub cpus: Vec<CpuInfo>,
    pub memory: MemoryInfo,
    pub disks: Vec<DiskInfo>,
    pub networks: Vec<NetworkInfo>,
    pub processes: Vec<ProcessInfo>,
    pub uptime: u64,
    pub total_processes: usize,
    pub host_name: String,
    pub os_version: String,
    pub kernel_version: String,
}

pub struct AppSystem {
    pub system: RwLock<System>,
    pub disks: RwLock<Disks>,
    pub networks: RwLock<Networks>,
    pub host_name: String,
    pub os_version: String,
    pub kernel_version: String,
}

impl AppSystem {
    pub fn new() -> Self {
        let mut sys = System::new_all();
        sys.refresh_cpu_usage();

        let host_name = System::host_name().unwrap_or_default();
        let os_version = System::long_os_version().unwrap_or_default();
        let kernel_version = System::kernel_version().unwrap_or_default();
        let disks = Disks::new_with_refreshed_list();
        let networks = Networks::new_with_refreshed_list();

        Self {
            system: RwLock::new(sys),
            disks: RwLock::new(disks),
            networks: RwLock::new(networks),
            host_name,
            os_version,
            kernel_version,
        }
    }

    pub fn refresh(&self) -> SystemSnapshot {
        let mut sys = self.system.write().unwrap_or_else(|e| e.into_inner());

        let refresh_kind = RefreshKind::nothing()
            .with_cpu(CpuRefreshKind::everything())
            .with_memory(MemoryRefreshKind::everything())
            .with_processes(ProcessRefreshKind::everything());
        sys.refresh_specifics(refresh_kind);
        sys.refresh_cpu_usage();

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        let cpus: Vec<CpuInfo> = sys
            .cpus()
            .iter()
            .map(|c| CpuInfo {
                usage: c.cpu_usage(),
                name: c.name().to_string(),
                vendor_id: c.vendor_id().to_string(),
                frequency: c.frequency(),
            })
            .collect();

        let memory = MemoryInfo {
            total: sys.total_memory(),
            used: sys.used_memory(),
            available: sys.available_memory(),
            swap_total: sys.total_swap(),
            swap_used: sys.used_swap(),
        };

        let total_mem = sys.total_memory();

        let processes: Vec<ProcessInfo> = {
            let procs = sys.processes();
            let mut vec = Vec::with_capacity(procs.len());
            for (pid, proc) in procs.iter() {
                let status = format!("{:?}", proc.status());
                let mem_kb = proc.memory();
                let mem_pct = if total_mem > 0 {
                    ((mem_kb * 1024) as f32 / total_mem as f32) * 100.0
                } else {
                    0.0
                };
                let start = proc.start_time();
                let uptime = if start > 0 && now > start {
                    now - start
                } else {
                    0
                };
                vec.push(ProcessInfo {
                    pid: pid.as_u32(),
                    name: proc.name().to_string_lossy().to_string(),
                    cpu_usage: proc.cpu_usage(),
                    memory: mem_kb,
                    memory_percent: mem_pct,
                    status,
                    user: proc.user_id().map(|u| u.to_string()).unwrap_or_default(),
                    command: proc
                        .cmd()
                        .iter()
                        .map(|s| s.to_string_lossy())
                        .collect::<Vec<_>>()
                        .join(" "),
                    uptime,
                });
            }
            vec
        };

        let uptime = System::uptime();

        let disks = {
            let mut disks = self.disks.write().unwrap_or_else(|e| e.into_inner());
            disks.refresh(true);
            disks
                .iter()
                .map(|d| DiskInfo {
                    name: d.name().to_string_lossy().to_string(),
                    mount_point: d.mount_point().to_string_lossy().to_string(),
                    total: d.total_space(),
                    used: d.total_space() - d.available_space(),
                    available: d.available_space(),
                })
                .collect()
        };

        let networks = {
            let mut networks = self.networks.write().unwrap_or_else(|e| e.into_inner());
            networks.refresh(true);
            networks
                .iter()
                .map(|(name, data)| NetworkInfo {
                    interface: name.to_string(),
                    received: data.total_received(),
                    transmitted: data.total_transmitted(),
                })
                .collect()
        };

        SystemSnapshot {
            cpus,
            memory,
            disks,
            networks,
            total_processes: processes.len(),
            processes,
            uptime,
            host_name: self.host_name.clone(),
            os_version: self.os_version.clone(),
            kernel_version: self.kernel_version.clone(),
        }
    }

    pub fn kill_process(&self, pid: u32) -> Result<(), String> {
        let sys = self.system.read().unwrap_or_else(|e| e.into_inner());
        match sys.process(Pid::from_u32(pid)) {
            Some(process) => {
                let name = process.name().to_string_lossy().to_string();
                if !process.kill() {
                    Err(format!("Failed to kill process {} ({})", pid, name))
                } else {
                    Ok(())
                }
            }
            None => Err(format!("Process with PID {} not found", pid)),
        }
    }
}
