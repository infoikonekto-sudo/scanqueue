import React, { useEffect, useState } from 'react'
import { StudentsTable, StudentFormModal, QRActionsPanel } from '../../components/admin'
import { PageHeader, Button, Card, useToast, LoadingSpinner, ConfirmModal } from '../../components/shared'
import { MdAdd, MdFileDownload, MdUpload, MdQrCode, MdClose, MdDelete } from 'react-icons/md'
import { useStudents } from '../../hooks/admin/useStudents'

/**
 * Página de Gestión de Estudiantes
 * - Importación masiva desde CSV/Excel (formato: No, Grado, Sección, Carnet, Nombre)
 * - Impresión QR por lotes o individual
 */
const AdminStudents = () => {
  const {
    students,
    loading,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkCreate,
    bulkUpsert,
    deleteAll,
  } = useStudents()

  const { addToast } = useToast()
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
  const [showQRPanel, setShowQRPanel] = useState(false)
  const [importStatus, setImportStatus] = useState(null) // null | 'parsing' | 'preview' | 'importing' | 'done'
  const [parsedStudents, setParsedStudents] = useState([])
  const [importError, setImportError] = useState(null)
  const [importResult, setImportResult] = useState(null) // { inserted, skipped }
  const [upsertMode, setUpsertMode] = useState(true) // Activo por defecto para que el usuario pueda actualizar niveles

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleCreateStudent = async (data) => {
    await createStudent(data)
    setShowFormModal(false)
  }

  const handleUpdateStudent = async (data) => {
    if (!selectedStudent) return
    await updateStudent(selectedStudent.id, data)
    setShowFormModal(false)
    setSelectedStudent(null)
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setShowFormModal(true)
  }

  /**
   * Inferir nivel educativo a partir del grado
   */
  const inferLevel = (grade = '') => {
    // Normalizar: a minúsculas, trim y quitar acentos
    const g = grade.toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    if (g.includes('nursery') || g.includes('kinder') || g.includes('prep') || g.includes('pk')) {
      return 'preprimaria'
    }
    if (g.includes('basic') || g.includes('ro sec') || g.includes('do sec') ||
      g.includes('to sec') || g.includes('secundaria') || g.includes('bach')) {
      return 'secundaria'
    }
    return 'primaria'
  }

  /**
   * Parsear CSV con el formato real del usuario:
   * No | Grado | Sección | Carnet | Nombre
   * Acepta comas, puntos y coma, o tabulaciones como separadores.
   */
  const parseCSV = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) throw new Error('El archivo está vacío o no tiene datos')

    // Detectar separador
    const firstLine = lines[0]
    const sep = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ','

    const headers = lines[0].split(sep).map(h => h.trim().toLowerCase())

    // Detectar columnas por nombre o posición
    // Formato esperado: No | Grado | Sección | Carnet | Nombre
    const getIdx = (names) => {
      for (const n of names) {
        const i = headers.findIndex(h => h.includes(n))
        if (i >= 0) return i
      }
      return -1
    }

    const idxNo = getIdx(['no', 'num', '#'])
    const idxGrade = getIdx(['grado', 'grade'])
    const idxSection = getIdx(['secc', 'section', 'sección'])
    const idxCarnet = getIdx(['carnet', 'id', 'codigo', 'code'])
    const idxName = getIdx(['nombre', 'name', 'alumno', 'estudiante'])
    const idxLevel = getIdx(['nivel', 'level', 'educ'])

    // Si no se detectan columnas por nombre, asumir formato posicional 0=No, 1=Grado, 2=Sección, 3=Carnet, 4=Nombre
    const usePositional = idxGrade < 0 || idxName < 0

    const parsed = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const cols = line.split(sep).map(c => c.trim())

      let no, grade, section, carnet, name

      if (usePositional) {
        [no, grade, section, carnet, name] = cols
      } else {
        no = idxNo >= 0 ? cols[idxNo] : i
        grade = idxGrade >= 0 ? cols[idxGrade] : ''
        section = idxSection >= 0 ? cols[idxSection] : ''
        carnet = idxCarnet >= 0 ? cols[idxCarnet] : ''
        name = idxName >= 0 ? cols[idxName] : ''
      }

      if (!name || !grade) continue

      // Deduplicar usando el nombre si no hay carnet. Eliminamos espacios y ponemos en minúsculas.
      const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-');

      parsed.push({
        id: carnet || `std-${normalizedName}`,
        name: name.trim(),
        grade: grade.trim(),
        section: (section || '').trim().toUpperCase(),
        level: (idxLevel >= 0 && cols[idxLevel]) ? cols[idxLevel].trim() : inferLevel(grade),
      })
    }

    if (parsed.length === 0) throw new Error('No se encontraron filas válidas')
    return parsed
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    setImportStatus('parsing')

    try {
      const text = await file.text()
      const data = parseCSV(text)
      setParsedStudents(data)
      setImportStatus('preview')
    } catch (err) {
      setImportError(err.message)
      setImportStatus(null)
    }
  }

  const handleConfirmImport = async () => {
    setImportStatus('importing')
    setImportError(null)
    try {
      let result
      if (upsertMode) {
        result = await bulkUpsert(parsedStudents)
      } else {
        const res = await bulkCreate(parsedStudents)
        result = { inserted: res.inserted, skipped: res.skipped }
      }
      setImportResult({ inserted: result.inserted || 0, skipped: result.skipped || result.updated || 0 })
      setImportStatus('done')
    } catch (err) {
      setImportError('Error al importar. Verifica que el backend esté corriendo.')
      setImportStatus('preview')
    }
  }

  const handleDeleteAll = async () => {
    await deleteAll()
    setShowDeleteAllModal(false)
  }

  const resetImport = () => {
    setShowImportModal(false)
    setParsedStudents([])
    setImportStatus(null)
    setImportError(null)
    setImportResult(null)
  }

  const downloadTemplate = () => {
    // Plantilla exactamente igual al formato del usuario
    const rows = [
      'No,Grado,Sección,Carnet,Nombre',
      '1,Nursery,A,20260123,Aguilar Escobar Kathya Yareth',
      '2,Nursery,A,20260062,Argueta Galindo Camila Isabella',
      '3,1°,B,20260159,López García Juan Pablo',
      '4,2do Secundaria,C,20260115,Cifuentes Franco Mae Alessandra',
    ].join('\n')

    const blob = new Blob(['\uFEFF' + rows], { type: 'text/csv;charset=utf-8' }) // BOM para que Excel abra bien
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_estudiantes.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <LoadingSpinner text="Cargando estudiantes..." />

  return (
    <>
      <PageHeader
        title="Gestión de Estudiantes"
        subtitle={`${students.length} estudiantes registrados`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Estudiantes' },
        ]}
        action={
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-black text-xs uppercase rounded-xl hover:bg-slate-200 transition-all"
            >
              <MdFileDownload className="w-4 h-4" /> Plantilla CSV
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white font-black text-xs uppercase rounded-xl hover:bg-[#0284c7] transition-all"
            >
              <MdUpload className="w-4 h-4" /> Importar CSV
            </button>
            <button
              onClick={() => setShowQRPanel(!showQRPanel)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-black text-xs uppercase rounded-xl hover:bg-violet-700 transition-all"
            >
              <MdQrCode className="w-4 h-4" /> {showQRPanel ? 'Ver Tabla' : 'Imprimir QRs'}
            </button>
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 font-black text-xs uppercase rounded-xl hover:bg-rose-200 transition-all"
            >
              <MdDelete className="w-4 h-4" /> Borrar Todo
            </button>
            <button
              onClick={() => { setSelectedStudent(null); setShowFormModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white font-black text-xs uppercase rounded-xl hover:bg-[#172554] transition-all"
            >
              <MdAdd className="w-4 h-4" /> Nuevo
            </button>
          </div>
        }
      />

      <Card className="mb-6">
        {showQRPanel ? (
          <QRActionsPanel students={students} />
        ) : (
          <StudentsTable
            students={students}
            loading={loading}
            onEdit={handleEditStudent}
            onDelete={deleteStudent}
          />
        )}
      </Card>

      {/* Modal de edición/creación */}
      <StudentFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setSelectedStudent(null) }}
        student={selectedStudent}
        onSubmit={selectedStudent ? handleUpdateStudent : handleCreateStudent}
      />

      {/* Modal de importación inteligente */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetImport} />
          <div className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#1e3a8a] px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Importar Estudiantes</h2>
                <p className="text-blue-300 text-xs font-bold mt-1">Formato: No | Grado | Sección | Carnet | Nombre</p>
              </div>
              <button onClick={resetImport} className="p-2 text-white/60 hover:text-white">
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              {importStatus === null && (
                <div>
                  <div className="border-3 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-blue-400 transition-all">
                    <p className="text-5xl mb-4">📁</p>
                    <p className="font-black text-slate-700 text-lg mb-2">Selecciona tu archivo CSV</p>
                    <p className="text-slate-500 text-sm mb-6">El sistema detecta automáticamente las columnas de tu Excel exportado</p>
                    <label className="cursor-pointer px-6 py-3 bg-[#1e3a8a] text-white font-black text-sm uppercase rounded-xl hover:bg-[#172554] transition-all">
                      Elegir Archivo
                      <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileSelect} />
                    </label>
                  </div>
                  {importError && (
                    <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-bold">
                      ⚠️ {importError}
                    </div>
                  )}
                </div>
              )}

              {importStatus === 'parsing' && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-[#1e3a8a] rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-bold text-slate-600">Analizando archivo...</p>
                </div>
              )}

              {importStatus === 'preview' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="font-black text-slate-800">{parsedStudents.length} estudiantes detectados</p>
                    </div>
                    <button onClick={() => { setParsedStudents([]); setImportStatus(null) }} className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase">
                      Cambiar archivo
                    </button>
                  </div>

                  {/* Previsualizacion */}
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-100 mb-6">
                    <table className="w-full text-sm">
                      <thead className="bg-[#1e3a8a] sticky top-0">
                        <tr>
                          {['ID/Carnet', 'Nombre', 'Grado', 'Sec.', 'Nivel'].map(h => (
                            <th key={h} className="px-3 py-2 text-left text-white text-xs font-black uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedStudents.slice(0, 50).map((s, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-2 text-slate-600 text-xs font-mono">{s.id}</td>
                            <td className="px-3 py-2 text-slate-800 text-xs font-bold">{s.name}</td>
                            <td className="px-3 py-2 text-slate-600 text-xs">{s.grade}</td>
                            <td className="px-3 py-2 text-slate-600 text-xs">{s.section}</td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-full">{s.level}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedStudents.length > 50 && (
                      <p className="text-center text-slate-400 text-xs py-2">... y {parsedStudents.length - 50} más</p>
                    )}
                  </div>

                  {importError && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-bold">
                      ⚠️ {importError}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <input
                      type="checkbox"
                      id="upsertMode"
                      checked={upsertMode}
                      onChange={(e) => setUpsertMode(e.target.checked)}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <label htmlFor="upsertMode" className="text-sm font-bold text-blue-900 cursor-pointer">
                      💡 Actualizar datos si el carnet ya existe (Recomendado)
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={resetImport}
                      className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-black uppercase text-sm rounded-xl hover:bg-slate-50 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      className="flex-1 py-3 bg-[#10b981] text-white font-black uppercase text-sm rounded-xl hover:bg-[#059669] transition-all"
                    >
                      ✅ Importar {parsedStudents.length} Estudiantes
                    </button>
                  </div>
                </div>
              )}

              {importStatus === 'importing' && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-black text-slate-700">Importando {parsedStudents.length} estudiantes...</p>
                  <p className="text-slate-400 text-sm mt-1">Procesando todo el archivo de una sola vez, por favor espera...</p>
                </div>
              )}

              {importStatus === 'done' && importResult && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                  </div>
                  <p className="font-black text-slate-800 text-xl mb-2">¡Importación completada!</p>
                  <div className="flex justify-center gap-6 mb-6 mt-4">
                    <div className="text-center">
                      <p className="text-3xl font-black text-emerald-600">{importResult.inserted}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase">Importados</p>
                    </div>
                    {importResult.skipped > 0 && (
                      <div className="text-center">
                        <p className="text-3xl font-black text-amber-500">{importResult.skipped}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase">Omitidos (ya existían)</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={resetImport}
                    className="px-8 py-3 bg-[#1e3a8a] text-white font-black uppercase text-sm rounded-xl hover:bg-[#172554] transition-all"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para borrar todo */}
      <ConfirmModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        title="Borrar TODOS los Estudiantes"
        message="¿Estás seguro de que deseas eliminar a TODOS los estudiantes del sistema? Esta acción no se puede deshacer."
        onConfirm={handleDeleteAll}
        isDangerous={true}
      />
    </>
  )
}

export default AdminStudents
