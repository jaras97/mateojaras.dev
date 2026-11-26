# 05-01 Verificación del dominio mateojaras.dev

Fecha: 2026-11-26.

## Respuesta de Teo (sin valores)

> "listo A-H, redeploy: sí"

Datos de la sesión: Vercel Domains tiene mateojaras.dev en Production y www.mateojaras.dev como Redirect 308 al apex. Porkbun: A @ 216.198.79.1 y CNAME www a un destino `*.vercel-dns-017.com`; registros de parking borrados y URL forwarding apagado. Registros de Resend publicados (MX/SPF en `send`, DKIM en `resend._domainkey`, `_dmarc` p=none), verificados con dig. Decisión de Teo: una sola base Upstash para Production y Preview (ver docs/decisions.md).

## Redeploy

- Redeploy 1 de Production: `mateojaras-i0rqi41bj-mateos-projects-85710491.vercel.app`, Ready en 2 min. check-live falló en 10 líneas: el build seguía con el host vercel.app.
- Diagnóstico: `vercel env ls production` no mostraba `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY` ni `KV_REST_API_*`, y `BETTER_AUTH_URL` tenía 10 días.
- Corrección (paso F del plan, valores no secretos): se creó `NEXT_PUBLIC_SITE_URL=https://mateojaras.dev` en Production y se recreó `BETTER_AUTH_URL` (sensible) con el mismo valor.
- Redeploy 2 de Production: Ready en 2 min, alias `https://mateojaras.dev`.

## Trazadores de la tarea 1 (contra el vercel.app de hoy)

- `--only=domain` sobre https://mateojaras-dev.vercel.app: `RESULT: all PASS` (www SKIP, no es un origen apex).
- Con `--expect-host=mateojaras.dev`: exit 1 con 10 líneas FAIL (canonical, hreflang, og:url, sitemap, robots y ambos resume).

## check-live en el apex (2026-11-26 16:31 UTC, tras el redeploy 2)

```
PASS domain: GET / answers 200
PASS domain: canonical on / uses https://mateojaras.dev
PASS domain: hreflang alternates on / use https://mateojaras.dev
PASS domain: og:url on / uses https://mateojaras.dev
PASS domain: GET /es answers 200
PASS domain: canonical on /es uses https://mateojaras.dev
PASS domain: hreflang alternates on /es use https://mateojaras.dev
PASS domain: og:url on /es uses https://mateojaras.dev
PASS domain: sitemap has 9 <loc> all on https://mateojaras.dev
PASS domain: robots.txt Sitemap line uses the expected host
PASS domain: /resume.json basics.url is https://mateojaras.dev
PASS domain: /resume.es.json basics.url is https://mateojaras.dev
PASS domain: www answers 308 to the apex
RESULT: all PASS
```

## dig (resolvers 1.1.1.1)

- `mateojaras.dev A` = 216.198.79.1
- `www.mateojaras.dev CNAME` = 95975dcfd419df21.vercel-dns-017.com.

## Login del admin en el apex

`GET https://mateojaras.dev/admin/login` responde 200 (sin iniciar sesión). Login real: pendiente de confirmar por Teo (lote 05-03).

## Base de datos Production vs Preview

prod-db != preview-db: no verificable. `vercel env pull` devuelve vacíos los valores de las variables Sensitive, y `DATABASE_URL` es Sensitive en ambos entornos, así que la comparación dio `false` por falta de datos y no por igualdad. Archivos temporales borrados del scratchpad. Pendiente: Teo confirma en el dashboard de Neon que Production usa la rama `main` y Preview la rama `dev`.

## Contacto en vivo (D-22)

contact-live: pendiente. Production no tiene `RESEND_API_KEY` ni `KV_REST_API_URL`/`KV_REST_API_TOKEN` (ni Preview). No se ejecutó el spec. 05-07 lo vuelve a correr como puerta dura.

## CV

`check-cv-pdf https://mateojaras.dev/cv/{en,es}.pdf --reject-text=vercel.app`:

```
FAIL https://mateojaras.dev/cv/en.pdf: missing á ó ú ñ; found text "vercel.app"
FAIL https://mateojaras.dev/cv/es.pdf: found text "vercel.app"
```

Esperado hasta regenerar el CV (el "missing á ó ú ñ" del PDF en inglés viene de la comprobación de caracteres por defecto, que aplica al PDF en español).

## Otros estados

- Secretos de GitHub Actions: `gh secret list` muestra ADMIN_EMAIL y ADMIN_PASSWORD.
- Search Console: estado no verificado por Claude (dashboard).
- Web Analytics: estado de dashboard no verificable por CLI; Teo lo confirma.

## Pendientes

1. Vercel Production y Preview: crear `RESEND_API_KEY` (no existe en ninguno de los dos).
2. Vercel Production y Preview: conectar Upstash (`KV_REST_API_URL` y `KV_REST_API_TOKEN`; no existen). Una sola base compartida, decisión de Teo.
3. Tras 1 y 2: redeploy de Production y `contact-live` (pendiente Resend/Upstash; el estado de verificación del dominio en Resend tampoco está confirmado).
4. Confirmar en Neon que Production usa `main` y Preview usa `dev` (el boolean no es verificable por CLI).
5. Admin login en apex: pendiente de confirmar por Teo (lote 05-03).
6. CV: regenerar en/es en https://mateojaras.dev/admin/cv (hoy contienen vercel.app), para el lote 05-03.
7. Search Console (Domain property verificada por TXT) y Web Analytics activado: confirmar por Teo.
