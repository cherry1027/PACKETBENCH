# PacketBench Lab

A lightweight research and portfolio prototype for exploring cloud-native networking options for telecom Packet Core workloads.

🔗 **Live Demo:** https://packetbench-lab.charanvaranasi44.workers.dev

## Features

### Benchmark Lab

- Compare Linux Kernel Networking, SR-IOV, and DPDK
- Select I/O mechanisms:
  - `sendmsg/recvmsg`
  - `sendmmsg/recvmmsg`
  - `io_uring`
- Test different Kubernetes topologies
- Configure packet size, network policy, and traffic load
- View synthetic throughput, latency, CPU usage, and syscall rate
- Interactive throughput and latency charts
- Deterministic results for reproducible demonstrations

### Stack Decision Explorer

- Workload presets for:
  - Ultra-low latency
  - Maximum throughput
  - CPU efficiency
  - Operational simplicity
- Comparison table covering performance and operational trade-offs
- CPU usage versus throughput scatter plot
- Same Pod, Same Worker, and Cross Worker topology comparison
- Deterministic rule-based recommendations
- Reasons and trade-offs for each recommendation

## Technology

- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide icons
- Cloudflare Workers
- Wrangler
