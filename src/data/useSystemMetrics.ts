import { invoke, isTauri } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import type { Metric } from '../components/MetricCard';
import { demoStorage, driveModels as demoDrives, metrics as demoMetrics, systemDetails as demoDetails } from './demoSystem';
import { formatMotherboardName, formatProcessorName } from './hardwareNames';

type MemoryModule = { capacity: number | null; memoryType: number | null; speed: number | null };

type Snapshot = {
  cpu: number | null;
  network: { download: number; upload: number } | null;
  gpu: { name: string; usage: number; temperature: number | null } | null;
  memoryUsed: number;
  memoryTotal: number;
  storage: { volume: string; used: number; total: number } | null;
  deviceName: string | null;
  osVersion: string | null;
  architecture: string;
  uptimeSeconds: number;
  processorModel: string | null;
  hardware: { graphics: string[]; motherboard: string[]; drives: string[]; memoryModules: MemoryModule[] } | null;
};

type Reading = {
  snapshot: Snapshot;
  cpuHistory: number[];
  networkHistory: number[];
  gpuHistory: number[];
  memoryHistory: number[];
};

const format = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const gib = (bytes: number) => format.format(bytes / 1024 ** 3);
const percent = (used: number, total: number) => Math.min(100, Math.round(100 * used / total));

function formatRate(bytes: number) {
  if (bytes >= 1_000_000_000) return `${format.format(bytes / 1_000_000_000)} GB/s`;
  if (bytes >= 1_000_000) return `${format.format(bytes / 1_000_000)} MB/s`;
  if (bytes >= 1_000) return `${format.format(bytes / 1_000)} kB/s`;
  return `${Math.round(bytes)} B/s`;
}
const memoryTypes = new Map([
  [18, 'DDR'], [19, 'DDR2'], [24, 'DDR3'], [26, 'DDR4'],
  [27, 'LPDDR'], [28, 'LPDDR2'], [29, 'LPDDR3'], [30, 'LPDDR4'],
  [34, 'DDR5'], [35, 'LPDDR5'],
]);

function formatInstalledMemory(modules: MemoryModule[], usable: number) {
  const [first] = modules;
  const installed = modules.every(({ capacity }) => capacity && capacity > 0)
    ? modules.reduce((total, { capacity }) => total + (capacity ?? 0), 0)
    : 0;
  if (!first || !installed) return usable ? `${gib(usable)} GiB RAM` : '—';

  const type = modules.every(({ memoryType }) => memoryType === first.memoryType)
    ? memoryTypes.get(first.memoryType ?? 0)
    : undefined;
  const speed = type && first.speed && modules.every(({ speed }) => speed === first.speed)
    ? ` (${first.speed} MT/s)`
    : '';
  return `${gib(installed)} GB ${type ?? 'RAM'}${speed}`;
}

function append(history: number[] = [], value: number | null) {
  return value === null ? history : [...history.slice(-29), value];
}

function formatUptime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor(minutes / 60) % 24;
  return days > 0 ? `${days} d ${hours} h ${minutes % 60} min` : `${hours} h ${minutes % 60} min`;
}

