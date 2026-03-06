import React, { useState, useRef } from 'react'
import { Card, Button, DataTable, Modal, Input, Select, ConfirmModal } from '../shared'
import { MdEdit, MdDelete, MdDownload, MdQrCode, MdUpload, MdPrint } from 'react-icons/md'
import { useToast } from '../shared/Toast'
import { QRCodeSVG } from 'qrcode.react'

/**
 * Tabla de Estudiantes mejorada
 */
export const StudentsTable = ({
  students = [],
  loading = false,
  onEdit,
  onDelete,
  onRefresh,
  onToggleTransport,
}) => {
  const { addToast } = useToast()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const columns = [
    { key: 'id', label: 'Carnet', width: '120px', sortable: true },
    { key: 'name', label: 'Nombre Completo', sortable: true },
    { key: 'grade', label: 'Grado', sortable: true },
    { key: 'section', label: 'Sección', width: '80px' },
    {
      key: 'level',
      label: 'Nivel',
      render: (v) => {
        const map = { preprimaria: '🧸 Preprimaria', primaria: '📚 Primaria', secundaria: '🎓 Secundaria' }
        return map[v] || v || '-'
      }
    },
    {
      key: 'daily_transport',
      label: '¿Bus Hoy?',
      width: '100px',
      render: (v, row) => (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!v}
            onChange={(e) => onToggleTransport(row.id, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a8a]"></div>
          <span className="ml-2 text-[10px] font-black uppercase text-slate-500">{v ? 'SÍ' : 'NO'}</span>
        </label>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: '200px',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(row)}
            className="px-3 py-1.5 bg-[#0ea5e9] text-white text-xs font-black uppercase rounded-lg hover:bg-[#0284c7] transition-all"
          >
            Editar
          </button>
          <button
            onClick={() => { setSelectedStudent(row); setShowDeleteModal(true) }}
            className="px-3 py-1.5 bg-[#f43f5e] text-white text-xs font-black uppercase rounded-lg hover:bg-[#e11d48] transition-all"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ]

  const handleDelete = async () => {
    if (!selectedStudent) return
    try {
      await onDelete(selectedStudent.id)
      setShowDeleteModal(false)
      setSelectedStudent(null)
    } catch (err) {
      addToast('Error al eliminar', 'error')
    }
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        search={true}
        pagination={true}
        pageSize={25}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Estudiante"
        message={`¿Desea eliminar a ${selectedStudent?.name}?`}
        onConfirm={handleDelete}
        isDangerous={true}
      />
    </>
  )
}

/**
 * Formulario simple de estudiante - SIN transport_route_id para evitar error 400
 */
export const StudentForm = ({ student, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState(
    student
      ? {
        name: student.name || '',
        grade: student.grade || '',
        section: student.section || '',
        level: student.level || 'primaria',
      }
      : {
        name: '',
        grade: '',
        section: '',
        level: 'primaria',
      }
  )

  const levels = [
    { value: 'preprimaria', label: '🧸 Preprimaria' },
    { value: 'primaria', label: '📚 Primaria' },
    { value: 'secundaria', label: '🎓 Secundaria' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    // Enviar solo los campos necesarios - sin transport_route_id
    onSubmit({
      name: formData.name.trim(),
      grade: formData.grade.trim(),
      section: formData.section.trim().toUpperCase(),
      level: formData.level,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre Completo"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ej: García López, Juan Pablo"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Nivel Educativo"
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          options={levels}
          required
        />
        <Input
          label="Sección"
          value={formData.section}
          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
          placeholder="A, B, C..."
        />
      </div>

      <Input
        label="Grado"
        value={formData.grade}
        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
        placeholder="Ej: Nursery, 1°, 2do..."
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#1e3a8a] text-white font-black uppercase tracking-widest rounded-xl hover:bg-[#172554] transition-all disabled:opacity-50"
      >
        {loading ? 'Guardando...' : student ? 'Actualizar Estudiante' : 'Crear Estudiante'}
      </button>
    </form>
  )
}

export const StudentFormModal = ({
  isOpen,
  onClose,
  student,
  onSubmit,
  loading = false,
}) => {
  const handleSubmit = async (data) => {
    await onSubmit(data)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? 'Editar Estudiante' : 'Nuevo Estudiante'}
      size="md"
    >
      <StudentForm
        student={student}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </Modal>
  )
}

/**
 * Panel de impresión y descarga de QRs
 * Soporta descarga individual y por lotes (batch)
 */
export const QRActionsPanel = ({ students = [] }) => {
  const printAllRef = useRef()

  // Descargar QR individual como SVG
  const downloadSingleQR = (student) => {
    const svg = document.getElementById(`qr-${student.id}`)
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `QR_${student.id}_${student.name.replace(/\s+/g, '_')}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Imprimir todos los QRs en una hoja
  const printAllQRs = () => {
    window.print()
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-bold">No hay estudiantes cargados</p>
      </div>
    )
  }

  return (
    <div>
      {/* Controles */}
      <div className="flex gap-3 mb-6 print:hidden">
        <button
          onClick={printAllQRs}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white font-black uppercase text-xs rounded-xl hover:bg-[#172554] transition-all"
        >
          <MdPrint className="w-4 h-4" /> Imprimir Todo ({students.length})
        </button>
      </div>

      {/* Grid de QRs */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 print:grid-cols-4 print:gap-6 print:block">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex flex-col items-center gap-2 p-3 border border-slate-100 rounded-2xl bg-white hover:border-blue-200 hover:shadow-md transition-all group print:break-inside-avoid print:mb-6 print:border print:border-slate-200 print:w-[22%] print:inline-flex print:mr-4"
          >
            <QRCodeSVG
              id={`qr-${student.id}`}
              value={String(student.id)}
              size={120}
              level="H"
              includeMargin={true}
              className="print:w-32 print:h-32"
            />
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-800 leading-tight uppercase print:text-[12px]">{student.name}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 print:text-[10px]">{student.grade} {student.section}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase print:text-[10px]">{student.id}</p>
            </div>
            <button
              onClick={() => downloadSingleQR(student)}
              className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-[#0ea5e9] text-white text-[9px] font-black uppercase rounded-lg print:hidden download-qr-btn"
            >
              Descargar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StudentsTable
