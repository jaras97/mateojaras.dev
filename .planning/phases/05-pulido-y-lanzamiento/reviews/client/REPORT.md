Spawned by: orchestrator (Agent, general-purpose), 2026-11-26

# Informe de revisión: cliente freelance (mateojaras.dev/es)

**Resumen.** El sitio se ve serio, sobrio y rápido de leer. En pocos segundos entendí que construye productos completos, de la base de datos a la pantalla. El contacto es muy fácil: un clic desde la portada me llevó a un formulario corto. Lo que me frena como dueño de negocio es la prueba de que su trabajo me sirve. Solo uno de los seis proyectos (Centro Estético ManuJ) muestra un sitio real con capturas. Los demás dicen "te muestro una demo" y no muestran nada. Tampoco hay testimonios, precios ni una forma de saber cómo se trabaja con él. El titular mezcla inglés y español ("AI full stack developer") y no me habla de mi negocio.

## Tarea 1: ¿Qué hace Teo y para quién?

**Primera respuesta, solo con la portada:** construye aplicaciones completas (base de datos, servidor y pantalla) usando inteligencia artificial ("agentes") y pruebas. No dice para quién. La línea "coincide 9 h con Toronto y 3 h con Madrid" sugiere que busca clientes en Canadá y España. Como cliente pequeño entendí "programador", pero frases como "AI full stack developer" y "con agentes y pruebas" son jerga técnica.

**Después de explorar:** mi respuesta cambió un poco. Ahora diría que hace sistemas de gestión para negocios pequeños (una joyería, un centro de estética, compraventas) y sitios web, y que trabaja solo, de principio a fin. Esto lo saqué de la lista de proyectos, no del titular. El titular podría decirlo de entrada.

## Tarea 2: Caso de estudio (Centro Estético ManuJ, /es/proyectos/centro-estetico-manuj)

- **Problema:** el centro no tenía un sistema para ordenar su negocio, sus clientas y sus finanzas.
- **Qué hizo él:** lo construyó solo, de principio a fin, con Claude Code. Incluye catálogo, galería, reservas desde el sitio y desde el panel, agenda de clientas, cupones, registro del dinero al cerrar cada cita y WhatsApp.
- **Resultado:** la información quedó centralizada, el centro se ve más profesional y agendar es más fácil. No hay ninguna cifra (citas al mes, tiempo ahorrado) ni una opinión del cliente.
- **Decisión técnica que destaca:** las citas se pueden crear desde el sitio y desde el panel, así las que llegan por WhatsApp quedan en la misma agenda.
- **¿Confiaría en esa decisión?** Sí. Es justo lo que pasa en mi negocio: la gente escribe por WhatsApp. Me dice que entendió cómo trabaja el cliente. En cambio, "Elegí Supabase porque su servidor MCP hacía más sencillo trabajar con el agente de IA" me genera dudas. La razón es la comodidad de él, no lo que me conviene a mí (costo, mantenimiento, qué pasa si él no está). Además, la página promete un "panel de gestión", pero las capturas son solo del sitio público.

También abrí Metales y Brillantes: es la única app que lleva más de 18 meses en uso, y su caso tiene tres viñetas ("Inventario, Roles, Reportes"), sin decisiones técnicas ni imágenes. Prendo está escrito para programadores (ADR, kardex, `company_id`, "767 archivos de prueba").

## Tarea 3: Camino de contacto

Portada (390 px) → botón "Hablemos", visible sin bajar → /es/contacto → formulario con Nombre, Email y Mensaje, más el email directo con un botón "Copiar email". Lo llené y no lo envié. Nada me retrasó: son dos pasos. Mis dudas fueron otras:
- No hay opción de agendar una llamada.
- No dice qué información conviene contar (presupuesto, plazos).
- El email es una cuenta de Gmail y no del dominio, lo que se ve menos profesional para alguien que vende "productos completos".

## Pregunta abierta A: ¿Qué me haría dejar de leer?

En Metales y Brillantes y en Prendo: "Esta herramienta no es pública. Te muestro una demo con datos de ejemplo." Y luego no hay ninguna demo ni captura. Ahí sentí que me prometieron algo y no lo cumplieron. Si hubiera entrado a esos casos primero, probablemente me habría ido.

## Pregunta abierta B: ¿Qué falta?

- Testimonios o una frase de un cliente real.
- Precios o rangos, o cómo cobra (por proyecto o por hora).
- Cómo es el proceso: primera llamada, propuesta, entregas, qué pasa después de entregar (soporte, mantenimiento, propiedad del código).
- Capturas de los paneles de gestión, que son justo lo que yo compraría.
- Una opción para agendar una llamada.
- Un mensaje en la portada dirigido a negocios ("¿tienes un negocio que lleva todo en cuadernos?").

## Hallazgos

