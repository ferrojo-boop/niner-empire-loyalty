import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// En el plan gratuito Supabase pausa el proyecto tras ~una semana sin uso, y
// despausarlo tarda varios minutos durante los cuales la app queda inservible
// —y, peor, el estado intermedio imita una pérdida total de datos (ver CLAUDE.md).
//
// Fuera de temporada no hay watch parties, así que no hay tráfico que mantenga
// vivo el proyecto: sin este ping se pausa solo, todos los años, entre febrero
// y septiembre. Lo dispara el cron de Vercel una vez al día; como el umbral de
// Supabase es de ~7 días, eso deja 7x de margen para tolerar días fallidos.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Vercel manda este header cuando CRON_SECRET está definido en el proyecto.
  // Si no está definido, el endpoint queda abierto: es de solo lectura y no
  // expone datos, pero conviene definirlo para que nadie más lo invoque.
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  // Se tocan los dos servicios por separado porque se despiertan por separado:
  // durante un restore, PostgREST puede seguir devolviendo PGRST205 mientras
  // Storage ya responde, y al revés. Un ping que solo mire uno se cree sano.
  const { count, error: dbError } = await supabase
    .from('fans')
    .select('fan_id', { count: 'exact', head: true })

  const { data: buckets, error: storageError } = await supabase.storage.listBuckets()

  const ok = !dbError && !storageError

  return NextResponse.json(
    {
      ok,
      fecha: new Date().toISOString(),
      db: dbError ? dbError.message : `ok (${count} miembros)`,
      storage: storageError ? storageError.message : `ok (${buckets?.length ?? 0} buckets)`,
    },
    { status: ok ? 200 : 503 }
  )
}
