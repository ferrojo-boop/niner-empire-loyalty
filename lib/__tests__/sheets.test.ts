// eslint-disable-next-line no-var
var mockAppend: jest.Mock

jest.mock('googleapis', () => {
  mockAppend = jest.fn().mockResolvedValue({ data: {} })
  return {
    google: {
      auth: {
        GoogleAuth: jest.fn().mockImplementation(() => ({
          getClient: jest.fn().mockResolvedValue({}),
        })),
      },
      sheets: jest.fn().mockReturnValue({
        spreadsheets: {
          values: {
            append: mockAppend,
          },
        },
      }),
    },
  }
})

// Must import AFTER mock is defined
import { appendFanRow } from '../sheets'

describe('appendFanRow', () => {
  beforeEach(() => {
    mockAppend.mockClear()
  })

  it('calls the Sheets API with correct row data', async () => {
    const fan = {
      id: 'NEL-123',
      nombre: 'Fernando Rojo',
      email: 'fer@example.com',
      whatsapp: '+521234567890',
      fanDesde: 1995,
      urlFoto: 'https://example.com/photo.jpg',
      fechaHora: '2026-06-15T10:00:00Z',
    }

    await appendFanRow(fan)

    expect(mockAppend).toHaveBeenCalledWith(expect.objectContaining({
      range: 'NinerEmpireFans!A:H',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[
          'NEL-123',
          'Fernando Rojo',
          'fer@example.com',
          '+521234567890',
          1995,
          2026,
          'https://example.com/photo.jpg',
          '2026-06-15T10:00:00Z',
        ]],
      },
    }))
  })

  it('throws a domain error when the API call fails', async () => {
    mockAppend.mockRejectedValueOnce(new Error('API quota exceeded'))
    const fan = {
      id: 'NEL-456',
      nombre: 'Test User',
      email: 't@t.com',
      whatsapp: '',
      fanDesde: 2000,
      urlFoto: 'https://example.com/p.jpg',
      fechaHora: '2026-06-15T10:00:00Z',
    }
    await expect(appendFanRow(fan)).rejects.toThrow('Failed to append fan row for id=NEL-456')
  })
})
