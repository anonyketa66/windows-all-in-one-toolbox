import { Network } from 'lucide-react';
import { useId } from 'react';
import { ChipIcon } from './HardwareIcons';

const chipLabels = { cpu: 'CPU', gpu: 'GPU', ram: 'RAM' } as const;

export type Metric = {
  tone: keyof typeof chipLabels | 'network';
  label: string;
  value: number | null;
  detail: string;
  detailTitle?: string;
  displayValue?: string;
  history?: number[];
};

export function MetricCard({ metric }: { metric: Metric }) {
  const gradient = useId();
  const history = metric.history ?? [];
  const ceiling = metric.tone === 'network' ? Math.max(1024, ...history) : 100;
  const points = history.length > 1 && history.map((value, index) => (
    `${index * 200 / (history.length - 1)},${46 - value / ceiling * 42}`
  )).join(' ');

  return (
    <article className="panel metric" data-tone={metric.tone}>
      <div className="metric-top">
        {metric.tone === 'network'
          ? <Network className="metric-icon" aria-hidden="true" />
          : <ChipIcon className="metric-icon" label={chipLabels[metric.tone]} />}
        <div>
          <h3>{metric.label}</h3>
          <div className="metric-reading">
            <strong>{metric.displayValue ?? (metric.value === null ? '—' : <>{metric.value}<span>%</span></>)}</strong>
            <p title={metric.detailTitle ?? metric.detail}>{metric.detail}</p>
          </div>
        </div>
      </div>
      {points ? (
        <svg className="sparkline" viewBox="0 0 200 48" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient></defs>
          <polygon points={`0,48 ${points} 200,48`} fill={`url(#${gradient})`} />
          <polyline points={points} vectorEffect="non-scaling-stroke" />
        </svg>
      ) : <div className="sparkline" aria-hidden="true" />}
    </article>
  );
}
