---
slug: finanzas-personales
enStatus: draft-translation
source: interview-2026-11-25
pendingFields:
  - resultsEs
  - resultsEn
  - liveUrl
  - repoUrl
  - startedAt
  - finishedAt
  - coverImage
  - media
clientPermission: true
sampleData: true
titleEs: "App de Finanzas Personales"
titleEn: "Personal Finance App"
taglineEs: "Finanzas personales multiusuario y multimoneda, con transferencias a su tasa de cambio, para quien tiene gastos en dos países."
taglineEn: "Multi-user, multi-currency personal finance, with transfers at their exchange rate, for people who have expenses in two countries."
stack:
  - Next.js
  - Tailwind CSS
  - TanStack Table
  - Recharts
  - Zustand
  - Vitest
  - FastAPI
  - SQLModel
  - SQLAlchemy
  - Alembic
  - PostgreSQL
metrics: []
techDecisionsEs:
  decisions:
    - title: "Dos repositorios y una sola puerta"
      body: "La interfaz en Next.js solo habla con la API de FastAPI; toda la lógica de negocio vive en la API y la interfaz es un cliente delgado."
    - title: "Sesión en cookie httpOnly"
      body: "El token no pasa por el código del navegador; el middleware lo verifica sin llamar a la API en cada navegación. Exige que interfaz y API compartan dominio padre."
    - title: "Categorías en grupo y hoja"
      body: "Un grupo agrupa y solo la hoja recibe dinero, para que un total no cuente dos veces un mismo movimiento."
techDecisionsEn:
  decisions:
    - title: "Two repositories and a single door"
      body: "The Next.js interface only talks to the FastAPI API; all the business logic lives in the API and the interface is a thin client."
    - title: "Session in an httpOnly cookie"
      body: "The token never passes through browser code; the middleware verifies it without calling the API on each navigation. It requires the interface and the API to share a parent domain."
    - title: "Categories in group and leaf"
      body: "A group only groups and only the leaf receives money, so a total never counts the same entry twice."
---

## problemEs

Quien tiene gastos en dos países maneja cuentas en monedas distintas, y mezclarlas en una sola cifra no dice cuánto tiene realmente en cada una. Hacía falta una aplicación que registrara cada cuenta en su moneda, las transferencias entre ellas con su tasa de cambio y un resumen por moneda.

## problemEn

Someone with expenses in two countries has accounts in different currencies, and mixing them into a single figure does not say how much they really have in each one. What was needed was an application that records each account in its own currency, the transfers between them with their exchange rate and a summary per currency.

## roleEs

Es mi propio producto y lo construí solo. Fue mi primer proyecto grande hecho con IA: lo escribí con ChatGPT y documentación estricta como contexto, y después lo rediseñé con Claude Code.

## roleEn

It is my own product and I built it on my own. It was my first large AI-assisted project: I wrote it with ChatGPT and strict documentation as context, and later redesigned it with Claude Code.

## solutionEs

- Varios usuarios, cada uno con sus cuentas.
- Cuentas en distintas monedas.
- Transferencias entre cuentas con su tasa de cambio.
- Resumen por moneda.
- Categorías en dos niveles, grupo y hoja, donde solo la hoja recibe dinero.
- Comprobantes adjuntables al crear el movimiento.
- Bandeja de pendientes que propone la regla que cubriría los movimientos repetidos.

## solutionEn

- Several users, each with their own accounts.
- Accounts in different currencies.
- Transfers between accounts with their exchange rate.
- Summary per currency.
- Categories on two levels, group and leaf, where only the leaf receives money.
- Receipts that can be attached when the entry is created.
- A pending inbox that proposes the rule that would cover repeated entries.

## caseStudyEs

### Qué es

Un producto propio de finanzas personales, con una API en FastAPI y una interfaz web en Next.js, en dos repositorios separados.

### Cómo se construyó

Fue mi primer proyecto grande con IA. La primera versión la hice con ChatGPT y con documentación estricta como contexto, y después la rediseñé con Claude Code. La documentación del proyecto describe el modelo de datos, la arquitectura y las reglas que no se pueden romper.

## caseStudyEn

### What it is

My own personal finance product, with a FastAPI API and a Next.js web interface, in two separate repositories.

### How it was built

It was my first large project with AI. I made the first version with ChatGPT and strict documentation as context, and later redesigned it with Claude Code. The project documentation describes the data model, the architecture and the rules that cannot be broken.
