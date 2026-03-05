import { useState, useCallback, useEffect } from 'react'
import { useToast } from '../../components/shared/Toast'
import { studentService } from '../../services/admin'

export const useStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { addToast } = useToast()

  const fetchStudents = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const { data: response } = await studentService.list(params)
      setStudents(response.data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const createStudent = useCallback(async (studentData) => {
    try {
      const { data: response } = await studentService.create(studentData)
      setStudents((prev) => [...prev, response.data])
      addToast('Estudiante creado exitosamente', 'success')
      return response.data
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error')
      throw err
    }
  }, [addToast])

  const updateStudent = useCallback(async (id, studentData) => {
    try {
      const { data: response } = await studentService.update(id, studentData)
      setStudents((prev) => prev.map((s) => (s.id === id ? response.data : s)))
      addToast('Estudiante actualizado', 'success')
      return response.data
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error')
      throw err
    }
  }, [addToast])

  const deleteStudent = useCallback(async (id) => {
    try {
      await studentService.delete(id)
      setStudents((prev) => prev.filter((s) => s.id !== id))
      addToast('Estudiante eliminado', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error')
      throw err
    }
  }, [addToast])

  const uploadPhoto = useCallback(async (studentId, file) => {
    try {
      const { data: response } = await studentService.uploadPhoto(studentId, file)
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? response.data : s))
      )
      addToast('Foto actualizada', 'success')
      return response.data
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error')
      throw err
    }
  }, [addToast])

  const bulkCreate = useCallback(async (students) => {
    try {
      const { data: response } = await studentService.bulkCreate(students)
      const newStudents = response.data || []
      setStudents((prev) => [...prev, ...newStudents])
      const msg = response.skipped > 0
        ? `${response.inserted} importados, ${response.skipped} omitidos por duplicados`
        : `${response.inserted} estudiantes importados exitosamente`
      addToast(msg, 'success')
      return response
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error')
      throw err
    }
  }, [addToast])

  const bulkUpsert = useCallback(async (students) => {
    try {
      const { data: response } = await studentService.bulkUpsert(students)
      // Recargar todos para asegurar sincronía completa tras un upsert masivo
      await fetchStudents()
      const msg = `${response.inserted} creados, ${response.updated} actualizados`
      addToast(msg, 'success')
      return response
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error')
      throw err
    }
  }, [addToast, fetchStudents])

  const deleteAll = useCallback(async () => {
    try {
      await studentService.deleteAll()
      setStudents([])
      addToast('Todos los estudiantes han sido eliminados', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error')
      throw err
    }
  }, [addToast])

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    uploadPhoto,
    bulkCreate,
    bulkUpsert,
    deleteAll,
  }
}

export const useStudent = (id) => {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    if (!id) return

    const fetch = async () => {
      setLoading(true)
      try {
        const { data } = await studentService.get(id)
        setStudent(data)
      } catch (err) {
        addToast(err.message, 'error')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [id, addToast])

  return { student, loading }
}

export default useStudents
