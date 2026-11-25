---
slug: prendo
enStatus: draft-translation
source: interview-2026-11-25
pendingFields: []
clientPermission: true
sampleData: true
titleEs: "Prendo"
titleEn: "Prendo"
taglineEs: "SaaS multiempresa para compraventas colombianas, en desarrollo: caja, inventario y contratos que cuadran."
taglineEn: "Multi-tenant SaaS for Colombian compraventas (pawn shops with a store), in development: cash, inventory and contracts that add up."
liveUrl: null
repoUrl: null
startedAt: "2026-10-27"
finishedAt: null
stack:
  - Python
  - FastAPI
  - SQLAlchemy
  - PostgreSQL
  - Supabase
  - React
  - Vite
  - TypeScript
  - pytest
  - Vitest
  - Playwright
metrics:
  - labelEs: "Decisiones de arquitectura registradas (ADR)"
    labelEn: "Architecture decision records (ADRs)"
    value: "38"
    sourceEs: "Repositorio de Prendo, recuento del 2026-11-25. Hecho de desarrollo, no resultado de negocio."
    sourceEn: "Prendo repository, counted on 2026-11-25. A development fact, not a business result."
  - labelEs: "Archivos de prueba"
    labelEn: "Test files"
    value: "767"
    sourceEs: "Repositorio de Prendo, recuento del 2026-11-25: 461 de pytest, 205 de Vitest y 101 specs de Playwright. Hecho de desarrollo."
    sourceEn: "Prendo repository, counted on 2026-11-25: 461 pytest, 205 Vitest and 101 Playwright specs. A development fact."
  - labelEs: "Fases completas de la hoja de ruta"
    labelEn: "Roadmap phases complete"
    value: "9/16"
    sourceEs: "Repositorio de Prendo, STATE.md del 2026-11-25. Hecho de desarrollo."
    sourceEn: "Prendo repository, STATE.md of 2026-11-25. A development fact."
resultsEs:
  - "En desarrollo: todavía no se ha lanzado y no tiene clientes en uso."
  - "Los módulos de terceros, catálogos, inventario, caja, contratos y ventas ya están construidos y pasaron las puertas de cada fase."
resultsEn:
  - "In development: it has not launched and has no clients using it."
  - "The third parties, catalogs, inventory, cash, contracts and sales modules are built and passed each phase's gates."
techDecisionsEs:
  decisions:
    - title: "Libro de caja de solo inserción"
      body: "Cada movimiento de plata es un documento que se inserta y no se edita ni se borra, y el dinero se maneja en Decimal. Los saldos se derivan del libro, así el arqueo se puede auditar hasta el documento de origen."
    - title: "Stock derivado del kardex"
      body: "El inventario no se guarda como saldo: se calcula a partir de los movimientos del kardex. Descarta el saldo almacenado, que en la v1 podía descuadrarse en silencio."
    - title: "Aislamiento por empresa en la base de datos"
      body: "La regla de diseño es seguridad por filas forzada por empresa en cada tabla de negocio y una prueba de aislamiento por tabla. Es un requisito activo de la hoja de ruta, no una propiedad ya validada."
  tradeoffs: "Más documentos y más consultas derivadas a cambio de poder auditar cada cifra. Corregir un error exige un documento de ajuste, no una edición."
  validation: "Cada fase cierra con pruebas escritas antes del código y vistas fallar, revisión de código, revisión de seguridad y un E2E por flujo de mostrador."
  aiTools:
    - "Claude Code"
    - "Subagentes de auditoría propios"
    - "Skills propias de diseño y de dominio"
    - "Servidores MCP de documentación, base de datos, navegador y monitoreo de errores"
techDecisionsEn:
  decisions:
    - title: "Insert-only cash ledger"
      body: "Every movement of money is a document that is inserted and never edited or deleted, and money is handled in Decimal. Balances are derived from the ledger, so the cash count can be audited down to the source document."
    - title: "Stock derived from the kardex"
      body: "Inventory is not stored as a balance: it is computed from the kardex movements. It rules out the stored balance, which in v1 could go out of balance silently."
    - title: "Per-company isolation in the database"
      body: "The design rule is forced row-level security per company on every business table and one isolation test per table. It is an active roadmap requirement, not a property already validated."
  tradeoffs: "More documents and more derived queries in exchange for being able to audit every figure. Fixing a mistake takes an adjustment document, not an edit."
  validation: "Each phase closes with tests written before the code and seen failing, code review, security review and one E2E per counter flow."
  aiTools:
    - "Claude Code"
    - "Own audit subagents"
    - "Own design and domain skills"
    - "MCP servers for documentation, database, browser and error monitoring"
---

## problemEs

