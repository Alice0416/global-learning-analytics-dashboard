import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';

export default function RecommendPage() {
  const { data } = useQuery({ queryKey: ['recommend'], queryFn: async () => (await client.get('/recommend/me?top=8')).data.data });
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Personalized Recommendations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(data || []).map((r, i) => (
          <div key={i} className="bg-white shadow rounded p-4">
            <div className="font-semibold">{r.course.title}</div>
            <div className="text-gray-600 text-sm">{r.course.tags?.join(', ')}</div>
            <div className="text-blue-600 text-sm mt-2">{r.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

