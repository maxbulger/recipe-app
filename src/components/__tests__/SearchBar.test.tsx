import { render, screen, fireEvent } from '@testing-library/react'
import SearchBar from '@/components/SearchBar'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock })
}))

describe('SearchBar', () => {
  beforeEach(() => {
    pushMock.mockReset()
  })

  it('navigates to search with query on submit', () => {
    render(<SearchBar placeholder="Search recipes..." />)
    const input = screen.getByPlaceholderText('Search recipes...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'pasta' } })
    fireEvent.submit(input.closest('form')!)
    expect(pushMock).toHaveBeenCalledWith('/search?q=pasta')
  })
})

