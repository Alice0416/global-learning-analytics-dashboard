import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';

export default function CourseDetail() {
  const { id } = useParams();
  const { data } = useQuery({ queryKey: ['course', id], queryFn: async () => (await client.get(`/courses/${id}`)).data.data });
  if (!data) return 'Loading...';
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-semibold">{data.title}</h2>
      <p className="text-gray-600">Code: {data.code}</p>
      <p className="text-gray-600">Difficulty: {data.difficulty}</p>
      <p className="text-gray-600">Tags: {(data.tags || []).join(', ')}</p>
    </div>
  );
}

