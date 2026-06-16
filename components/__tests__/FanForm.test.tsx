import { render, screen } from '@testing-library/react'
import { FanForm } from '../FanForm'

jest.mock('../StepFanData', () => ({ StepFanData: () => <div>Step 1</div> }))
jest.mock('../StepTrivia', () => ({ StepTrivia: () => <div>Step 2</div> }))
jest.mock('../StepCamera', () => ({ StepCamera: () => <div>Step 3</div> }))
jest.mock('../ProgressBar', () => ({ ProgressBar: () => <div>Progress</div> }))
jest.mock('../FanCard', () => ({ FanCard: () => <div>Card</div> }))

describe('FanForm', () => {
  it('renders step 1 initially', () => {
    render(<FanForm />)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.queryByText('Step 2')).not.toBeInTheDocument()
  })
})
