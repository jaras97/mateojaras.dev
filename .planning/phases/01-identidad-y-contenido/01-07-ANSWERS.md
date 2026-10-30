# 01-07: respuestas de Teo

## Respuestas de Teo (G4)

Fecha: 2026-10-30

Respuesta única de Teo a la entrevista de los cuatro proyectos (puntos 0 a 10), copiada tal cual:

> pero se supone que en el admin se pueden modificar toda esta info, rellena con info de prueba que luego desde admin actualizo todo

La respuesta cubre los cuatro proyectos a la vez. Cada subsección de abajo copia lo que Teo tenía delante al responder: el prellenado que Claude sacó, solo leyendo, de `PROJECT.md`, `docs/copy.md`, CONTEXT D-12 y D-14, `gh repo list jaras97` y el `package.json` de cada repo. Teo no corrigió ni añadió nada a ese prellenado.

### ManuJ

Fecha: 2026-10-30. Respuesta: la única de arriba.

Prellenado mostrado a Teo:
- Slug propuesto: centro-estetico-manuj.
- Solución (docs/copy.md): catálogo, galería filtrable, reserva de citas, Cloudinary, SEO técnico, WhatsApp.
- Sitio: https://centroesteticomanuj.com
- Repo público: https://github.com/jaras97/Centroesteticomanuj
- Stack según el repo: Next.js 15, Tailwind 3, Supabase, Resend, Zod, Framer Motion, Recharts. El repo no usa Cloudinary, aunque PROJECT.md lo menciona.
- Permiso: sí (D-12).

### EcoExport

Fecha: 2026-10-30. Respuesta: la única de arriba.

Prellenado mostrado a Teo:
- Slug propuesto: ecoexport-costa-rica.
- Solución (PROJECT.md): sitio multilingüe, catálogo, SEO.
- Sitio: https://ecoexportcostarica.com/es
- Repo público: https://github.com/jaras97/ecoExport
- Stack según el repo: Next.js 15, next-intl, Tailwind 3, Framer Motion, next-sitemap, Google Analytics.
- Permiso: sí (D-12).

### Inventario

Fecha: 2026-10-30. Respuesta: la única de arriba.

Prellenado mostrado a Teo:
- Slug propuesto: sistema-gestion-inventario.
- Solución (PROJECT.md): roles, reportes.
- URL pública: PROJECT.md y docs/copy.md dicen que no hay. Existen el repo jaras97/inventario-piedras y inventario-piedras.vercel.app, pero no está confirmado que sean este proyecto.
- Stack de ese repo (sin confirmar que sea este proyecto): Next.js 15, Prisma, PostgreSQL, Auth0/NextAuth, TanStack Table, Recharts, Zustand, Tailwind 4. PROJECT.md: Next.js, PostgreSQL.
- Capturas en local con datos de ejemplo (D-14).
- Permiso: desconocido.

### Finanzas

Fecha: 2026-10-30. Respuesta: la única de arriba.

Prellenado mostrado a Teo:
- Slug propuesto: finanzas-personales.
- Repos públicos: https://github.com/jaras97/finanzas-personal-frontend y https://github.com/jaras97/finanzas-personales-backend
- Sitio en vivo: finanzas-personal-frontend.vercel.app
- Stack según los repos: Next.js 15, Tailwind 4, TanStack Table, Recharts, Zustand, Vitest; FastAPI, SQLModel/SQLAlchemy, Alembic, PostgreSQL.
- Capturas en local con datos de ejemplo (D-14).
- Permiso: desconocido.

## Lectura de G4

- Teo delegó el llenado de los archivos y completará o reemplazará todo desde el admin (fase 3). No dio problema, rol, resultados, decisiones técnicas, fechas, taglines, vistas ni portada.
- Slugs: los cuatro propuestos (centro-estetico-manuj, ecoexport-costa-rica, sistema-gestion-inventario, finanzas-personales) quedan aceptados por delegación y son fijos desde ahora.
- "Info de prueba" no se lee como permiso para inventar: el repo es público y estos archivos alimentan el seed de la fase 2, y CLAUDE.md prohíbe proyectos inventados, lorem ipsum y métricas sin fuente. Solo se usan datos verificables en los repos o ya escritos en los documentos del proyecto (PROJECT.md, docs/copy.md, D-12, D-14).
- Cada campo narrativo que Teo no dio va a `pendingFields`. `metrics` queda vacío en los cuatro.
- Permiso: ManuJ y EcoExport `true` por D-12 (Teo no lo cambió). Inventario y Finanzas: sin sí o no de Teo, `clientPermission` se omite y va a `pendingFields`.
- URLs de Inventario y Finanzas: Teo no confirmó cuál repo o sitio corresponde, así que van a `pendingFields`.
- Vistas y portada (punto 10): ninguna. Todo queda pendiente para 01-10.
