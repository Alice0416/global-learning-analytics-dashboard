import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ChartCard({ title, labels, data, yLabel }) {
  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: yLabel,
              data,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }
          ]
        }}
        options={{ responsive: true, maintainAspectRatio: false }}
        height={240}
      />
    </div>
  );
}

