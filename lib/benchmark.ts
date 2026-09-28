export const STACKS = ["Linux Kernel Networking", "SR-IOV", "DPDK"] as const;
export const IOS = ["sendmsg/recvmsg", "sendmmsg/recvmmsg", "io_uring"] as const;
export const TOPOLOGIES = ["Same Pod", "Same Worker Node", "Cross Worker Nodes"] as const;
export const PACKET_SIZES = [64, 256, 512, 1500] as const;

export type Stack = (typeof STACKS)[number];
export type IoMechanism = (typeof IOS)[number];
export type Topology = (typeof TOPOLOGIES)[number];
export type PacketSize = (typeof PACKET_SIZES)[number];

export type BenchmarkConfig = {
  stack: Stack;
  io: IoMechanism;
  topology: Topology;
  packetSize: PacketSize;
  policy: boolean;
  load: number;
};

export type Metrics = { throughput: number; latency: number; cpu: number; syscalls: number };

export const DEFAULT_CONFIG: BenchmarkConfig = {
  stack: "SR-IOV",
  io: "sendmmsg/recvmmsg",
  topology: "Same Worker Node",
  packetSize: 512,
  policy: true,
  load: 70,
};

const stackThroughput: Record<Stack, number> = { "Linux Kernel Networking": 13.8, "SR-IOV": 24.6, DPDK: 34.8 };
const stackLatency: Record<Stack, number> = { "Linux Kernel Networking": 17.4, "SR-IOV": 8.2, DPDK: 4.6 };
const packetFactor: Record<PacketSize, number> = { 64: 1, 256: 0.78, 512: 0.6, 1500: 0.34 };
const ioFactor: Record<IoMechanism, number> = { "sendmsg/recvmsg": 0.82, "sendmmsg/recvmmsg": 0.95, io_uring: 1.04 };
const topologyFactor: Record<Topology, number> = { "Same Pod": 1.08, "Same Worker Node": 0.96, "Cross Worker Nodes": 0.76 };
const topologyLatency: Record<Topology, number> = { "Same Pod": 1.4, "Same Worker Node": 7.2, "Cross Worker Nodes": 22.8 };

export function calculateMetrics(config: BenchmarkConfig): Metrics {
  const load = config.load / 100;
  const throughput = stackThroughput[config.stack] * packetFactor[config.packetSize] * ioFactor[config.io] * topologyFactor[config.topology] * (config.policy ? 0.91 : 1) * (0.22 + load * 0.78);
  const packetLatency = ({ 64: 0, 256: 1.8, 512: 3.9, 1500: 8.4 } as const)[config.packetSize];
  const ioLatency = ({ "sendmsg/recvmsg": 5.2, "sendmmsg/recvmmsg": 2.4, io_uring: 1.1 } as const)[config.io];
  const latency = stackLatency[config.stack] + packetLatency + ioLatency + topologyLatency[config.topology] + (config.policy ? 3.6 : 0) + 2.2 + Math.pow(load, 3.2) * 30;
  const cpuBase = ({ "Linux Kernel Networking": 34, "SR-IOV": 25, DPDK: 42 } as const)[config.stack];
  const cpu = Math.min(98, cpuBase + load * ({ "Linux Kernel Networking": 48, "SR-IOV": 35, DPDK: 29 } as const)[config.stack] + (config.io === "sendmsg/recvmsg" ? 7 : config.io === "io_uring" ? -3 : 0) + (config.policy ? 4 : 0) + (config.topology === "Cross Worker Nodes" ? 5 : 0));
  const syscallFactor = ({ "sendmsg/recvmsg": 1.9, "sendmmsg/recvmmsg": 0.42, io_uring: 0.14 } as const)[config.io];
  const stackSyscallFactor = ({ "Linux Kernel Networking": 1, "SR-IOV": 0.74, DPDK: 0.09 } as const)[config.stack];
  return {
    throughput: Number(throughput.toFixed(2)),
    latency: Number(latency.toFixed(1)),
    cpu: Number(cpu.toFixed(1)),
    syscalls: Number((throughput * syscallFactor * stackSyscallFactor).toFixed(2)),
  };
}

export function packetSeries(config: BenchmarkConfig) {
  return PACKET_SIZES.map((size) => ({ packetSize: `${size} B`, throughput: calculateMetrics({ ...config, packetSize: size }).throughput }));
}

export function loadSeries(config: BenchmarkConfig) {
  return [10, 25, 40, 55, 70, 85, 100].map((load) => ({ load: `${load}%`, latency: calculateMetrics({ ...config, load }).latency }));
}
