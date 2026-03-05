import React, { useMemo, useState } from 'react'
import { MdChevronLeft, MdChevronRight, MdSearch } from 'react-icons/md'
import { Button } from './Button'
import { Input } from './Input'

export const Table = ({
  columns,
  data = [],
  onRowClick,
  loading = false,
  className = '',
  striped = true,
  hoverable = true,
}) => {
  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 ${className}`}>
      <table className="w-full text-sm">
        <thead className="bg-[#1e3a8a] border-b border-blue-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left font-black text-white uppercase tracking-wider text-xs"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                Cargando...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                No hay datos
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={`row-${idx}-${row.id ?? idx}`}
                className={`border-b border-gray-200 ${striped && idx % 2 !== 0 ? 'bg-gray-50' : 'bg-white'
                  } ${hoverable && onRowClick ? 'hover:bg-blue-50 cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={`cell-${idx}-${col.key}`}
                    className="px-6 py-4 text-slate-800 text-sm font-medium"
                    style={{ width: col.width }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export const DataTable = ({
  columns,
  data = [],
  onRowClick,
  onFetch,
  search = true,
  pagination = true,
  pageSize = 20,
  className = '',
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState(null)
  const [sortOrder, setSortOrder] = useState('asc')

  const filteredData = useMemo(() => {
    let filtered = data

    if (searchTerm) {
      filtered = data.filter((row) => {
        return columns.some((col) =>
          String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    if (sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return sortOrder === 'asc' ? cmp : -cmp
      })
    }

    return Array.isArray(filtered) ? filtered : []
  }, [data, searchTerm, sortBy, sortOrder, columns])

  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  return (
    <div className={className}>
      {search && (
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Buscar..."
            icon={MdSearch}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      )}

      <Table
        columns={columns.map((col) => ({
          ...col,
          label: (
            <span
              className={col.sortable ? 'cursor-pointer hover:text-blue-600' : ''}
              onClick={() => col.sortable && handleSort(col.key)}
            >
              {col.label}
              {sortBy === col.key && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </span>
          ),
        }))}
        data={paginatedData}
        onRowClick={onRowClick}
        loading={loading}
      />

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Página {currentPage} de {totalPages} ({filteredData.length} resultados)
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={MdChevronLeft}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={MdChevronRight}
              iconPosition="right"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Table
