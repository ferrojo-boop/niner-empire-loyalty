import { render, screen } from '@testing-library/react'
import { FanForm } from '../FanForm'

// FanForm llama useRouter() para mandar a /tarjeta al terminar, y fuera del
// App Router ese hook lanza "invariant expected app router to be mounted".
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('../StepFanData', () => ({ StepFanData: () => <div>Step 1</div> }))
jest.mock('../StepTrivia', () => ({ StepTrivia: () => <div>Step 2</div> }))
jest.mock('../StepCamera', () => ({ StepCamera: () => <div>Step 3</div> }))
jest.mock('../StepSummary', () => ({ StepSummary: () => <div>Step 4</div> }))

describe('FanForm', () => {
  it('renders step 1 initially', () => {
    render(<FanForm />)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.queryByText('Step 2')).not.toBeInTheDocument()
  })
})
