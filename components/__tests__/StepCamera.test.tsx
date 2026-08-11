import { render, screen } from '@testing-library/react'
import { StepCamera } from '../StepCamera'
import { FanFormData } from '@/lib/types'

const defaultData: FanFormData = {
  nombre: 'Fernando', email: 'fer@f.com', whatsapp: '',
  fanDesde: 1995, jugadorFavorito: 'Joe Montana',
  photoFile: null, photoPreviewUrl: null,
}

describe('StepCamera', () => {
  it('shows camera capture button when no photo taken', () => {
    render(<StepCamera data={defaultData} onChange={jest.fn()} onNext={jest.fn()} />)
    expect(screen.getByText(/tomar foto/i)).toBeInTheDocument()
  })

  it('disables next button when no photo', () => {
    render(<StepCamera data={defaultData} onChange={jest.fn()} onNext={jest.fn()} />)
    expect(screen.getByRole('button', { name: /revisar/i })).toBeDisabled()
  })

  it('enables next button once a photo is taken', () => {
    const dataWithPhoto: FanFormData = {
      ...defaultData,
      photoFile: new File([''], 'photo.jpg'),
      photoPreviewUrl: 'blob:test',
    }
    render(<StepCamera data={dataWithPhoto} onChange={jest.fn()} onNext={jest.fn()} />)
    expect(screen.getByRole('button', { name: /revisar/i })).toBeEnabled()
  })
})
