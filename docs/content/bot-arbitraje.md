---
slug: bot-arbitraje
enStatus: draft-translation
source: interview-2026-11-25
pendingFields:
  - finishedAt
clientPermission: true
sampleData: false
titleEs: "Bot de arbitraje"
titleEn: "Arbitrage bot"
taglineEs: "Bot que revisa anuncios de segunda mano con pasos baratos primero, usa Claude solo con los que sobreviven y avisa por Telegram."
taglineEn: "Bot that screens second-hand listings with cheap steps first, uses Claude only on the survivors and sends alerts through Telegram."
liveUrl: null
repoUrl: null
startedAt: "2026-10-05"
stack:
  - Python
  - FastAPI
  - SQLAlchemy
  - Alembic
  - Pydantic
  - PostgreSQL
  - Supabase
  - Apify
  - Telegram
  - Claude API
  - uv
  - ruff
  - mypy
  - pytest
metrics: []
resultsEs:
  - "Algunas compras salieron de las alertas del bot."
resultsEn:
  - "Some purchases came out of the bot's alerts."
techDecisionsEs:
  decisions:
    - title: "Pasos baratos primero, IA al final"
      body: "Los filtros deterministas descartan antes de llamar al modelo, así cada llamada a Claude se gasta en un anuncio con opciones."
    - title: "Salida estructurada y validada"
      body: "Claude devuelve JSON y Pydantic lo valida; si no cumple el esquema, no entra al resto del embudo."
    - title: "Tareas periódicas desde Supabase Cron"
      body: "Con un servidor que se apaga, un planificador interno no sirve; los endpoints de FastAPI reciben las llamadas y no hay procesos en segundo plano."
  tradeoffs: "Un embudo con pasos fijos es más rígido que dejar que el modelo lo decida todo, a cambio de un costo por anuncio mucho menor y de resultados que se pueden probar."
  validation: "Suite de pruebas con pytest, con pruebas unitarias de los pasos puros y pruebas de integración por fase."
techDecisionsEn:
  decisions:
    - title: "Cheap steps first, AI last"
      body: "The deterministic filters discard before the model is called, so each Claude call is spent on a listing that has a chance."
    - title: "Structured, validated output"
      body: "Claude returns JSON and Pydantic validates it; if it does not meet the schema, it does not enter the rest of the funnel."
    - title: "Periodic tasks from Supabase Cron"
      body: "With a server that shuts down, an in-process scheduler does not work; FastAPI endpoints receive the calls and there are no background processes."
  tradeoffs: "A funnel with fixed steps is more rigid than letting the model decide everything, in exchange for a much lower cost per listing and results that can be tested."
  validation: "A pytest suite, with unit tests for the pure steps and integration tests per phase."
---

## problemEs

Encontrar buenas compras de segunda mano para revender exige revisar muchos anuncios a mano, calcular el precio de reventa y el costo de traer el producto, y descartar estafas. Es un trabajo repetitivo, y se pierden oportunidades por no mirar a tiempo.

## problemEn

Finding good second-hand purchases to resell means reviewing many listings by hand, working out the resale price and the cost of bringing the product in, and ruling out scams. It is repetitive work, and opportunities are lost by not looking in time.

## roleEs

Lo diseñé y lo construí solo, de principio a fin, para uso personal.

## roleEn

I designed and built it on my own, end to end, for my own use.

## solutionEs

- Ingesta de anuncios con Apify y deduplicación; todo anuncio visto se guarda para el histórico de precios.
- Un embudo con los pasos baratos y deterministas primero: filtros geográficos, reglas de riesgo y descartes por texto. La IA solo procesa lo que sobrevive.
- Claude convierte el texto del anuncio en un producto estructurado, y su respuesta se valida con Pydantic antes de usarse.
- Estimación de valor, de costo de traer el producto y de margen.
- Alertas por Telegram con botones de acción; el bot aprende del feedback.
- Chat en lenguaje natural por Telegram: un agente de Claude con bucle de herramientas, con botones de confirmación para los cambios.
- Control del gasto de las corridas de Apify.

## solutionEn

- Listing ingestion with Apify and deduplication; every listing seen is stored for the price history.
- A funnel with the cheap, deterministic steps first: geographic filters, risk rules and text-based discards. The AI only processes what survives.
- Claude turns the listing text into a structured product, and its answer is validated with Pydantic before it is used.
- Estimates of value, of the cost of bringing the product in and of margin.
- Telegram alerts with action buttons; the bot learns from feedback.
- Natural-language chat over Telegram: a Claude agent with a tool loop, with confirmation buttons for changes.
- Spending control for the Apify runs.

## caseStudyEs

### El embudo

Los pasos baratos y deterministas van primero, y la IA solo ve lo que sobrevive. Eso mantiene bajo el costo de cada anuncio revisado.

### El papel de Claude

Claude hace dos trabajos. Convierte un anuncio en un producto estructurado, con una respuesta en JSON que Pydantic valida. Y atiende el chat de Telegram como agente con un bucle de herramientas: lee datos y, para cualquier cambio, pide confirmación con botones.

### Cómo corre

El servidor se apaga cuando no hay trabajo, así que no hay procesos en segundo plano. Supabase Cron llama a endpoints de FastAPI y Apify avisa por webhook cuando termina una corrida.

## caseStudyEn

### The funnel

The cheap, deterministic steps come first, and the AI only sees what survives. That keeps the cost of each reviewed listing low.

### Claude's role

Claude does two jobs. It turns a listing into a structured product, with a JSON answer that Pydantic validates. And it serves the Telegram chat as an agent with a tool loop: it reads data and, for any change, asks for confirmation with buttons.

### How it runs

The server shuts down when there is no work, so there are no background processes. Supabase Cron calls FastAPI endpoints and Apify notifies by webhook when a run finishes.
