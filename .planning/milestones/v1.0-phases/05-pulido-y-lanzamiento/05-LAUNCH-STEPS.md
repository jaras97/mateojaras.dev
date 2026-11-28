# Fase 5, plan 01: sesión de dashboards (una sola vez)

Hazla en el orden A a H. El DNS de Porkbun se toca una sola vez (sección D), después de reunir los valores de A, B y C.

Reglas: ninguna clave va al chat ni a un archivo versionado. Las variables se pegan solo en `.env.local` y en Vercel → Settings → Environment Variables. Nunca ejecutes `vercel env pull` sobre `.env.local`: lo sobrescribe y pierdes tus valores locales.

## A. Vercel Domains

1. Qué crear: la asignación del dominio al proyecto de Production.
2. Pasos: Vercel → proyecto `mateojaras-dev` → Settings → Domains → Add.
   - Añade `mateojaras.dev` y asígnalo a Production (será el dominio principal).
   - Añade `www.mateojaras.dev` y elige "Redirect to mateojaras.dev" con código 308.
   - Vercel mostrará los registros pendientes: copia el valor del registro A del apex y el valor del CNAME de `www` tal como aparecen en pantalla. No uses una IP recordada de memoria; el CNAME suele ser específico del proyecto (`*.vercel-dns-017.com`).
3. Variable: ninguna. Anota los dos valores para la sección D.

## B. Resend

1. Qué crear: cuenta en Resend, dominio `mateojaras.dev` y una API key.
2. Pasos: resend.com → Domains → Add Domain → `mateojaras.dev`. Resend lista los registros DNS (MX y TXT en `send`, TXT `resend._domainkey`, y opcional `_dmarc`): déjalos abiertos para la sección D. Después API Keys → Create API Key con permiso "Sending access" restringido al dominio `mateojaras.dev`.
3. Variable: `RESEND_API_KEY`.
   - `.env.local`: pégala a mano.
   - Vercel → Settings → Environment Variables: añádela en Production y en Preview.

## C. Search Console

1. Qué crear: una propiedad de tipo Dominio.
2. Pasos: https://search.google.com/search-console → Add property → Domain → `mateojaras.dev` → copia el TXT que empieza por `google-site-verification=`. No pulses Verify todavía.
3. Variable: ninguna. El TXT va en Porkbun (sección D). El sitemap se envía el día del lanzamiento, no ahora.

## D. Porkbun DNS (todo en una pasada)

1. Qué cambiar: los registros DNS de `mateojaras.dev`.
2. Pasos: Porkbun → Domain Management → `mateojaras.dev` → DNS.
   - Borra solo los registros de parking: el ALIAS o A del apex hacia pixie, el CNAME `*` y el CNAME `www` hacia `pixie.porkbun.com`. Si el URL forwarding está activo, desactívalo. Conserva cualquier otro TXT o MX existente.
   - Añade A `@` con el valor de la sección A.
   - Añade CNAME `www` con el valor de la sección A.
   - Añade los registros de Resend de la sección B (MX y TXT de `send`, TXT `resend._domainkey`, y `_dmarc` si lo quieres).
   - Añade el TXT `google-site-verification=...` de la sección C en el apex.
   - Después pulsa Verify en Resend y en Search Console. Si Search Console tarda unos minutos, "pendiente" es una respuesta aceptable.
3. Variable: ninguna.

## E. Upstash (rate limit del contacto)

1. Qué crear: una base Redis de Upstash.
2. Pasos recomendados: Vercel → Storage → Create → Upstash for Redis (Marketplace). Conéctala al proyecto `mateojaras-dev` para Production y Preview. La integración inyecta `KV_REST_API_URL` y `KV_REST_API_TOKEN`, que el código ya lee. Alternativa: console.upstash.com → Redis → REST API y copia `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.
3. Variables: `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
   - Vercel: las inyecta la integración en Production y Preview.
   - `.env.local`: cópialas a mano. Aviso: no uses `vercel env pull` sobre `.env.local`, lo sobrescribe.

## F. Variables de entorno en Vercel

1. Qué crear: las variables que mueven las URLs canónicas al apex.
2. Pasos: Vercel → Settings → Environment Variables.
   - Solo Production: `NEXT_PUBLIC_SITE_URL=https://mateojaras.dev`
   - Solo Production: `BETTER_AUTH_URL=https://mateojaras.dev`
   - Production y Preview: `RESEND_API_KEY` (de la sección B; si ya la añadiste allí, solo verifica).
   - No cambies `DATABASE_URL` de Preview: sigue apuntando a la rama `dev` de Neon.
3. Variables: `NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL`, `RESEND_API_KEY`. Además `RESEND_API_KEY` también en `.env.local`.

## G. Vercel Web Analytics

1. Qué activar: Web Analytics (plan Hobby; solo visitas y referrers, D-02).
2. Pasos: Vercel → proyecto `mateojaras-dev` → Analytics → Enable.
3. Variable: ninguna.

## H. Secrets de GitHub Actions

1. Qué crear: dos secrets del repositorio para el e2e en CI.
2. Pasos: GitHub → repo → Settings → Secrets and variables → Actions → New repository secret.
   - `ADMIN_EMAIL`: el mismo valor que `ADMIN_EMAIL` en `.env.local`.
   - `ADMIN_PASSWORD`: el mismo valor que `ADMIN_PASSWORD` en `.env.local`.
3. Variables: `ADMIN_EMAIL` y `ADMIN_PASSWORD`. Solo en GitHub Secrets, nunca en Vercel.

## Respuesta esperada

Responde "listo A-H" (o lista lo pendiente, por ejemplo "Resend pendiente de verificar") y añade "redeploy: sí" para que yo redespliegue Production con las variables nuevas.
