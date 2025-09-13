export default function Heatmap({ items = [] }) {
  // items: [{label, value}] simple grid visualization
  const max = Math.max(1, ...items.map((i) => i.value || 0));
  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="font-semibold mb-2">Engagement Heatmap</h3>
      <div className="grid grid-cols-8 gap-1">
        {items.map((i, idx) => (
          <div key={idx} className="h-6 w-6" title={`${i.label}: ${i.value}`} style={{ backgroundColor: `rgba(37,99,235,${(i.value || 0) / max})` }} />
        ))}
      </div>
    </div>
  );
}

