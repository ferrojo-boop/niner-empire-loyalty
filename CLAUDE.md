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
`whatsapp`, `fan_desde`, `jugador_favorito`, `foto_url`, `tarjeta_url`
(en desuso: se conserva por los registros viejos, ya no se escribe ni se lee),
`ano_registro`, `created_at`.

Restricciones `UNIQUE` en `fans`: `fan_id`, `email` y `member_number`. La clave
primaria es `id`, que la app no usa. Las tres importan porque el alta las choca
en la práctica y `/api/submit` distingue entre ellas por el nombre de la
restricción en el mensaje de error.

### Formato del `fan_id`

    NEL-<timestamp en ms>-<8 hex>      p. ej. NEL-1788729281989-a3f1c2d0

**El sufijo aleatorio no es decorativo.** Antes el id era solo
`NEL-${Date.now()}`, y con `UNIQUE (fan_id)` dos altas en el mismo milisegundo
chocaban: la segunda moría con un 500 genérico, el socio perdía su registro y
su foto quedaba huérfana en Storage. Con la gente llegando de a poco el riesgo
era del 0.3%, pero proyectando el QR para que todos se registren a la vez —100
personas en 10 segundos— subía al 39%. El timestamp se conserva porque se lee
bien y ordena por antigüedad.

Como respaldo, `/api/submit` reintenta hasta 3 veces con un id nuevo si choca
`fans_fan_id_key`. Cualquier otro choque se responde de una vez: generar otro
id no lo arreglaría.

**Los ids viejos (`NEL-<timestamp>`, sin sufijo) siguen siendo válidos** y no
se migraron. Cualquier código que toque `fan_id` debe tratarlo como texto
opaco, sin asumir largo ni número de guiones. El `fan_id` no se muestra en la
tarjeta —ahí va `member_number`—, solo viaja en el QR y en las URLs.

Buckets de Storage, ambos públicos:

- `fan-photos` — foto del fan, límite 5 MB, JPEG/PNG/WebP/HEIC/HEIF
- `fan-cards` — **en desuso.** Guardaba la tarjeta rasterizada; ya nada escribe
  ahí ni lee de ahí. Solo conserva las tarjetas de los primeros registros.

## Rutas

Páginas: `/` (registro), `/tarjeta/[fanId]`, `/checkin/[fanId]`, `/recuperar`,
`/staff`, `/staff/definir-password`, `/privacidad`.

API: `/api/submit`, `/api/upload-photo`, `/api/recuperar`, `/api/keep-alive`,
`/api/fan/[fanId]`, `/api/checkin/[fanId]`, `/api/staff/me`.

El candado de staff vive en el servidor (`lib/requireStaff.ts`): valida el
Bearer token contra Supabase Auth y exige que el usuario esté en `staff` con
`activo = true`. No confiar en la interfaz para esto.

## Capacidad: el plan gratuito de Supabase

**La tarjeta no se archiva.** `/tarjeta/[fanId]` la rearma en el navegador cada
vez, a partir de cuatro cosas que ya existen: `nombre` y `member_number` de la
base, la foto del bucket, y el QR que se genera al vuelo desde el `fan_id`. El
JPEG solo se materializa cuando el socio lo descarga o lo comparte, y se queda
en su celular.

De ahí que **lo único que pesa por miembro sea la foto**, y que el archivo
verdaderamente irreemplazable sea esa foto: si se pierde, la tarjeta ya no se
puede reconstruir.

| Concepto | Peso |
|---|---|
| Foto a `QUALITY` 0.85 | 400 y 511 KB — medidos 2026-09-05 |
| Foto a `QUALITY` 0.80 (actual) | **337 KB** — medido 2026-09-06 |

Ojo con ese 337 KB: es **una sola foto**, y de un sujeto distinto al de las
otras dos. El peso de un JPEG depende tanto del contenido como de la calidad,
así que no es limpio atribuirle toda la diferencia al cambio de 0.85 a 0.80.
Sirve como dato real de lo que pesa una foto hoy, no como medida del ahorro.
Para planear conviene usar **400 KB**, que deja margen sobre lo medido.

- **Almacenamiento**: 1 GB → **~2,900 miembros** a 337 KB, o ~2,400 a 400 KB.
- **Egress**: 5 GB/mes, y solo lo consume la foto. Además se sube con
  `cacheControl` de un año sobre una URL inmutable (lleva timestamp y nunca se
  sobrescribe), así que las visitas repetidas del mismo socio salen del caché
  del navegador y no cuentan.

Objetivo de la temporada 2026-27: **1,000 miembros ≈ 345 MB, el 35% del plan
gratuito** (410 MB / 41% si se planea con 400 KB por foto).

Los miembros registrados antes del 2026-08-14 pesan ~3.3 MB (tarjeta en PNG y
foto sin comprimir). El bucket `fan-cards` ya no recibe nada; conserva las
tarjetas de los primeros registros y se puede vaciar cuando se quiera.

Si algún día aprieta, la siguiente palanca es Cloudflare R2 (10 GB y egress
cero, sin costo) solo para las fotos, dejando base y auth en Supabase.

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

### El cron que lo evita

`/api/keep-alive` toca la base y Storage una vez al día, disparado por el cron
de Vercel declarado en `vercel.json` (`0 14 * * *`, o sea 14:00 UTC). Con el
umbral de Supabase en ~7 días, un ping diario deja 7x de margen para tolerar
días fallidos.

Toca **los dos servicios por separado a propósito**: durante un restore se
despiertan a destiempo —PostgREST puede seguir devolviendo `PGRST205` mientras
Storage ya responde, y al revés—, así que un ping que solo mirara uno se creería
sano. Devuelve 503 si cualquiera de los dos falla.

Existe por el offseason: entre febrero y septiembre no hay watch parties y no
hay tráfico que mantenga vivo el proyecto.

`CRON_SECRET` es opcional. Si está definido en Vercel, el endpoint exige
`Authorization: Bearer $CRON_SECRET` (Vercel lo manda solo en las invocaciones
del cron); si no está, el endpoint queda abierto. Es de solo lectura y no expone
datos, pero conviene definirlo.

## Despliegue

Producción: <https://niner-empire-loyalty.vercel.app> (sin dominio propio).
Los deploys de preview están detrás de Vercel Authentication.
