import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

const chartColors = {
  primary: '#1e3a8a', // blue-900
  success: '#16a34a', // green-600
  warning: '#ea580c', // orange-600
  danger: '#dc2626', // red-600
  secondary: '#60a5fa', // blue-400
  light: '#e5e7eb', // gray-200
}

export const LineChart = ({ labels, data, title = '' }) => {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: title,
            data,
            borderColor: chartColors.primary,
            backgroundColor: 'rgba(30, 58, 138, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: chartColors.primary,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        },
        scales: {
          y: { beginAtZero: true },
        },
      }}
    />
  )
}

// Headers por defecto
const getHeaders = () => {
  const auth = localStorage.getItem('auth')
  const token = auth ? JSON.parse(auth).token : null
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const BarChart = ({ labels, data, title = '' }) => {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: title,
            data,
            backgroundColor: [
              chartColors.primary,
              chartColors.secondary,
              chartColors.success,
              chartColors.warning,
            ],
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true },
        },
      }}
    />
  )
}

export const PieChart = ({ labels, data, title = '' }) => {
  return (
    <Pie
      data={{
        labels,
        datasets: [
          {
            label: title,
            data,
            backgroundColor: [
              chartColors.success,
              chartColors.warning,
              chartColors.danger,
              chartColors.light,
            ],
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#475569',
              font: {
                weight: 'bold',
                size: 12
              }
            }
          },
        },
      }}
    />
  )
}

export const DoughnutChart = ({ labels, data, title = '' }) => {
  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            label: title,
            data,
            backgroundColor: [
              chartColors.primary,
              chartColors.secondary,
              chartColors.success,
              chartColors.warning,
              chartColors.danger,
            ],
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#475569',
              font: {
                weight: 'bold',
                size: 11
              }
            }
          },
        },
      }}
    />
  )
}

export default {
  LineChart,
  BarChart,
  PieChart,
  DoughnutChart,
}
