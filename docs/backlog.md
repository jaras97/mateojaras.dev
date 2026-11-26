# Backlog — después de la v1

Nada de esta lista se construye antes de que mateojaras.dev esté en producción. Si Claude Code propone algo de aquí durante la v1, la respuesta es "backlog".

## Contenido (nuevas entidades en el admin)
- [ ] Courses / certificaciones (name, issuer, date, credential_url, skills)
- [ ] Services ("How I work": qué entrego, para quién, proceso; sin precios)
- [ ] Testimonials (author, role, company, quote, video_url, project, can_publish)
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
- [ ] Lenis (scroll suave), evaluando choque con scroll-snap y rutas
- [ ] ViewTransition entre rutas si el flag de React se estabiliza
- [ ] Typst como alternativa de PDF si react-pdf se queda corto
- [ ] Open-source del repo con README en inglés y guía de contribución
- [ ] Monitoreo (Sentry) y alertas de uptime
- [ ] Arreglar los hallazgos de 04.1-CODE-REVIEW.md antes de volver a usar scripts/load-content.ts (D-19). CR-01 (el grupo settings descarta un borrador del admin sin avisar) y WR-06 (limpiar borradores de proyecto destruye ediciones de casos sin publicar) descartan borradores sin avisar. WR-01 (el loader no invalida tags ni corre exportContent), WR-02 (apply es atómico por grupo, no por ejecución), WR-03 (`--target=dev` es una comprobación negativa), WR-04 (el dry-run contra main exige `--allow-production`), WR-05 (las claves naturales incluyen campos editables), WR-07 (`readHeadline` trunca un titular de más de una línea `>`)
