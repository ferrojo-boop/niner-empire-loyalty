import { render, screen, fireEvent } from '@testing-library/react'
import { StepTrivia } from '../StepTrivia'
import { FanFormData } from '@/lib/types'

const baseData: FanFormData = {
  nombre: '', email: '', whatsapp: '', fanDesde: '',
  jugadorFavorito: '', photoFile: null, photoPreviewUrl: null,
}

function renderTrivia(overrides: Partial<FanFormData> = {}, onCorrect = jest.fn()) {
  const data = { ...baseData, ...overrides }
  render(<StepTrivia data={data} onChange={jest.fn()} onCorrect={onCorrect} />)
  return onCorrect
}

describe('StepTrivia', () => {
  it('shows the trivia question', () => {
    renderTrivia()
    expect(screen.getByText(/cuántos super bowls/i)).toBeInTheDocument()
  })

  it('asks for the favorite player', () => {
    renderTrivia()
    expect(screen.getByLabelText(/jugador favorito/i)).toBeInTheDocument()
  })

  it('shows error message when user selects wrong answer', () => {
    renderTrivia()
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(screen.getByText(/incorrecto/i)).toBeInTheDocument()
  })

  it('keeps Next disabled until both the answer and the player are given', () => {
    renderTrivia({ jugadorFavorito: '' })
    const next = screen.getByRole('button', { name: /siguiente/i })
    expect(next).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '5' }))
    // correct answer alone is not enough — favorite player is still empty
    expect(next).toBeDisabled()
  })

  it('enables Next and calls onCorrect once both are provided', () => {
    const onCorrect = renderTrivia({ jugadorFavorito: 'Joe Montana' })
    fireEvent.click(screen.getByRole('button', { name: '5' }))

    const next = screen.getByRole('button', { name: /siguiente/i })
    expect(next).toBeEnabled()
    fireEvent.click(next)
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('allows retry after a wrong answer', () => {
    const onCorrect = renderTrivia({ jugadorFavorito: 'Jerry Rice' })
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })
})
