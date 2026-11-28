# 01-09: respuestas de Teo

## Respuestas de Teo (G3)

Fecha: 2026-10-30

variante: a · P1 mantener · P2 apruebo las cadenas, CTA se queda, headline: la versión corta · P5 corregir · hallazgos: tabla de contraste enfocable; el resto a la fase 4

## Contexto mostrado a Teo

Lo que vio Teo antes de responder, según lo describe el orquestador. No es una copia literal de la pantalla.

- Las tres opciones del hero, descritas de forma neutral en una tabla, sin marcar ninguna como preferida.
- Después, aparte y con su propia etiqueta, la recomendación del orquestador. Teo la había pedido antes ("lo que recomiendes") y también había dicho "solo pregúntame cosas que tengan mucha relevancia".
- 01-LAB-REVIEW.md (commits 9bb91e2 y 433160b) no recomienda nada: plantea las opciones de forma neutral. La recomendación llegó en un mensaje aparte porque Teo la pidió.

## Notas de lectura

- Variante: la regla de la Task 3 de 01-09 lee una sola letra en el bloque G3: `a`.
- P1 "mantener": el acento claro no cambia. Solo va en el punto de estado y en el foco; el texto de la línea de estado sigue en tinta.
- P2 "apruebo las cadenas": Teo aprueba las cadenas ES propuestas para la línea de estado y para los estados open/closed. Las etiquetas ES del índice solo existían en la c, así que no llegan al sitio.
- P2 "CTA se queda": el CTA sigue siendo "Let’s talk" / "Hablemos".
- P2 "headline: la versión corta": se refiere a la versión corta del headline que vio en el contexto. Es texto de Claude y Teo lo eligió:
  - ES: `Construyo frontends sólidos con React y Next.js, de la primera pantalla al panel de gestión.`
  - EN: `I build solid frontends with React and Next.js, from the first screen to the admin panel behind it.`
- P3: sin respuesta. No aplica porque eligió la a. La pregunta solo existía para la fecha de la b.
- P5 "corregir": el ejemplo "01" con raya larga de DESIGN.md §4 pasa a "01 Work". Lo aplica 01-11.
- Hallazgos "tabla de contraste enfocable": el contenedor con scroll de la tabla de contraste en /lab/tokens lleva `tabIndex={0}`, `role="region"` y `aria-label`. Es el hallazgo serious de axe `scrollable-region-focusable` a 390 px. Lo aplica 01-11.
- Hallazgos "el resto a la fase 4": los demás hallazgos de 01-LAB-REVIEW.md quedan para la fase 4.
