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

export async function appendFanRow(fan: FanRow): Promise<void> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  const anioRegistro = new Date().getFullYear()

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'NinerEmpireFans!A:H',
    valueInputOption: 'USER_ENTERED',
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
}
