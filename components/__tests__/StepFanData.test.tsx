import { render, screen } from '@testing-library/react'
import { StepFanData } from '../StepFanData'
import { FanFormData } from '@/lib/types'

const defaultData: FanFormData = {
  nombre: '', email: '', whatsapp: '', fanDesde: '', photoFile: null, photoPreviewUrl: null,
}

describe('StepFanData', () => {
  it('disables Next button when fields are empty', () => {
    render(<StepFanData data={defaultData} onChange={jest.fn()} onNext={jest.fn()} />)
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled()
  })

  it('enables Next button when nombre, email, and fanDesde are filled', () => {
    const filledData: FanFormData = { ...defaultData, nombre: 'Fernando', email: 'f@f.com', fanDesde: 1995 }
    render(<StepFanData data={filledData} onChange={jest.fn()} onNext={jest.fn()} />)
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeEnabled()
  })

  it('shows WhatsApp as optional/recommended', () => {
    render(<StepFanData data={defaultData} onChange={jest.fn()} onNext={jest.fn()} />)
    expect(screen.getByText(/recomendado/i)).toBeInTheDocument()
  })
})