| ID | Reviewer | Task/Question | Locale · viewport · URL | Finding | Severity (blocker/major/minor/nit) | Type (content/design/code/a11y) | Evidence |
|---|---|---|---|---|---|---|---|
| C2-01 | cliente freelance | Question A | es · 1440 y 390 · /es/proyectos/metales-y-brillantes, /es/proyectos/prendo | El texto "Te muestro una demo con datos de ejemplo" no viene acompañado de ninguna demo ni captura. Promete algo que no se ve y hace dudar de lo que dice. | major | content | case-metales-1440-es-full.png, case-prendo-390-es-full.png |
| C2-02 | cliente freelance | Task 2 | es · 1440 · /es/proyectos/metales-y-brillantes | Es el único proyecto con 18 meses en uso real y su caso es el más pobre: tres viñetas de una palabra, sin imágenes, sin decisiones técnicas, y "Mi rol" es una sola frase técnica. | major | content | case-metales-1440-es-full.png |
| C2-03 | cliente freelance | Question B | es · 1440 · /es, /es/proyectos/* | No hay testimonios ni citas de clientes en ninguna página. Los resultados son todos afirmaciones del propio autor. | major | content | home-1440-es-full.png, case-manuj-1440-es-full.png |
| C2-04 | cliente freelance | Task 1 | es · 1440 y 390 · /es | El titular dice "AI full stack developer", en inglés y en jerga, dentro de una frase en español. No dice para quién trabaja ni qué problema resuelve a un negocio. Lo entendí por los proyectos, no por el titular. | major | content | home-1440-es-fold.png, home-390-es-fold.png |
| C2-05 | cliente freelance | Question B | es · 1440 · /es, /es/sobre-mi, /es/contacto | No hay información sobre precios, forma de cobro, proceso de trabajo ni soporte después de la entrega. | major | content | about-1440-es-full.png, contact-390-es-filled-not-sent.png |
| C2-06 | cliente freelance | Task 2 | es · 1440 · /es/proyectos/centro-estetico-manuj | La decisión "Supabase como backend" se justifica por la comodidad de trabajar con el agente de IA, no por lo que le conviene al cliente. Como dueño de negocio me resta confianza. | minor | content | case-manuj-1440-es-full.png |
| C2-07 | cliente freelance | Task 2 | es · 1440 · /es/proyectos/centro-estetico-manuj | El proyecto se presenta como "sitio público y panel de gestión", pero las tres capturas son del sitio público. No se ve el panel. | minor | content | case-manuj-1440-es-full.png, case-manuj-1440-es-gallery2.png |
| C2-08 | cliente freelance | Task 2 | es · 1440 · /es/proyectos/centro-estetico-manuj | Los resultados no tienen ninguna cifra ni comparación antes y después (por ejemplo, citas por mes o tiempo ahorrado). | minor | content | case-manuj-1440-es-full.png |
| C2-09 | cliente freelance | Task 2 | es · 390 · /es/proyectos/prendo | El caso de Prendo está escrito para programadores (ADR, kardex, `company_id`, "767 archivos de prueba", "STATE.md"). Las notas entre paréntesis como "Hecho de desarrollo, no resultado de negocio" confunden a un cliente. | minor | content | case-prendo-390-es-full.png |
| C2-10 | cliente freelance | General | es · 1440 · /es | La etiqueta "Herramienta interna, datos de ejemplo" aparece en la misma línea y con el mismo estilo que las tecnologías (React, Postgres). Se lee como si fuera una tecnología más. En Metales y Brillantes, "herramienta interna" junto a "en uso desde hace más de 18 meses" confunde: ¿es del cliente o es interna? | minor | design | home-1440-es-full.png |
| C2-11 | cliente freelance | General | es · 1440 · /es | Tres proyectos tienen fecha y tres no (Finanzas, Metales, EcoExport). El orden tampoco es cronológico: oct, ago, oct. | nit | content | home-1440-es-full.png |
| C2-12 | cliente freelance | General | es · 1440 · /es/sobre-mi | Dice que es freelance "desde septiembre de 2025" (unos 14 meses) y que Metales y Brillantes "lleva más de 18 meses en uso". Las fechas no cuadran a primera vista. | minor | content | about-1440-es-full.png |
| C2-13 | cliente freelance | General | es · 1440 · /es/sobre-mi | La página en español tiene textos en inglés ("AI Full Stack Developer", "Freelance · Remote", "Mid-Senior Frontend Developer", "Empleo · Remote") y "Css" está mal escrito en la lista de stack. | nit | content | about-1440-es-full.png |
| C2-14 | cliente freelance | Task 3 | es · 390 · /es/contacto | El camino es corto y claro (Hablemos → formulario de 3 campos). Faltan una opción para agendar llamada y una guía de qué contar en el mensaje (presupuesto, plazo). El email es de Gmail, no del dominio. | minor | content | home-390-es-fold.png, contact-390-es-filled-not-sent.png |
| C2-15 | cliente freelance | General | es · 1440 · /es/proyectos/centro-estetico-manuj | El periodo dice "ago 2026 – ago 2026". Un rango con el mismo mes en los dos extremos se ve raro; bastaría "ago 2026". | nit | content | case-manuj-1440-es-full.png |

Todas las capturas están en `/Users/mateojaramillo/projects/mateojaras.dev/.planning/phases/05-pulido-y-lanzamiento/reviews/client/`. No envié el formulario, no abrí /admin y cerré el navegador al terminar.
