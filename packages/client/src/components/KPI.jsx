export default function KPI({ label, value }) {
  return (
    <div className="bg-white shadow rounded p-4 text-center">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

