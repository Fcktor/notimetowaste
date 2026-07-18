# Sistema de diseño — No Time To Waste

Este documento describe el **estado actual** del sistema de diseño. Ya no es un plan de construcción (esa fase terminó) — es la referencia viva del look & feel implementado en `shopify-crud/app/globals.css`.

## Trayectoria (para contexto histórico)

1. **Réplica de Retool** (jun 2026, plan original) — tabla/sidebar gris clonando Retool, capturado con Playwright (`scripts/capture-retool.js` → `reference/retool/`, vestigial hoy).
2. **Futurista/cyber** — fondo oscuro `#060b18`, glows azul/cyan, tipografía monospace tipo terminal (`SYS://CATALOG`).
3. **Luxury warm-dark** — primer rebrand a marca de relojes, panel admin oscuro elegante, sin azules.
4. **Warm-monochrome editorial** (commit `b9e61d5`, actual) — paleta clara minimalista, la que se documenta abajo.

## Paleta actual (`app/globals.css`, `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#FBFBFA` | Fondo general |
| `--foreground` | `#2F3437` | Texto principal |
| `--card` | `#FFFFFF` | Tarjetas, inputs |
| `--primary` | `#111111` | Botones, acentos, focus ring |
| `--secondary` / `--muted` / `--accent` | `#F1F0ED` | Fondos secundarios, hover |
| `--muted-foreground` | `#787774` | Texto secundario |
| `--border` | `#EAEAEA` | Bordes |
| `--destructive` | `#9F2F2D` | Errores, eliminar |

**Pastels semánticos de estado** (badges de stock, notificaciones):
- Éxito: fondo `#EDF3EC`, texto `#346538`
- Advertencia: fondo `#FBF3DB`, texto `#956400`
- Peligro: fondo `#FDEBEC`, texto `#9F2F2D`
- Info: fondo `#E1F3FE`, texto `#1F6C9F`

Sin azules saturados, sin glows neon, sin gradientes fuertes — la firma visual es **monocromía cálida + un acento pastel puntual**.

## Tipografía

- **Sans** (`--font-sans`): Geist Sans — UI, cuerpo de texto.
- **Display** (`--font-display`, clase `.font-display`): Newsreader (serif editorial) — usada en titulares/hero, es lo que le da el aire "editorial/lujo" frente a una tienda genérica.
- **Mono** (`--font-mono`): Geist Mono — quedó de la fase futurista, uso puntual.

## Componentes y patrones clave

- `.store-card` — tarjeta de producto: borde `#EAEAEA`, hover con `translateY(-2px)` + sombra suave + borde `#D8D6D0`. Nada de glow.
- `.input-store` — inputs del storefront, focus con borde `#111111` (sin ring azul).
- `.table-row-hover` — filas de tabla admin: hover con fondo `#F9F9F8` + `box-shadow: inset 3px 0 0 #111111` (barra izquierda sólida, heredada conceptualmente de la fase cyber pero ahora en negro, no azul).
- `.btn-cyber` — nombre heredado de la fase futurista; hoy solo da feedback de press (`scale(0.98)`), sin shimmer.
- `.pulse-neon` — pulso sutil de opacidad para dots de estado (ej. "en stock"), sin glow, nombre también heredado.
- Animaciones de entrada (`fadeUp`, clases `.hero-line-1/2/3`, `.hero-sub`) — texto del hero aparece escalonado.
- `.watch-ghost` — line art decorativo de una esfera de reloj de fondo, revelado con `watchReveal` (opacidad final `0.05`, muy sutil) — es el único elemento explícitamente temático de relojes en el CSS global.

**Nota:** varias clases conservan nombres de la fase futurista (`btn-cyber`, `pulse-neon`) aunque su comportamiento ya cambió — renombrarlas es cosmético y de bajo valor, no se tocó en la limpieza de 2026-07-17.

## Fondo global

`body` lleva un `radial-gradient` casi imperceptible (`rgba(17,17,17,0.025)`) arriba a la derecha — textura sutil, no un patrón de rejilla como en la fase cyber.

## Dónde tocar qué

- Cambiar un color de marca → editar el token en `:root` de `globals.css`, no hardcodear hex en componentes.
- Nuevo patrón de componente → seguir el estilo ya establecido (bordes finos `#EAEAEA`, radios `0.5–0.75rem`, sombras casi inexistentes salvo en hover) en vez de traer convenciones de la fase cyber o de Retool.
- Fuente de verdad de la paleta: siempre `shopify-crud/app/globals.css`, no este documento — si difieren, el CSS gana y este archivo debe actualizarse.
