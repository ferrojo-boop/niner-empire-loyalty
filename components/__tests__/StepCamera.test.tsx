import { render, screen } from '@testing-library/react'
import { StepCamera } from '../StepCamera'
import { FanFormData } from '@/lib/types'

const defaultData: FanFormData = {
  nombre: 'Fernando', email: 'fer@f.com', whatsapp: '',
  fanDesde: 1995, photoFile: null, photoPreviewUrl: null,
}

describe('StepCamera', () => {
  it('shows camera capture button when no photo taken', () => {
    render(<StepCamera data={defaultData} onChange={jest.fn()} onSubmit={jest.fn()} isSubmitting={false} />)
    expect(screen.getByText(/tomar foto/i)).toBeInTheDocument()
  })

  it('disables submit button when no photo', () => {
    render(<StepCamera data={defaultData} onChange={jest.fn()} onSubmit={jest.fn()} isSubmitting={false} />)
    expect(screen.getByRole('button', { name: /generar/i })).toBeDisabled()
  })

  it('shows submitting state', () => {
    const dataWithPhoto: FanFormData = {
      ...defaultData,
      photoFile: new File([''], 'photo.jpg'),
      photoPreviewUrl: 'blob:test',
    }
    render(<StepCamera data={dataWithPhoto} onChange={jest.fn()} onSubmit={jest.fn()} isSubmitting={true} />)
    expect(screen.getByText(/generando/i)).toBeInTheDocument()
  })
})
