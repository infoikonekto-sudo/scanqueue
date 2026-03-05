import React, { useRef, useState } from 'react'
import { MdCloudUpload, MdAttachFile, MdClose } from 'react-icons/md'

export const UploadZone = ({
  onFiles,
  accept = '.csv,.xlsx,.xls',
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = true,
  label = 'Arrastra archivos aquí o haz clic para seleccionar',
}) => {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState([])
  const inputRef = useRef(null)

  const handleFiles = (newFiles) => {
    const validFiles = []
    const newErrors = []

    Array.from(newFiles).forEach((file) => {
      if (file.size > maxSize) {
        newErrors.push(`${file.name} es demasiado grande (máx. 5MB)`)
      } else if (!accept.split(',').some((ext) => file.name.endsWith(ext.trim()))) {
        newErrors.push(`${file.name} tiene formato no permitido`)
      } else {
        validFiles.push(file)
      }
    })

    setErrors(newErrors)
    
    if (multiple) {
      const newFiles = [...files, ...validFiles]
      setFiles(newFiles)
      onFiles?.(newFiles)
    } else {
      const newFiles = validFiles.slice(0, 1)
      setFiles(newFiles)
      onFiles?.(newFiles)
    }
  }

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFiles?.(newFiles)
  }

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <MdCloudUpload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-700 font-medium mb-1">{label}</p>
        <p className="text-gray-500 text-sm mb-4">o</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium"
        >
          Seleccionar archivo
        </button>
        <p className="text-gray-400 text-xs mt-3">Máximo {Math.round(maxSize / 1024 / 1024)}MB</p>
      </div>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          {errors.map((error, idx) => (
            <p key={idx} className="text-red-700 text-sm">{error}</p>
          ))}
        </div>
      )}

      {/* Archivos seleccionados */}
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">Archivos seleccionados:</h4>
          <div className="space-y-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <MdAttachFile className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadZone
