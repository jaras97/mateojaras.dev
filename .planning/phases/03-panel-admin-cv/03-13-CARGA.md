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

