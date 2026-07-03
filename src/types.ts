export interface CpuInfo {
  usage: number;
  name: string;
  vendor_id: string;
  frequency: number;
}

export interface MemoryInfo {
  total: number;
  used: number;
  available: number;
  swap_total: number;
  swap_used: number;
}

export interface DiskInfo {
  name: string;
  mount_point: string;
  total: number;
  used: number;
  available: number;
}

export interface NetworkInfo {
  interface: string;
  received: number;
  transmitted: number;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_usage: number;
  memory: number;
  memory_percent: number;
  status: string;
  user: string;
  command: string;
  uptime: number;
}

export interface SystemSnapshot {
  cpus: CpuInfo[];
  memory: MemoryInfo;
  disks: DiskInfo[];
  networks: NetworkInfo[];
  processes: ProcessInfo[];
  uptime: number;
  total_processes: number;
  host_name: string;
  os_version: string;
  kernel_version: string;
}

export type Theme = 'dark' | 'light' | 'dracula' | 'nord';
export type SortField = 'cpu_usage' | 'memory_percent' | 'name' | 'pid';
export type Tab = 'processes' | 'system' | 'settings';
