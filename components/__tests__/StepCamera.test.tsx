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

  it('offers a gallery upload alongside the camera', () => {
    render(<StepCamera data={defaultData} onChange={jest.fn()} onNext={jest.fn()} />)
    expect(screen.getByText(/subir desde mis fotos/i)).toBeInTheDocument()
  })

  // capture="user" es lo que manda al celular a la cámara; el input de galería
  // tiene que NO llevarlo para que el sistema abra el carrete.
  it('only puts capture on the camera input, so the other opens the gallery', () => {
    render(<StepCamera data={defaultData} onChange={jest.fn()} onNext={jest.fn()} />)
    expect(screen.getByTestId('camera-input')).toHaveAttribute('capture', 'user')
    expect(screen.getByTestId('gallery-input')).not.toHaveAttribute('capture')
    expect(screen.getByTestId('gallery-input')).toHaveAttribute('accept', 'image/*')
  })

  it('lets the fan swap the photo from either source once one is set', () => {
    const dataWithPhoto: FanFormData = {
      ...defaultData,
      photoFile: new File([''], 'photo.jpg'),
      photoPreviewUrl: 'blob:test',
    }
    render(<StepCamera data={dataWithPhoto} onChange={jest.fn()} onNext={jest.fn()} />)
    expect(screen.getByRole('button', { name: /tomar otra/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /elegir otra/i })).toBeInTheDocument()
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
