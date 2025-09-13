import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import Table from '../../components/Table.jsx';
import { Link } from 'react-router-dom';

export default function CoursesPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['courses'], queryFn: async () => (await client.get('/courses')).data.data });
  const enroll = useMutation({
    mutationFn: async (courseId) => (await client.post('/courses/enroll', { courseId })).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] })
  });

  const columns = [
    { key: 'title', title: 'Title' },
    { key: 'difficulty', title: 'Difficulty' },
    { key: 'tags', title: 'Tags', render: (v) => (v || []).join(', ') },
    {
      key: '_id',
      title: 'Action',
      render: (v, row) => (
        <div className="flex gap-2">
          <Link to={`/courses/${v}`} className="text-blue-600">Detail</Link>
          <button className="text-green-600" onClick={() => enroll.mutate(v)} disabled={enroll.isPending}>
            Enroll
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Courses</h2>
      <Table columns={columns} data={data || []} />
    </div>
  );
}

