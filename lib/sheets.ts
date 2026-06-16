import { google } from 'googleapis'

export interface FanRow {
  id: string
  nombre: string
  email: string
  whatsapp: string
  fanDesde: number
  urlFoto: string
  fechaHora: string
}

const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const privateKey = process.env.GOOGLE_PRIVATE_KEY
const sheetId = process.env.GOOGLE_SHEET_ID

if (!email || !privateKey || !sheetId) {
  throw new Error(
    'Missing required Google Sheets env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID'
  )
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: email,
    private_key: privateKey.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheetsClient = google.sheets({ version: 'v4', auth })

export async function appendFanRow(fan: FanRow): Promise<void> {
  const anioRegistro = new Date(fan.fechaHora).getFullYear()

  try {
    await sheetsClient.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'NinerEmpireFans!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[
          fan.id,
          fan.nombre,
          fan.email,
          fan.whatsapp,
          fan.fanDesde,
          anioRegistro,
          fan.urlFoto,
          fan.fechaHora,
        ]],
      },
    })
  } catch (err) {
    throw new Error(`Failed to append fan row for id=${fan.id}: ${err instanceof Error ? err.message : String(err)}`)
  }
}
