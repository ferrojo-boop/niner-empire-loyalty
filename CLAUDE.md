# NinerEmpireLoyalty

Membresías digitales del Niner Empire México: un fan se registra con su foto,
la app le genera una tarjeta con QR y folio, y el staff del club escanea ese QR
para registrar su asistencia a los watch parties.

## Comandos

```bash
npm run dev     # desarrollo en localhost:3000
npm run build   # build de producción
npm test        # jest
npm run lint
```

## El backend real es Supabase, no Vercel

Vercel solo sirve el Next.js: **no almacena nada por miembro**. Todo lo
persistente vive en Supabase, y es ahí donde están los límites del proyecto.
Cuando surja una pregunta de capacidad, costo o pérdida de datos, el lugar a
mirar es Supabase.

Variables de entorno (las tres, en `.env.local` y en Vercel):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — solo en rutas de servidor, nunca en el cliente

`lib/supabase.ts` expone `getSupabase()` (anon) y `getSupabaseAdmin()`
(service_role). Las rutas de API usan la segunda.

## Esquema

⚠️ **El esquema no está versionado.** No existe `supabase/migrations`, así que
la única fuente de verdad es la base misma. Si se pierde, hay que reconstruirlo
a mano. Documentar aquí cualquier cambio de esquema hasta que existan
migraciones.

Tablas en `public`: `fans`, `staff`, `visits`, `rewards`, `fan_rewards`,
`points_transactions`.

`fans` es la central: `fan_id` (text, el del QR y las URLs), `member_number`
(entero autoincremental, el folio de la tarjeta), `nombre`, `email`,
`whatsapp`, `fan_desde`, `jugador_favorito`, `foto_url`, `tarjeta_url`,
`ano_registro`, `created_at`.

Buckets de Storage, ambos públicos:

- `fan-photos` — foto del fan, límite 5 MB, JPEG/PNG/WebP/HEIC/HEIF
- `fan-cards` — tarjeta ya rasterizada, límite 10 MB, JPEG/PNG

## Rutas

Páginas: `/` (registro), `/tarjeta/[fanId]`, `/checkin/[fanId]`, `/recuperar`,
`/staff`, `/staff/definir-password`, `/privacidad`.

API: `/api/submit`, `/api/upload-photo`, `/api/save-card`, `/api/recuperar`,
`/api/fan/[fanId]`, `/api/checkin/[fanId]`, `/api/staff/me`.

El candado de staff vive en el servidor (`lib/requireStaff.ts`): valida el
Bearer token contra Supabase Auth y exige que el usuario esté en `staff` con
`activo = true`. No confiar en la interfaz para esto.

## Capacidad: el plan gratuito de Supabase

Pesos medidos el 2026-09-05 sobre los archivos ya guardados (no estimados):

| Concepto | Peso |
|---|---|
| Tarjeta JPEG (1778×3842) | ~1.39 MB |
| Foto comprimida | ~450 KB |
| **Total por miembro** | **~1.83 MB** |

- **Almacenamiento**: 1 GB → **~560 miembros**.
- **Egress**: 5 GB/mes → ~3,600 vistas de tarjeta al mes. **Este techo se
  alcanza antes que el de almacenamiento.**

Los miembros registrados antes del 2026-08-14 pesan ~3.3 MB (tarjeta en PNG y
foto sin comprimir). Al pasar de ~560 miembros, lo primero que conviene evaluar
es bajar `CARD_QUALITY` o dejar de archivar la tarjeta y regenerarla al vuelo.

## El proyecto se pausa por inactividad

En el plan gratuito Supabase pausa el proyecto tras ~una semana sin uso, y la
app queda inservible aunque Vercel siga sirviendo la página: el host deja de
resolver en DNS (NXDOMAIN).

**Al despausarlo, el restore tarda varios minutos y el estado intermedio imita
una pérdida total de datos.** Durante ese lapso, con DNS ya resolviendo:

- Una consulta SQL directa reporta `public` y `storage` con 0 tablas y
  `auth.users` en 0.
- PostgREST devuelve `PGRST205: Could not find the table 'public.fans'` porque
  su schema cache aún no se reconstruye. Parece un 404 legítimo.
- Storage devuelve `544 DatabaseTimeout`.

Todo eso es transitorio. **El restore no está completo hasta que
`/storage/v1/bucket` responda 200**; antes de ese punto ningún conteo en cero
es concluyente y no hay que diagnosticar pérdida de datos ni tocar backups.

## Despliegue

Producción: <https://niner-empire-loyalty.vercel.app> (sin dominio propio).
Los deploys de preview están detrás de Vercel Authentication.
