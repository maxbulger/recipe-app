import { render, screen } from '@testing-library/react'
import Pagination from '../Pagination'
import { describe, it, expect } from 'vitest'

describe('Pagination', () => {
  it('does not render when totalPages is 1', () => {
    render(<Pagination currentPage={1} totalPages={1} baseUrl="/" />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('does not render when totalPages is 0', () => {
    render(<Pagination currentPage={1} totalPages={0} baseUrl="/" />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('renders all pages when totalPages is small', () => {
    render(<Pagination currentPage={2} totalPages={5} baseUrl="/" />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('highlights current page', () => {
    render(<Pagination currentPage={3} totalPages={5} baseUrl="/" />)

    const currentPageButton = screen.getByLabelText('Go to page 3')
    expect(currentPageButton).toHaveAttribute('aria-current', 'page')
  })

  it('shows Previous and Next buttons', () => {
    render(<Pagination currentPage={3} totalPages={5} baseUrl="/" />)

    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument()
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument()
  })

  it('does not show Previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} baseUrl="/" />)

    expect(screen.queryByLabelText('Go to previous page')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument()
  })

  it('does not show Next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} baseUrl="/" />)

    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument()
    expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument()
  })

  it('shows ellipsis for large page counts', () => {
    render(<Pagination currentPage={5} totalPages={20} baseUrl="/" />)

    const ellipses = screen.getAllByText('...')
    expect(ellipses.length).toBeGreaterThan(0)
  })
})
