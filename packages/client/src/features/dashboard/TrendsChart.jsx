import ChartCard from '../../components/ChartCard.jsx';

export default function TrendsChart({ data }) {
  const labels = data?.series?.map((s) => s.bucket) || [];
  const values = data?.series?.map((s) => s.value) || [];
  return <ChartCard title={`Trends: ${data?.metric}`} labels={labels} data={values} yLabel={data?.metric} />;
}

