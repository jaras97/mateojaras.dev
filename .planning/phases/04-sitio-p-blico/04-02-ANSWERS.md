# 04-02 Respuestas de Teo

Fecha: 2026-11-22

## Respuesta

> como segun recomiendes

Contexto: respuesta única a la solicitud de inicio de fase (ítems A..E, más la propuesta de copy del label de idioma). "Según recomiendes" = los valores por defecto ofrecidos.

## Lectura

A: luego
B: luego
C: luego
D: sí
E: a
G: sí (label)

Notas por ítem (solo presencia, nunca valores):
- A: Resend sin configurar. `RESEND_API_KEY` no está en Production ni Preview y no hay registros DKIM/SPF en DNS. El código queda tras la comprobación de la variable; los mensajes se guardan y se marcan "Email no enviado".
- B: Upstash sin configurar (`UPSTASH_REDIS_REST_*` y `KV_REST_API_*` no están). El formulario falla cerrado con "no disponible".
- C: sin URL de Cal.com; el enlace no se muestra.
- D: Teo completa ManuJ desde el admin antes del día 10 (vacíos hoy: tagline, problem, role, case_study, results, metrics, tech_decisions en/es, cover_image, media, started_at/finished_at). `e2e-stale-probe` (published, visible, order 998) pasa a borrador desde el admin. 04-11 debe verificar que está en borrador antes de las capturas; si sigue publicado, 04-11 lo consulta o lo gestiona.
- E: opción a. Claude corre `pnpm dlx lighthouse` contra el Preview con el bypass de protección de Vercel. `VERCEL_AUTOMATION_BYPASS_SECRET`: no set; 04-11 lo pide cuando llegue.
- G: Teo aprobó el cambio de copy del enlace de idioma para axe `label-content-name-mismatch`: el aria-label empieza por el texto visible, p. ej. "ES, ver esta página en español" / "EN, view this page in English" (sin raya).
