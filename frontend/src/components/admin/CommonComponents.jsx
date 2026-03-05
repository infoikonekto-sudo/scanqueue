import React from 'react'
import { Card, Button } from '../shared'
import { MdFileDownload, MdPrint, MdRefresh } from 'react-icons/md'

export const ExportActions = ({ 
  onExportPDF, 
  onExportExcel, 
  onExportCSV, 
  onPrint,
  loading = false 
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="primary"
        size="sm"
        icon={MdFileDownload}
        loading={loading}
        onClick={onExportPDF}
      >
        Descargar PDF
      </Button>

      <Button
        variant="success"
        size="sm"
        icon={MdFileDownload}
        loading={loading}
        onClick={onExportExcel}
      >
        Descargar Excel
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={MdFileDownload}
        loading={loading}
        onClick={onExportCSV}
      >
        Descargar CSV
      </Button>

      <Button
        variant="ghost"
        size="sm"
        icon={MdPrint}
        onClick={onPrint}
      >
        Imprimir
      </Button>
    </div>
  )
}

export const QuickActions = ({ actions = [] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, idx) => (
        <Card key={idx} onClick={action.onClick} className="cursor-pointer hover:shadow-lg transition">
          <div className="flex items-start gap-4">
            <div className="text-3xl">{action.icon}</div>
            <div>
              <h3 className="font-semibold text-gray-900">{action.label}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default ExportActions
