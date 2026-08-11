import { render, screen } from '@testing-library/react'
import { ProgressBar } from '../ProgressBar'

describe('ProgressBar', () => {
  it('shows step labels when rendered', () => {
    render(<ProgressBar currentStep={1} />)
    expect(screen.getByText('Tus datos')).toBeInTheDocument()
    expect(screen.getByText('Trivia')).toBeInTheDocument()
    expect(screen.getByText('Tu foto')).toBeInTheDocument()
    expect(screen.getByText('Resumen')).toBeInTheDocument()
  })

  it('renders 4 step indicators', () => {
    render(<ProgressBar currentStep={2} />)
    const steps = screen.getAllByRole('listitem')
    expect(steps).toHaveLength(4)
  })
})
