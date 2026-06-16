import { appendFanRow } from '../sheets'

jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn().mockImplementation(() => ({
        getClient: jest.fn().mockResolvedValue({}),
      })),
    },
    sheets: jest.fn().mockReturnValue({
      spreadsheets: {
        values: {
          append: jest.fn().mockResolvedValue({ data: {} }),
        },
      },
    }),
  },
}))

describe('appendFanRow', () => {
  it('calls sheets API with correct row data', async () => {
    const fan = {
      id: '123',
      nombre: 'Fernando Rojo',
      email: 'fer@example.com',
      whatsapp: '+521234567890',
      fanDesde: 1995,
      urlFoto: 'https://example.com/photo.jpg',
      fechaHora: '2026-06-15T10:00:00Z',
    }
    await expect(appendFanRow(fan)).resolves.not.toThrow()
  })
})
