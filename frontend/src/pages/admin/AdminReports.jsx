import React, { useState } from 'react'
import { PageHeader, Card, Button, Input, Select, DataTable, useToast } from '../../components/shared'
import { MdFilterList, MdDownload } from 'react-icons/md'

const AdminReports = () => {
  const { addToast } = useToast()
  const [exportLoading, setExportLoading] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    grade: 'all',
    route: 'all',
    status: 'all',
  })

  const handleExport = async (format) => {
    setExportLoading(true)
    try {
      // Simular descarga
      await new Promise(resolve => setTimeout(resolve, 1500))
      addToast(`Reporte exportado a ${format}`, 'success')
    } finally {
      setExportLoading(false)
    }
  }

  // Datos de ejemplo para la tabla
  const reportData = [
    {
      id: 1,
      date: '2024-03-01',
      totalScanned: 250,
      pickedUp: 245,
      inTransport: 5,
      pendingPickup: 0,
      percentage: 98,
    },
    {
      id: 2,
      date: '2024-02-29',
      totalScanned: 248,
      pickedUp: 240,
      inTransport: 8,
      pendingPickup: 0,
      percentage: 96.8,
    },
    {
      id: 3,
      date: '2024-02-28',
      totalScanned: 252,
      pickedUp: 248,
      inTransport: 4,
      pendingPickup: 0,
      percentage: 98.4,
    },
  ]

  const columns = [
    { key: 'date', label: 'Fecha', sortable: true },
    { key: 'totalScanned', label: 'Total Escaneados', sortable: true },
    { key: 'pickedUp', label: 'Retiros', sortable: true },
    { key: 'inTransport', label: 'Transporte', sortable: true },
    { key: 'pendingPickup', label: 'Pendientes', sortable: true },
    {
      key: 'percentage',
      label: 'Tasa de Retiro',
      render: (value) => `${value.toFixed(1)}%`,
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          icon={MdDownload}
          onClick={() => console.log('Descargar detalles de', row.date)}
        >
          Detalles
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Reportes y Exportación"
        subtitle="Descarga y personaliza reportes del sistema"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Reportes' },
        ]}
      />

      {/* Filtros */}
      <Card className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MdFilterList /> Filtros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Desde"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          />
          <Input
            label="Hasta"
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          />
          <Select
            label="Grado"
            value={filters.grade}
            onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
            options={[
              { value: 'all', label: 'Todos' },
              { value: '1', label: '1° Básico' },
              { value: '2', label: '2° Básico' },
            ]}
          />
          <Select
            label="Ruta"
            value={filters.route}
            onChange={(e) => setFilters({ ...filters, route: e.target.value })}
            options={[
              { value: 'all', label: 'Todas' },
              { value: '1', label: 'Ruta 1' },
              { value: '2', label: 'Ruta 2' },
            ]}
          />
        </div>
      </Card>

      {/* Exportación */}
      <Card className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Descargar Reportes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Reporte PDF Diario</h4>
            <p className="text-sm text-gray-600 mb-3">Resumen ejecutivo con gráficos</p>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              loading={exportLoading}
              onClick={() => handleExport('PDF')}
            >
              Descargar PDF
            </Button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📈 Reporte Excel</h4>
            <p className="text-sm text-gray-600 mb-3">Detallado con fórmulas y gráficos</p>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              loading={exportLoading}
              onClick={() => handleExport('Excel')}
            >
              Descargar Excel
            </Button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📋 Reporte CSV</h4>
            <p className="text-sm text-gray-600 mb-3">Para sistemas externos</p>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              loading={exportLoading}
              onClick={() => handleExport('CSV')}
            >
              Descargar CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Historial de Reportes */}
      <Card title="Historial de Reportes Diarios">
        <DataTable
          columns={columns}
          data={reportData}
          search={true}
          pagination={true}
          pageSize={10}
        />
      </Card>
    </>
  )
}

export default AdminReports
