import type { Metric } from '../components/MetricCard';

export const metrics: Metric[] = [
  { tone: 'cpu', label: 'CPU', value: 24, detail: 'Intel Core i7-13700K', history: [9, 14, 11, 19, 18, 27, 21, 24, 42, 34, 26, 24] },
  { tone: 'gpu', label: 'GPU', value: 16, detail: 'NVIDIA GeForce RTX 4070', history: [8, 12, 9, 15, 14, 30, 24, 17, 22, 16, 12, 16] },
  { tone: 'ram', label: 'RAM', value: 40, detail: '12.8 / 32 GiB', history: [31, 35, 33, 34, 38, 40, 38, 43, 41, 42, 39, 40] },
  { tone: 'network', label: 'Network', value: 820_000, displayValue: '↓ 820 kB/s', detail: '↑ 96 kB/s', detailTitle: 'Upload: 96 kB/s', history: [320_000, 500_000, 410_000, 760_000, 530_000, 820_000] },
];

export const demoStorage = { label: 'C:', usage: 62 };

export const systemDetails = [
  ['Device', 'WORKSTATION-01'],
  ['Operating system', 'Windows 11 Pro'],
  ['Architecture', '64-bit (x64)'],
  ['Uptime', '2 h 41 min'],
  ['Processor', 'Intel Core i7-13700K'],
  ['Memory', '32 GB DDR5 (6800 MT/s)'],
  ['Graphics cards', 'NVIDIA GeForce RTX 4070'],
  ['Motherboard', 'Demo motherboard'],
];

export const driveModels = ['(C:) Demo SSD 1 TB', '(D:) Demo SSD 500 GB'];
