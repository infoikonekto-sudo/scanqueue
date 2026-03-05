import React from 'react'
import { Link } from 'react-router-dom'
import { MdChevronRight } from 'react-icons/md'

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <MdChevronRight className="w-4 h-4 text-gray-400" />}
          {item.href ? (
            <Link to={item.href} className="text-blue-600 hover:text-blue-800">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export const PageHeader = ({ title, subtitle, breadcrumbs, action }) => {
  return (
    <div className="mb-8">
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex gap-3">{action}</div>}
      </div>
    </div>
  )
}

export default Breadcrumb