export function useSystemMetrics(): {
  metrics: Metric[];
  details: string[][];
  drives: string[];
  storage: { label: string; usage: number } | null;
  mode: 'demo' | 'loading' | 'live' | 'error';
  status: string;
} {
  const desktop = isTauri();
  const [reading, setReading] = useState<Reading | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!desktop) return;

    let stopped = false;
    let timer = window.setTimeout(poll, 0);

    async function poll() {
      try {
        const snapshot = await invoke<Snapshot>('read_metrics');
        if (stopped) return;
        setReading((previous) => ({
          snapshot,
          cpuHistory: append(previous?.cpuHistory, snapshot.cpu),
          networkHistory: snapshot.network ? append(previous?.networkHistory, snapshot.network.download) : [],
          gpuHistory: snapshot.gpu ? append(previous?.gpuHistory, snapshot.gpu.usage) : [],
          memoryHistory: append(previous?.memoryHistory, snapshot.memoryTotal
            ? percent(snapshot.memoryUsed, snapshot.memoryTotal) : null),
        }));
        setFailed(false);
      } catch {
        if (stopped) return;
        setReading(null);
        setFailed(true);
      }
      timer = window.setTimeout(poll, 2000);
    }

    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [desktop]);

  if (!desktop) {
    return { metrics: demoMetrics, details: demoDetails, drives: demoDrives, storage: demoStorage, mode: 'demo', status: 'Demo data' };
  }

  const snapshot = reading?.snapshot;
  const processorName = snapshot?.processorModel ? formatProcessorName(snapshot.processorModel) : '';
  const gpu = snapshot?.gpu;
  const storage = snapshot?.storage;
  const network = snapshot?.network;
  const waiting = failed ? 'Reading unavailable' : 'Reading data…';
  const hardware = snapshot?.hardware;
  const drives = hardware?.drives.map((model) => model.trim()).filter(Boolean) ?? [];
  const hardwareNames = (models: string[] | undefined) => {
    if (!hardware) return failed ? 'Unavailable' : 'Loading…';
    return models?.map((model) => model.trim()).filter(Boolean).join(' · ') || 'Unavailable';
  };

  return {
    mode: failed ? 'error' : snapshot ? 'live' : 'loading',
    status: failed ? 'Readings unavailable' : snapshot ? 'Live readings' : 'Starting measurements…',
    drives: drives.length ? drives : [hardwareNames(undefined)],
    storage: storage ? { label: storage.volume.replace(/[\\/]+$/, ''), usage: percent(storage.used, storage.total) } : null,
    details: [
      ['Device', snapshot?.deviceName || '—'],
      ['Operating system', snapshot?.osVersion || '—'],
      ['Architecture', snapshot?.architecture || '—'],
      ['Uptime', snapshot ? formatUptime(snapshot.uptimeSeconds) : '—'],
      ['Processor', processorName || (snapshot || failed ? 'Unavailable' : 'Loading…')],
      ['Memory', formatInstalledMemory(hardware?.memoryModules ?? [], snapshot?.memoryTotal ?? 0)],
      ['Graphics cards', hardwareNames(hardware?.graphics)],
      ['Motherboard', hardwareNames(hardware?.motherboard.map(formatMotherboardName))],
    ],
    metrics: [
      {
        tone: 'cpu',
        label: 'CPU',
        value: snapshot?.cpu == null ? null : Math.round(snapshot.cpu),
        detail: processorName || (snapshot?.cpu == null ? waiting : 'Total CPU usage'),
        history: reading?.cpuHistory,
      },
      {
        tone: 'gpu',
        label: 'GPU',
        value: gpu?.usage ?? null,
        detail: gpu
          ? gpu.temperature === null ? gpu.name : `${gpu.temperature} °C`
          : snapshot ? 'GPU reading unavailable' : waiting,
        detailTitle: gpu?.name,
        history: reading?.gpuHistory,
      },
      {
        tone: 'ram',
        label: 'RAM',
        value: snapshot?.memoryTotal ? percent(snapshot.memoryUsed, snapshot.memoryTotal) : null,
        detail: snapshot?.memoryTotal
          ? `${gib(snapshot.memoryUsed)} / ${gib(snapshot.memoryTotal)} GiB`
          : snapshot ? 'Memory data unavailable' : waiting,
        history: reading?.memoryHistory,
      },
      {
        tone: 'network',
        label: 'Network',
        value: network?.download ?? null,
        displayValue: network ? `↓ ${formatRate(network.download)}` : undefined,
        detail: network ? `↑ ${formatRate(network.upload)}` : 'Waiting for network data',
        detailTitle: network ? `Download: ${formatRate(network.download)} · Upload: ${formatRate(network.upload)}` : undefined,
        history: reading?.networkHistory,
      },
    ],
  };
}
