import React, { useState } from 'react'
import { LineChart, BarChart, PieChart } from '../../components/admin'
import { PageHeader, Card, Button, Select, Input } from '../../components/shared'
import { MdDateRange, MdFilterList } from 'react-icons/md'

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  })

  const [filterGrade, setFilterGrade] = useState('all')

  const grades = [
    { value: 'all', label: 'Todos los grados' },
    { value: '1', label: '1° Básico' },
    { value: '2', label: '2° Básico' },
    { value: '3', label: '3° Básico' },
  ]

  return (
    <>
      <PageHeader
        title="Analítica y Reportes"
        subtitle="Análisis detallado de datos históricos"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Analítica' },
        ]}
      />

      {/* Filtros */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Desde"
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            icon={MdDateRange}
          />
          <Input
            label="Hasta"
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            icon={MdDateRange}
          />
          <Select
            label="Filtrar por Grado"
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            options={grades}
          />
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tasa de Retiro Promedio', value: '87.5%', change: '+2.1%' },
          { label: 'Velocidad de Atención', value: '45.2/min', change: '+12%' },
          { label: 'Estudiantes sin Recoger', value: '12', change: '-3' },
          { label: 'Eficiencia de Transporte', value: '91%', change: '+5.3%' },
        ].map((kpi, idx) => (
          <Card key={idx} className="text-center">
            <p className="text-gray-600 text-sm mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-blue-900 mb-1">{kpi.value}</p>
            <p className="text-xs text-green-600 font-medium">{kpi.change} vs. semana anterior</p>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Retiros por Semana (últimas 4 semanas)">
          <BarChart
            labels={['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']}
            data={[250, 280, 320, 350]}
            title="Retiros"
          />
        </Card>

        <Card title="Rutas Más Utilizadas">
          <PieChart
            labels={['Ruta Norte', 'Ruta Sur', 'Ruta Este', 'Ruta Oeste']}
            data={[120, 95, 80, 65]}
          />
        </Card>

        <Card title="Tendencia de Asistencia (últimos 30 días)" className="lg:col-span-2">
          <LineChart
            labels={['L', 'M', 'X', 'J', 'V', 'S', 'D', 'L', 'M', 'X', 'J', 'V', 'S', 'D', 'L', 'M', 'X', 'J', 'V', 'S', 'D', 'L', 'M', 'X', 'J', 'V', 'S', 'D', 'L', 'M']}
            data={[320, 340, 350, 360, 365, 268, 270, 330, 345, 355, 365, 375, 280, 285, 320, 335, 350, 360, 375, 290, 295, 325, 340, 355, 370, 385, 300, 310, 330, 350]}
            title="Estudiantes Escaneados"
          />
        </Card>
      </div>

      {/* Tabla de Horas Pico */}
      <Card title="Horas Pico" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Hora</th>
                <th className="px-4 py-2 text-left">Retiros</th>
                <th className="px-4 py-2 text-left">Promedio Atención</th>
                <th className="px-4 py-2 text-left">Tendencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { hour: '16:00 - 16:30', pickups: 85, avgTime: '2.3s', trend: '↑ +12%' },
                { hour: '16:30 - 17:00', pickups: 120, avgTime: '2.1s', trend: '↑ +8%' },
                { hour: '17:00 - 17:30', pickups: 95, avgTime: '2.4s', trend: '↓ -3%' },
                { hour: '17:30 - 18:00', pickups: 65, avgTime: '2.8s', trend: '↓ -5%' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.hour}</td>
                  <td className="px-4 py-3 text-gray-600">{row.pickups}</td>
                  <td className="px-4 py-3 text-gray-600">{row.avgTime}</td>
                  <td className="px-4 py-3">{row.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

export default AdminAnalytics
