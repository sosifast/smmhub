"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export default function TrafficChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
    datasets: [
      {
        fill: true,
        data: [12, 18, 15, 24, 21, 27, 20],
        borderColor: '#2563eb', // brand-600
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // brand-500 with opacity
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#2563eb',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1f2937',
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 13, family: 'Inter' },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 12, family: 'Inter' } },
        border: { display: false }
      },
      y: {
        grid: { color: '#f3f4f6' },
        border: { display: false },
        ticks: { display: false, beginAtZero: true }
      }
    }
  };

  return (
    <div className="w-full h-64 relative mt-4">
      <Line data={data} options={options as any} />
    </div>
  );
}
