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

Actualizado 2026-11-26 tras la respuesta de Teo (ver 05-APPROVALS.md).

1. RESUELTO: `RESEND_API_KEY` creada en Production y Preview.
2. RESUELTO: Upstash `UPSTASH_REDIS_REST_URL/TOKEN` creadas solo en Production (decisión de Teo; el contacto en Preview falla cerrado por diseño).
3. RESUELTO: Production redeployed 2026-11-26. contact-live: verificado a mano por Teo en producción (formulario enviado, pantalla de gracias, email recibido, mensaje en /admin/messages). No se ejecutó el spec automático porque `DATABASE_URL` de Production es Sensitive y no se puede descargar con `vercel env pull`.
4. RESUELTO por decisión de Teo: la comprobación prod-db != preview-db se omite ("no importa"). Vercel muestra entradas `DATABASE_URL` separadas por entorno.
5. RESUELTO: login del admin en el apex confirmado (Teo accedió a /admin/messages en https://mateojaras.dev).
6. RESUELTO: CV regenerado. `check-cv-pdf https://mateojaras.dev/cv/es.pdf --reject-text=vercel.app` PASS; `en.pdf --chars=í --reject-text=vercel.app --expect-text=mateojaras.dev` PASS.
7. RESUELTO: Search Console verificado y Web Analytics activado (confirmado por Teo).
