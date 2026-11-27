# Backlog — después de la v1

Nada de esta lista se construye antes de que mateojaras.dev esté en producción. Si Claude Code propone algo de aquí durante la v1, la respuesta es "backlog".

## Contenido (nuevas entidades en el admin)
- [ ] Courses / certificaciones (name, issuer, date, credential_url, skills)
- [ ] Services ("How I work": qué entrego, para quién, proceso; sin precios). Revisión K-09: el cliente freelance echó en falta proceso, forma de cobro y soporte posterior; los precios no entran
- [ ] Testimonials (author, role, company, quote, video_url, project, can_publish). Revisión K-08: ninguna página tiene citas de clientes; hace falta una cita real y el permiso de la persona
- [ ] Posts (blog corto: MDX o Tiptap, tags, reading_time)
- [ ] Pages genéricas con bloques (uses, talks)
- [ ] Caso de estudio del propio portafolio, usando docs/decisions.md

## Capas dinámicas (solo si aportan; cada una con fallback probado)
- [ ] Command palette ⌘K (cmdk) con proyectos y acciones
- [ ] Contribuciones de GitHub y último commit (API de GitHub, cacheado 1 h)
- [ ] Contador de vistas por proyecto (page_views)
- [ ] Guestbook con moderación desde el admin
- [ ] Changelog del sitio (changelog_entries) como feed
- [ ] Demo de solo lectura del admin (/admin?demo=1) con datos reales y sin escritura
- [ ] Botón "traducir con IA" en el admin (Claude API) como borrador

## Técnica
- [ ] Slugs de proyecto localizados (`/projects/bot-arbitraje` en el sitio en inglés): requiere cambiar el modelo de datos y la guardia de slugs publicados (revisión K-25)
- [ ] JSON-LD (Person y WebSite) en la home y título propio por idioma si se mantiene (revisión K-30)
- [ ] Miniaturas en la lista de proyectos de la home y algún proyecto visible sobre el pliegue a 1440 x 900: cambia el diseño (revisión K-23)
- [ ] Lenis (scroll suave), evaluando choque con scroll-snap y rutas
- [ ] ViewTransition entre rutas si el flag de React se estabiliza
- [ ] Typst como alternativa de PDF si react-pdf se queda corto
- [ ] Open-source del repo con README en inglés y guía de contribución
- [ ] CSP con hashes o SRI en script-src (quitar 'unsafe-inline') (D-17)
- [ ] Eventos propios de analytics (CV, contacto, Cal.com): requieren Umami o Vercel Pro
- [ ] Speed Insights
- [ ] Monitoreo (Sentry) y alertas de uptime
- [ ] Arreglar los hallazgos de 04.1-CODE-REVIEW.md antes de volver a usar scripts/load-content.ts (D-19). CR-01 (el grupo settings descarta un borrador del admin sin avisar) y WR-06 (limpiar borradores de proyecto destruye ediciones de casos sin publicar) descartan borradores sin avisar. WR-01 (el loader no invalida tags ni corre exportContent), WR-02 (apply es atómico por grupo, no por ejecución), WR-03 (`--target=dev` es una comprobación negativa), WR-04 (el dry-run contra main exige `--allow-production`), WR-05 (las claves naturales incluyen campos editables), WR-07 (`readHeadline` trunca un titular de más de una línea `>`)

## Revisión de la fase 5 (preguntas abiertas, sin inventar nada)
- [ ] Q1 (K-01, K-27, K-30): titular y público objetivo. ¿Para quién trabaja Teo? El único hecho en docs/copy.md es "Busco proyectos con un problema claro y alguien que decida del otro lado". En `/es`: ¿se traducen "AI full stack developer" y los cargos en inglés? Toca docs/copy.md y el título SEO de /es
- [ ] Q2 (K-02): cronología de Metales y Brillantes. ¿Cuándo empezó a usarse y en qué rol lo construyó (estaba en Sofka)? Falta el hecho; `startedAt` está pendiente en docs/content
- [ ] Q3 (K-03, K-04, K-14, K-18, K-19, K-20): material y hechos de los casos. Metales: rol, decisiones, capturas con permiso. Prendo, bot y Metales: capturas o diagramas, y el texto "Te muestro una demo". Bot: cifras reales o confirmar que queda cualitativo. ManuJ: capturas del panel, motivo de Supabase para el cliente, cifras con fuente (D-10)
- [ ] Q5 (K-10, K-23): estilo de la etiqueta "Internal tool, sample data" (toca DESIGN.md), si `sampleData` de Metales es correcto, fechas y orden de los proyectos sin fecha
- [ ] Q6 (K-15, K-16): enlace para agendar (Cal.com, cuenta nueva), buzón en mateojaras.dev, guía en el formulario (presupuesto, plazo), señal de ofertas de empleo y disponibilidad (tiempo completo o contrato, reubicación, employer-of-record). Toca docs/copy.md
- [ ] Q7 (K-21): ajustes de GitHub de Teo: descripción, homepage `https://mateojaras.dev`, licencia, y si `.planning/`, `.agents/` y `.claude/` siguen públicos
