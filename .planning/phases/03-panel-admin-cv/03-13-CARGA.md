# 03-13 Sesión de carga de contenido (D-09)

Todo el contenido lo cargas tú desde los formularios del admin. Claude no escribe, traduce ni publica nada por ti.

## Antes de empezar

Prerrequisitos manuales tuyos (Claude no puede hacerlos):

1. Crear el Blob store con acceso **Public** en Vercel (Storage → Create → Blob → Public) y conectarlo al proyecto en **Production** y **Preview**.
2. Copiar `BLOB_READ_WRITE_TOKEN` a `.env.local` y a Vercel → Settings → Environment Variables (Production y Preview).
3. Definir `NEXT_PUBLIC_SITE_URL=https://mateojaras-dev.vercel.app` (o el dominio real que uses) en Vercel, en Production y Preview.
4. Decirle a Claude "hecho". Entonces Claude hace el push y el despliegue a producción y confirma que las migraciones se aplicaron.

## Checklist

Entra en https://mateojaras-dev.vercel.app/admin y sigue el orden del menú.

### Ajustes
- [ ] Titular (en/es)
- [ ] Bio (en/es)
- [ ] Ahora (en/es)
- [ ] Disponibilidad
- [ ] Idiomas
- [ ] Enlaces (GitHub, LinkedIn)
- [ ] Cal.com
- [ ] SEO título y descripción (en/es)

### Proyectos (repetir ×4: Centro Estético Manuj, EcoExport Costa Rica, Finanzas personales, Sistema de gestión de inventario)
- [ ] Secciones 01-05 (problema, rol, solución, caso de estudio, resultados) en en/es
- [ ] Al menos 3 capturas 16:10 con texto alternativo en es y en
- [ ] Portada elegida entre las capturas
- [ ] Métricas, con la fuente en la etiqueta
- [ ] 2 o 3 decisiones técnicas (título y cuerpo) en en/es
- [ ] Enlace en vivo o repositorio

### Experiencia
- [ ] Bullets de Sofka en en/es
- [ ] Revisar fechas

### Skills
- [ ] Revisar lista y categorías

### Educación
- [ ] Revisar entradas (incluida Sofka U si quieres)

### Decisiones
- [ ] Inventario y Finanzas: publicar o dejar en borrador (D-10)
- [ ] Revisar las traducciones EN que estaban marcadas draft-translation

### CV
- [ ] Pulsar "Generar CV" en /admin/cv
- [ ] Abrir /cv/en.pdf y /cv/es.pdf (máximo 2 páginas, tildes y ñ correctas)

### Comprobación final

```
DATABASE_URL='<URL de Neon main>' pnpm exec tsx scripts/check-phase-3.ts
```

(Sin la variable si la sesión se hizo contra dev.) Pega la salida y escribe "listo" cuando des la fase por cerrada.

## Resultado

Fecha: 2026-11-21. Entorno: producción (https://mateojaras-dev.vercel.app). Teo delegó la carga ("hazlo tu") y aportó los hechos. Claude Code cargó por los formularios reales del admin con un script de Playwright fuera del repo (idempotente; probado antes en la rama dev de Neon).

### Cargado
- Centro Estético ManuJ: tagline, fechas (ago 2026), URL en vivo y repo, problema, papel, solución, 3 resultados, 3 decisiones, 3 capturas (webp) subidas por el uploader real con alt es/en, portada = 01-inicio, 0 métricas (solo cualitativo). Publicado, visible y destacado.
- Sofka Technologies: 3 bullets es/en, publicados.
- Freelance: 3 bullets es/en de docs/copy.md, publicados.
- Ahora es/en de docs/copy.md, publicado en Ajustes. Titular y bio ya estaban cargados desde la siembra y no se tocaron.
- CV: "Generar CV" en /admin/cv, versión v1 en y es.

### No cargado, por decisión de Teo
- EcoExport Costa Rica, Finanzas personales, Sistema de gestión de inventario: sin completar. Finanzas e Inventario siguen en borrador. EcoExport figura como publicado desde la siembra y el admin no tiene acción para despublicar (ver Pendiente para Teo).
- Skills: la tabla está vacía en producción y no se creó ninguna. Las bullets no enlazan skills.

### Verificación en producción
- `check-cv-pdf.ts` /cv/es.pdf: PASS (1 página).
- `check-cv-pdf.ts` /cv/en.pdf: FAIL con el conjunto por defecto ("missing á ó ú ñ"): el contenido en inglés no tiene esas letras. Con `--chars=éí` (Medellín, México, Estético): PASS (1 página). Texto extraído de ambos PDF comprobado: tildes y ñ correctas en es.
- /resume.json y /resume.es.json: 200, basics.name = Mateo Jaramillo, projects = Centro Estético ManuJ, Sofka con 3 highlights en cada idioma, skills = 0.
- /projects/centro-estetico-manuj y /es/proyectos/centro-estetico-manuj: 200. La vista pública del caso de estudio todavía muestra solo el título (las secciones públicas son de la fase 4); decisiones e imágenes se comprobaron por el admin: 3 resultados, 3 decisiones, 3 imágenes con alt, 1 portada, sin cambios pendientes.
- Checker contra Neon main: NO ejecutado. Vercel marca DATABASE_URL como sensible y `vercel env pull` devuelve `[SENSITIVE]`. Contra la rama dev con el mismo contenido cargado: ManuJ sin FAIL; FAIL esperados en EcoExport (publicado en dev) y en resume (dev no generó CV).

### Pendiente para Teo
1. Correr `DATABASE_URL='<URL de Neon main>' pnpm exec tsx scripts/check-phase-3.ts` y pegar la salida.
2. EcoExport: está publicado y visible con campos vacíos. Opciones: ocultarlo con el interruptor Visible, o pasarlo a borrador en la base. Hasta entonces el checker marcará FAIL en sus líneas de contenido.
3. Skills: la tabla está vacía, así que `/resume.json` tiene 0 skills. Decide si las creas desde /admin/skills (categoría y años son datos tuyos) y vuelve a pulsar "Generar CV".
4. Revisar las capturas en el admin (proporción 16:10; el script no leyó el aviso del uploader) y la traducción EN de ManuJ (marcada draft-translation).
5. Escribir "listo" para cerrar D-09.
