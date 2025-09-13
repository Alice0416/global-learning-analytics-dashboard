import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import KPI from '../../components/KPI.jsx';
import TrendsChart from './TrendsChart.jsx';
import Heatmap from './Heatmap.jsx';
import { useState } from 'react';

export default function DashboardPage() {
  const [metric, setMetric] = useState('watch_time');
  const [bucket, setBucket] = useState('day');
  const kpis = useQuery({ queryKey: ['kpis'], queryFn: async () => (await client.get('/analytics/kpis')).data.data });
  const trends = useQuery({
    queryKey: ['trends', metric, bucket],
    queryFn: async () => (await client.get(`/analytics/trends?metric=${metric}&bucket=${bucket}`)).data.data
  });
  const popular = useQuery({ queryKey: ['popular'], queryFn: async () => (await client.get('/analytics/popular?top=16')).data.data });

  const heatItems = (popular.data || []).map((p) => ({ label: p.course.title, value: p.interactions }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPI label="Active Users" value={kpis.data?.activeUsers ?? '—'} />
        <KPI label="Completion Rate" value={kpis.data ? `${(kpis.data.completionRate * 100).toFixed(1)}%` : '—'} />
        <KPI label="Avg Watch Time" value={kpis.data ? `${kpis.data.avgWatchTime.toFixed(0)}s` : '—'} />
        <KPI label="Retention 7d" value={kpis.data ? `${(kpis.data.retention7d * 100).toFixed(1)}%` : '—'} />
        <KPI label="Retention 30d" value={kpis.data ? `${(kpis.data.retention30d * 100).toFixed(1)}%` : '—'} />
      </div>

      <div className="flex items-center gap-2">
        <label>Metric</label>
        <select className="select" value={metric} onChange={(e) => setMetric(e.target.value)}>
          <option value="completion_rate">completion_rate</option>
          <option value="watch_time">watch_time</option>
        </select>
        <label>Bucket</label>
        <select className="select" value={bucket} onChange={(e) => setBucket(e.target.value)}>
          <option value="day">day</option>
          <option value="week">week</option>
          <option value="month">month</option>
        </select>
      </div>

      <TrendsChart data={trends.data} />
      <Heatmap items={heatItems} />
    </div>
  );
}

