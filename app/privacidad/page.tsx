import type { Metadata } from 'next'
import './privacidad.css'

// Datos del responsable. Cámbialos aquí y se actualizan en todo el aviso.
const CONTACTO = 'privacidad@ninerempiremexico.mx'
const DOMICILIO = 'Ciudad de México, México'
const ACTUALIZACION = '11 de agosto de 2026'

export const metadata: Metadata = {
  title: 'Aviso de Privacidad | Niner Empire México',
  description:
    'Cómo Niner Empire México recaba, usa y protege los datos personales de sus miembros.',
}

export default function PrivacidadPage() {
  return (
    <main className="privacy-page">
      <article className="privacy-doc">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="privacy-crest" src="/NinerEmpireMXok.png" alt="Niner Empire México" />

        <h1>Aviso de Privacidad</h1>
        <p className="privacy-lead">
          Este aviso explica, sin letras chiquitas, qué datos te pedimos para tu membresía digital,
          para qué los usamos y cómo puedes pedirnos que los corrijamos o los borremos.
        </p>
        <p className="privacy-date">Última actualización: {ACTUALIZACION}</p>

        <section>
          <h2>1. Quién es responsable de tus datos</h2>
          <p>
            <strong>Niner Empire México</strong> (en adelante, «el Club»), club de fans de los San
            Francisco 49ers con sede en {DOMICILIO}, es responsable del tratamiento y la protección
            de los datos personales que nos compartes al registrarte para obtener tu membresía
            digital.
          </p>
          <p>
            Puedes contactarnos en{' '}
            <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a> para cualquier asunto relacionado con tus
            datos personales.
          </p>
        </section>

        <section>
          <h2>2. Qué datos recabamos</h2>
          <p>Los que tú capturas en el formulario de registro:</p>
          <ul>
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Número de WhatsApp</li>
            <li>Año desde el que eres fan</li>
            <li>Jugador favorito (opcional)</li>
            <li>Una fotografía tuya, tomada con la cámara o subida desde tu dispositivo</li>
          </ul>
          <p>Y los que se generan solos cuando usas tu membresía:</p>
          <ul>
            <li>Tu número de miembro y el identificador de tu tarjeta</li>
            <li>La fecha de tu registro</li>
            <li>
              El registro de tus asistencias: fecha y hora de cada visita, y qué integrante del
              staff escaneó tu código QR
            </li>
          </ul>
          <p className="privacy-note">
            No te pedimos datos financieros, patrimoniales ni datos personales sensibles. Tu
            fotografía se usa únicamente para identificarte a simple vista: no aplicamos
            reconocimiento facial ni generamos datos biométricos a partir de ella.
          </p>
        </section>

        <section>
          <h2>3. Para qué usamos tus datos</h2>

          <h3>Finalidades necesarias</h3>
          <p>Sin estos usos no podríamos darte tu membresía:</p>
          <ul>
            <li>
              Crear y emitir tu tarjeta digital, que incluye tu nombre, tu foto, tu número de
              miembro y un código QR.
            </li>
            <li>
              Identificarte como miembro y registrar tu asistencia a las reuniones y eventos del
              Club cuando el staff escanea tu código.
            </li>
            <li>
              Permitirte recuperar tu tarjeta más adelante usando el correo con el que te
              registraste.
            </li>
            <li>Atender tus dudas y solicitudes sobre tu membresía.</li>
          </ul>

          <h3>Finalidades adicionales</h3>
          <p>
            No son necesarias para tu membresía y puedes negarte a ellas en cualquier momento sin
            que eso afecte tu registro ni tu acceso a los eventos:
          </p>
          <ul>
            <li>
              Enviarte avisos por correo electrónico o WhatsApp sobre partidos, reuniones, eventos y
              actividades del Club.
            </li>
            <li>
              Publicar tu fotografía y tu nombre en las redes sociales del Club, en la galería de
              este sitio y en materiales de difusión de la comunidad.
            </li>
            <li>
              Elaborar estadísticas internas —cuántos miembros somos, antigüedad, asistencia— para
              organizar mejor las actividades.
            </li>
          </ul>
          <p>
            Si no quieres que usemos tus datos para alguna de estas finalidades adicionales,
            escríbenos a <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a> indicando cuál. Puedes
            hacerlo antes o después de registrarte.
          </p>
        </section>

        <section>
          <h2>4. Tu tarjeta vive en un enlace público</h2>
          <p>
            Queremos que esto quede claro: para que puedas abrir, descargar y compartir tu
            membresía desde cualquier teléfono, tu tarjeta se publica en una dirección única de
            este sitio que muestra <strong>tu nombre, tu foto y tu número de miembro</strong>. Esa
            dirección no la enlazamos desde ninguna sección pública del sitio, pero cualquier
            persona que la tenga puede abrirla.
          </p>
          <p>
            Tu correo, tu WhatsApp y tu historial de asistencias <strong>nunca</strong> se muestran
            en esa página. Ten en cuenta también que la función «recuperar mi tarjeta» localiza tu
            membresía con tu correo electrónico, así que quien conozca tu correo podría llegar a la
            vista pública de tu tarjeta.
          </p>
          <p>
            Si prefieres que tu tarjeta deje de estar disponible en línea, pídenoslo a{' '}
            <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a> y la damos de baja.
          </p>
        </section>

        <section>
          <h2>5. Con quién compartimos tus datos</h2>
          <p>
            <strong>No vendemos, rentamos ni comercializamos tus datos personales.</strong> Tampoco
            los entregamos a patrocinadores ni a terceros con fines publicitarios.
          </p>
          <p>
            Para que el registro funcione usamos proveedores de tecnología que almacenan la
            información por cuenta del Club y siguiendo nuestras instrucciones:
          </p>
          <ul>
            <li>
              <strong>Supabase Inc.</strong> — base de datos y almacenamiento de las fotografías
              (servidores en Estados Unidos).
            </li>
            <li>
              <strong>Vercel Inc.</strong> — hospedaje de este sitio web (servidores en Estados
              Unidos).
            </li>
          </ul>
          <p>
            Estos proveedores no pueden usar tus datos para fines propios. Fuera de estos casos,
            solo compartiríamos tu información si una autoridad competente nos lo requiere conforme
            a la ley.
          </p>
        </section>

        <section>
          <h2>6. Cuánto tiempo conservamos tus datos</h2>
          <p>
            Conservamos tus datos mientras seas miembro del Club y hasta 24 meses después de tu
            última actividad registrada. Pasado ese plazo, los eliminamos o los convertimos en
            estadísticas que ya no permiten identificarte. Si nos pides antes la cancelación,
            borramos tu registro y tu fotografía sin esperar a ese plazo.
          </p>
        </section>

        <section>
          <h2>7. Tus derechos sobre tus datos (derechos ARCO)</h2>
          <p>En cualquier momento puedes pedirnos:</p>
          <ul>
            <li>
              <strong>Acceso:</strong> saber qué datos tuyos tenemos y para qué los usamos.
            </li>
            <li>
              <strong>Rectificación:</strong> corregir un dato equivocado o desactualizado, incluida
              tu fotografía.
            </li>
            <li>
              <strong>Cancelación:</strong> que eliminemos tus datos de nuestros registros.
            </li>
            <li>
              <strong>Oposición:</strong> que dejemos de usarlos para un fin específico.
            </li>
            <li>
              <strong>Revocar tu consentimiento:</strong> retirar el permiso que nos diste para
              tratar tus datos.
            </li>
          </ul>
          <p>
            Escríbenos a <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a> desde el correo con el que te
            registraste e incluye tu nombre completo, qué es lo que solicitas y, si aplica, el dato
            que quieres corregir. Te responderemos en un plazo máximo de 20 días hábiles y, si tu
            solicitud procede, la haremos efectiva dentro de los 15 días hábiles siguientes. El
            trámite es gratuito.
          </p>
        </section>

        <section>
          <h2>8. Menores de edad</h2>
          <p>
            Si eres menor de 18 años, necesitas que tu padre, madre o tutor conozca este aviso y
            autorice tu registro. Si detectamos el registro de un menor sin esa autorización,
            eliminamos sus datos al ser notificados.
          </p>
        </section>

        <section>
          <h2>9. Cookies y rastreo</h2>
          <p>
            Este sitio no usa cookies publicitarias ni rastreadores de terceros. Solo empleamos el
            almacenamiento propio de tu navegador para que el formulario funcione mientras lo
            completas.
          </p>
        </section>

        <section>
          <h2>10. Cambios a este aviso</h2>
          <p>
            Si cambiamos la forma en que tratamos tus datos, actualizaremos este aviso en esta misma
            página y modificaremos la fecha de la parte superior. Te recomendamos revisarla de vez
            en cuando.
          </p>
          <p>
            Si consideras que tu derecho a la protección de datos personales fue vulnerado, puedes
            acudir a la autoridad competente en México en materia de protección de datos personales.
          </p>
        </section>

        <a href="/" className="privacy-back">
          ← Volver al inicio
        </a>
      </article>
    </main>
  )
}
