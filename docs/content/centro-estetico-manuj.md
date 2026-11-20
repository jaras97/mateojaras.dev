---
slug: centro-estetico-manuj
enStatus: draft-translation
source: interview-2026-11-20
pendingFields: []
clientPermission: true
sampleData: false
titleEs: "Centro Estético ManuJ"
titleEn: "Centro Estético ManuJ"
taglineEs: "Sitio público y panel de gestión para un centro de estética: citas, clientes y finanzas en un solo lugar."
taglineEn: "Public site and management panel for a beauty salon: appointments, clients and finances in one place."
liveUrl: "https://centroesteticomanuj.com"
repoUrl: "https://github.com/jaras97/Centroesteticomanuj"
startedAt: "2026-08-01"
finishedAt: "2026-08-01"
stack:
  - Next.js
  - Tailwind CSS
  - Supabase
  - Resend
  - Zod
  - Framer Motion
  - Recharts
metrics: []
resultsEs:
  - "La información del negocio, de las clientas y de las finanzas quedó centralizada en un solo lugar."
  - "Tener un sitio público y un panel administrativo le da al centro una imagen profesional."
  - "Agendar citas es más fácil, tanto desde el sitio como desde el panel."
resultsEn:
  - "The business, client and financial information is now centralized in one place."
  - "Having a public site and an admin panel gives the salon a professional image."
  - "Booking appointments is easier, both from the site and from the panel."
techDecisionsEs:
  decisions:
    - title: "Reservas desde el sitio y desde el panel"
      body: "Las clientas pueden reservar en el sitio público, y el centro también puede crear la cita desde el panel. Así las citas que llegan por WhatsApp quedan en la misma agenda sin que la clienta tenga que entrar al sitio."
    - title: "Supabase como backend"
      body: "Elegí Supabase porque su servidor MCP hacía más sencillo trabajar con el agente de IA durante el desarrollo."
    - title: "El dinero se registra al cerrar la cita"
      body: "Cada pago se registra en el momento en que se cierra la cita. Así el centro sabe cuánto ha generado en el mes sin llevar las cuentas aparte."
techDecisionsEn:
  decisions:
    - title: "Bookings from the site and from the panel"
      body: "Clients can book on the public site, and the salon can also create the appointment from the panel. That way, appointments that arrive through WhatsApp end up in the same calendar without the client having to visit the site."
    - title: "Supabase as the backend"
      body: "I chose Supabase because its MCP server made it simpler to work with the AI agent during development."
    - title: "Money is recorded when the appointment is closed"
      body: "Each payment is recorded at the moment the appointment is closed. That way the salon knows how much it has earned in the month without keeping separate accounts."
altStatus: draft
coverImage: material/centro-estetico-manuj/01-inicio.webp
media:
  - file: material/centro-estetico-manuj/01-inicio.webp
    altEs: "Página de inicio de Centro Estético ManuJ: cabecera con el logo, el menú, el teléfono del centro y el botón Reservar cita, y un carrusel con la foto de una mujer maquillada, el titular Maquillaje Profesional y el botón Reservar Cita."
    altEn: "Centro Estético ManuJ home page: header with the logo, the menu, the salon's phone number and the Reservar cita button, and a carousel with a photo of a woman wearing makeup, the headline Maquillaje Profesional and the Reservar Cita button."
    type: image
  - file: material/centro-estetico-manuj/02-galeria.webp
    altEs: "Galería de trabajos de Centro Estético ManuJ: filtros por categoría (Todos, Editorial, Social, Artístico, Profesional) y una cuadrícula de fotos de maquillajes."
    altEn: "Centro Estético ManuJ work gallery: category filters (Todos, Editorial, Social, Artístico, Profesional) and a grid of makeup photos."
    type: image
  - file: material/centro-estetico-manuj/03-reservar.webp
    altEs: "Primer paso de la reserva de citas de Centro Estético ManuJ: indicador de pasos (Servicio, Fecha y hora, Tus datos) y lista de servicios con su duración y su precio."
    altEn: "First step of Centro Estético ManuJ's appointment booking: a step indicator (Servicio, Fecha y hora, Tus datos) and a list of services with their duration and price."
    type: image
---

## problemEs

El centro no tenía un sistema que le diera orden, registro e información de su negocio, de sus clientas y de sus finanzas.

## problemEn

The salon had no system to bring order, records and information to its business, its clients and its finances.

## roleEs

Lo construí solo, de principio a fin, apoyándome en herramientas de IA.

## roleEn

I built it on my own, end to end, with the help of AI tools.

## solutionEs

- Catálogo de servicios
- Galería filtrable
- Reserva de citas desde el sitio y desde el panel
- Agenda de clientas con histórico y cumpleaños
- Cupones
- Registro del dinero al cerrar cada cita
- SEO técnico
- WhatsApp

## solutionEn

- Service catalog
- Filterable gallery
- Appointment booking from the site and from the panel
- Client calendar with history and birthdays
- Coupons
- Money recorded when each appointment is closed
- Technical SEO
- WhatsApp