Una compraventa colombiana mezcla dos negocios que se miden distinto. El empeño gana intereses y el capital que vuelve no es ganancia. La tienda gana margen sobre un costo identificado pieza por pieza. En la primera versión, construida para un cliente, los dos negocios compartían una sola caja y una sola sede, el stock se guardaba como saldo y varias reglas estaban duplicadas, así que la caja podía descuadrarse sin que nadie lo notara. Esa versión nunca llegó a producción. El cliente pidió más funciones y eso llevó a rehacer el producto desde cero.

## problemEn

A Colombian compraventa mixes two businesses that are measured differently. Pawn lending earns interest, and the capital that comes back is not profit. The store earns margin on a cost identified piece by piece. In the first version, built for a client, both businesses shared one cash register and one branch, stock was stored as a balance and several rules were duplicated, so the cash could go out of balance without anyone noticing. That version never reached production. The client asked for more features, and that led to rebuilding the product from scratch.

## roleEs

Diseño y construyo Prendo de principio a fin: dominio, modelo de datos, API, interfaz y pruebas. Trabajo con agentes de código bajo reglas: una especificación por fase, registros de decisiones, pruebas escritas antes del código y puertas de revisión antes de cerrar cada fase.

## roleEn

I design and build Prendo end to end: domain, data model, API, interface and tests. I work with coding agents under rules: one spec per phase, decision records, tests written before the code and review gates before each phase closes.

## solutionEs

- Aislamiento por empresa: la regla de diseño es seguridad por filas forzada por `company_id` en cada tabla de negocio, con una prueba de aislamiento por tabla.
- Libro de caja de solo inserción, con saldos derivados, turnos con arqueo y varias cuentas.
- Inventario cuyo stock se deriva del kardex y no se guarda como saldo, con costo por identificación específica.
- Dinero siempre en Decimal.
- Terceros, catálogos con atributos dinámicos, inventario, caja, contratos de empeño, ventas con punto de venta, notas crédito y apartado: construidos según su hoja de ruta.
- Pendientes: compras, manufactura, reportes y documentos.

## solutionEn

- Per-company isolation: the design rule is forced row-level security on `company_id` in every business table, with one isolation test per table.
- Insert-only cash ledger, with derived balances, shifts with cash count and several accounts.
- Inventory whose stock is derived from the kardex rather than stored as a balance, with specific-identification costing.
- Money always in Decimal.
- Third parties, catalogs with dynamic attributes, inventory, cash, pawn contracts, sales with point of sale, credit notes and layaway: built according to its roadmap.
- Pending: purchases, manufacturing, reports and documents.

## caseStudyEs

### Qué es y en qué estado está

Prendo está en desarrollo. Existe un entorno de pruebas y una demo, y todavía no se ha lanzado. Faltan las fases de compras, manufactura, reportes y documentos, y los textos legales siguen en borrador.

### La regla que ordena todo

El valor central es que la plata cuadra: cada peso de caja, contratos e inventario sale de un documento auditable. El arqueo, el kardex y el estado de resultados no deben descuadrarse, ni con varias cajas, ni con varias sedes, ni con planes distintos.

### De la v1 a la v2

La v1 se hizo para un cliente y nunca llegó a producción. De ella conservo el dominio y una auditoría regla por regla. El código se rediseñó para resolver por diseño lo que dolía: planes que no controlaban nada, una sola caja y una sola sede, stock guardado como saldo y reglas duplicadas.

### Cómo se construye

- Cada módulo es una fase con su rama y su pull request.
- Cada fase cierra con puertas de verificación: pruebas vistas fallar antes de escribir el código, revisión de código, revisión de seguridad, un recorrido E2E por flujo de mostrador y la documentación en el mismo cambio.
- Subagentes de auditoría de solo lectura propios y skills propias de diseño y de dominio.
- Servidores MCP de documentación de librerías, base de datos, navegador y monitoreo de errores.

## caseStudyEn

### What it is and where it stands

Prendo is in development. There is a test environment and a demo, and it has not launched yet. The purchases, manufacturing, reports and documents phases are still to come, and the legal texts are still drafts.

### The rule that organizes everything

The core value is that the money adds up: every peso of cash, contracts and inventory comes from an auditable document. The cash count, the kardex and the income statement must never go out of balance, not with several registers, not with several branches, not with different plans.

### From v1 to v2

v1 was built for a client and never reached production. I kept its domain and a rule-by-rule audit. The code was redesigned to fix by design what hurt: plans that controlled nothing, a single register and a single branch, stock stored as a balance and duplicated rules.

### How it is built

- Each module is a phase with its own branch and pull request.
- Each phase closes with verification gates: tests seen failing before the code is written, code review, security review, one E2E walkthrough per counter flow and the documentation in the same change.
- Own read-only audit subagents and own design and domain skills.
- MCP servers for library documentation, database, browser and error monitoring.
