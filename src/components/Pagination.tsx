'use client'

import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl?: string
  onPageChange?: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, baseUrl, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = []
  const showEllipsis = totalPages > 7

  if (showEllipsis) {
    // Always show first page, last page, current page, and pages around current
    if (currentPage <= 3) {
      for (let i = 1; i <= Math.min(5, totalPages); i++) {
        pages.push(i)
      }
      if (totalPages > 5) {
        pages.push(-1) // Ellipsis
        pages.push(totalPages)
      }
    } else if (currentPage >= totalPages - 2) {
      pages.push(1)
      pages.push(-1) // Ellipsis
      for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push(-1) // Ellipsis
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push(-2) // Ellipsis
      pages.push(totalPages)
    }
  } else {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  }

  const PageButton = ({ page, isActive }: { page: number; isActive: boolean }) => {
    const className = `px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
    }`

    if (onPageChange) {
      return (
        <button
          onClick={() => onPageChange(page)}
          className={className}
          aria-label={`Go to page ${page}`}
          aria-current={isActive ? 'page' : undefined}
        >
          {page}
        </button>
      )
    }

    return (
      <Link
        href={`${baseUrl}?page=${page}`}
        className={className}
        aria-label={`Go to page ${page}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {page}
      </Link>
    )
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
      {currentPage > 1 && (
        onPageChange ? (
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 transition-colors"
            aria-label="Go to previous page"
          >
            Previous
          </button>
        ) : (
          <Link
            href={`${baseUrl}?page=${currentPage - 1}`}
            className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 transition-colors"
            aria-label="Go to previous page"
          >
            Previous
          </Link>
        )
      )}

      {pages.map((page, index) => {
        if (page < 0) {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
              ...
            </span>
          )
        }
        return <PageButton key={page} page={page} isActive={page === currentPage} />
      })}

      {currentPage < totalPages && (
        onPageChange ? (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 transition-colors"
            aria-label="Go to next page"
          >
            Next
          </button>
        ) : (
          <Link
            href={`${baseUrl}?page=${currentPage + 1}`}
            className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 transition-colors"
            aria-label="Go to next page"
          >
            Next
          </Link>
        )
      )}
    </nav>
  )
}
