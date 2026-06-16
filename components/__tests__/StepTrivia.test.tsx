import { render, screen, fireEvent } from '@testing-library/react'
import { StepTrivia } from '../StepTrivia'

describe('StepTrivia', () => {
  it('shows the trivia question', () => {
    render(<StepTrivia onCorrect={jest.fn()} />)
    expect(screen.getByText(/cuántos super bowls/i)).toBeInTheDocument()
  })

  it('calls onCorrect when user selects 5', () => {
    jest.useFakeTimers()
    const onCorrect = jest.fn()
    render(<StepTrivia onCorrect={onCorrect} />)
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    jest.runAllTimers()
    expect(onCorrect).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })

  it('shows error message when user selects wrong answer', () => {
    render(<StepTrivia onCorrect={jest.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(screen.getByText(/incorrecto/i)).toBeInTheDocument()
  })

  it('allows retry after wrong answer', () => {
    jest.useFakeTimers()
    const onCorrect = jest.fn()
    render(<StepTrivia onCorrect={onCorrect} />)
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    jest.runAllTimers()
    expect(onCorrect).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })
})
