---
target: toda la tienda (storefront + admin)
total_score: 30
p0_count: 1
p1_count: 2
timestamp: 2026-09-21T16-52-05Z
slug: toda-la-tienda-storefront-admin
---
Method: dual-agent (A: abe1fd7c36bdda398 · B: aab39694dce2f7a93)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Admin CRUD tiene toasts y texto de botón por acción; agregar al carrito desde la card no da ninguna señal (Product.jsx) |
| 2 | Match System / Real World | 4/4 | Vocabulario en español consistente, estados de pedido reales |
| 3 | User Control and Freedom | 3/4 | Sin undo al quitar del carrito; confusión de rol en AuthPage |
| 4 | Consistency and Standards | 3/4 | Bug real: chevron del mega-menú (Menu.jsx:136, string en vez de template literal) |
| 5 | Error Prevention | 4/4 | ConfirmModal en toda acción destructiva, validaciones de precio/stock |
| 6 | Recognition Rather Than Recall | 3/4 | CheckoutModal muestra un total sin ítems ni miniaturas |
| 7 | Flexibility and Efficiency | 2/4 | Solo ProductoAdmin tiene buscador; ningún admin tiene filtros/orden/acciones masivas |
| 8 | Aesthetic and Minimalist Design | 3/4 | Limpio y con buen whitespace; dashboard admin denso pero apropiado |
| 9 | Error Recovery | 3/4 | Errores en admin con reintento consistente; errores del storefront (catálogo) sin botón de reintento |
| 10 | Help and Documentation | 2/4 | Sin FAQ/ayuda; solo tooltips `title=` en admin |
| **Total** | | **30/40** | **Good — base sólida, con brechas puntuales de confianza y accesibilidad** |

#### Anti-Patterns Verdict

**LLM assessment**: No es "hecho por IA a las apuradas". Hay disciplina real de design tokens (`--brand`, `--radius`, `--border` reutilizados en todo el sistema), convenciones de prefijo por componente, y comentarios de código que documentan bugs reales ya resueltos (el mega-menú en el rango 768–1024px, el orden de imports que afectaba el ícono de favoritos). Ningún ítem de la lista de baneos absolutos (bordes laterales decorativos, gradiente en texto, glassmorphism decorativo, plantilla hero-métrica, grids de cards idénticas sin jerarquía, eyebrows/números 01-02-03 como scaffolding, overflow de texto) aparece como patrón sistemático. Lo que sí rompería la confianza de un usuario fluido en Amazon/MercadoLibre: la pantalla de login habla de "panel de administración" a cualquier visitante, y las credenciales demo del admin están visibles en el formulario público de login.

**Deterministic scan**: 63 hallazgos, 2 reglas, ambas de severidad "warning", ninguna sobre patrones visuales de "AI slop":
- `overused-font` (61 apariciones en `global.css` + 9 hojas de estilo de componentes): redeclaraciones redundantes de `font-family: 'Inter'` en cada componente además de la declaración global en `body`/`h1-h6`. Es real y sistemático, pero es higiene de código (mantenibilidad), no un problema visual — no hay mezcla de tipografías ni ruido tipográfico.
- `layout-transition` (2 apariciones, `AdminView.css:584` y `:780`): `transition: height` en una barra de gráfico y `transition: width` en una barra de progreso. Caso límite típico — elementos aislados que no reflowean el layout circundante; `transform: scale` sería más performante pero el impacto real es bajo.

**Visual overlays**: no disponibles en este entorno (sin `chromium-cli` ni navegador Playwright instalado). Señal de fallback: la evaluación visual se hizo por lectura exhaustiva de JSX + CSS emparejado (~35 archivos), no por captura de pantalla real.

#### Overall Impression

Es una base sólida y evidentemente iterada, no una plantilla genérica. El panel de admin está mejor resuelto que la tienda de cara al cliente — lo cual es preocupante, porque es la tienda la que maneja dinero real y necesita ganarse la confianza del comprador. La mayor oportunidad: cerrar el círculo de confianza del checkout (confirmación de pedido, resumen de lo comprado, quitar las credenciales demo) y hacer que el catálogo de productos sea navegable por teclado.

#### What's Working

- **Disciplina de CRUD en admin**: `Modal`/`ConfirmModal`/`Toast`/`SaveBtn` en `shared.jsx` se reutilizan verbatim en Productos, Usuarios, Categorías, Descuentos, Banners y Pedidos — exactamente el estándar de "sin componentes bespoke" que se espera de un admin tipo Linear/Stripe.
- **Revelado progresivo en precios con descuento** (`ProductoAdmin.jsx:28-58`): el campo "Precio anterior" y su preview con tachado solo aparecen al marcar "tiene descuento", y la preview usa el mismo lenguaje visual (badge -X%, tachado) que verá el cliente en la tienda — evita que el precio se vea distinto entre admin y storefront.
- **Ingeniería responsive real, no plantillada**: el fix documentado del mega-menú (`Menu.css:305-326`) para el rango 768–1024px viene de haber probado el breakpoint real, no de copiar un patrón genérico.

#### Priority Issues

**[P0] Sin pantalla de confirmación de pedido**
- **Why it matters**: `Carrito.jsx:25-39` y `ProductoDetalle.jsx:28-39` completan la compra y redirigen en silencio a `/cuenta` sin mostrar número de pedido ni confirmación — el momento de mayor ansiedad de todo el flujo de compra queda sin señal, justo cuando el carrito ya desapareció.
- **Fix**: mostrar un estado de confirmación breve (ID de pedido, ítems, "vas a ver el estado en Mis Pedidos") antes o durante la redirección.
- **Suggested command**: `/impeccable shape` (planificar el flujo de confirmación antes de construirlo)

**[P1] AuthPage muestra copy de "panel de administración" a cualquier visitante**
- **Why it matters**: `AuthPage.jsx:50-57,62-64` usa el mismo panel de marca para cliente y admin — un comprador primerizo que quiere crear una cuenta ve "Creá tu cuenta de administrador para gestionar productos, categorías y más".
- **Fix**: diferenciar el copy según el rol/intención, o separar las rutas de auth de cliente y admin.
- **Suggested command**: `/impeccable clarify`

**[P1] La tarjeta de producto no es accesible por teclado**
- **Why it matters**: `Product.jsx:33` envuelve toda la tarjeta en un `<div onClick>` sin `role`, `tabIndex` ni `onKeyDown`, y no existe ningún `:focus-visible` en todo el repo. Un usuario de teclado/lector de pantalla no puede abrir un solo producto desde el catálogo, home o favoritos.
- **Fix**: convertir la tarjeta en `<Link>`/`<button>` real (o agregar `role="link" tabIndex={0}` + manejo de Enter/Espacio), y agregar un anillo `:focus-visible` visible con el token `--brand` en todos los elementos interactivos.
- **Suggested command**: `/impeccable audit`

**[P2] CheckoutModal muestra un total sin resumen de ítems**
- **Why it matters**: `CheckoutModal.jsx:84-87` solo muestra "Total a pagar" — sin nombre, miniatura ni cantidad de producto — pese a reutilizarse en tres puntos de compra distintos. El comprador confirma un monto sin poder verificar visualmente qué está comprando.
- **Fix**: agregar una lista compacta de ítems (miniatura + nombre + cantidad × precio) arriba del total, reutilizando el patrón `.cd-item` ya construido en `Carrito.jsx`.
- **Suggested command**: `/impeccable layout`

**[P2] Credenciales demo de admin visibles en el login público**
- **Why it matters**: `LoginForm.jsx:69-75` muestra `admin@techmarket.com` / `admin123` sin condición alguna, en un formulario de una tienda que procesa datos de checkout — es una señal fuerte en contra de "confiable".
- **Fix**: ocultar ese bloque detrás de `import.meta.env.DEV` para que nunca aparezca en el build de producción.
- **Suggested command**: `/impeccable harden`

#### Persona Red Flags

**Jordan (comprador primerizo)**: choca con la confusión de copy de AuthPage justo cuando intenta crear una cuenta para comprar; después de pagar, no recibe confirmación (P0) y queda sin saber si el pedido se concretó.

**Sam (usuario dependiente de accesibilidad)**: el hallazgo más serio de la revisión — `ProductCard` (la interacción principal del catálogo, usada en Home, Catálogo y Favoritos) es inalcanzable por teclado, y no existe `:focus-visible` en ningún lado del sitio, así que incluso donde sí hay botones reales, un usuario que navega con Tab no ve dónde está el foco.

**Alex (operador admin power user)**: solo `ProductoAdmin` tiene buscador; Pedidos, Clientes, Categorías, Descuentos, Banners y Usuarios no tienen búsqueda ni filtros ni acciones masivas — con 200+ pedidos no hay forma de encontrar uno sin scrollear una tabla plana.

#### Minor Observations

- `Menu.jsx:136`: template literal roto (comillas en vez de backticks) — el chevron del mega-menú "Catálogo" nunca recibe su clase de rotación `--open`. Cosmético, el panel igual abre bien.
- Contraste bajo en el footer: `.ftr-copyright` y `.ftr-payment-badge` (`Footer.css:176-194`) usan `rgba(255,255,255,0.35)` sobre `--brand-dark` ≈ **2.95:1** de contraste, por debajo de WCAG AA (4.5:1) — específicamente la línea de copyright y las badges de Visa/Mastercard/Amex/PayPal.
- `--text-muted` sobre `--surface`/`--bg` da ≈4.6–4.8:1 — pasa AA pero al límite; cualquier ajuste futuro que oscurezca `--bg` lo haría fallar.
- Sin skeleton loaders en ningún lado — todo estado de carga cae en un "Cargando…" centrado (`.app-status`). Consistente, pero oportunidad perdida de performance percibida.
- Botón "¿Olvidaste tu contraseña?" sin `onClick` (`LoginForm.jsx:60-64`) — un control visiblemente roto es peor que no tener el control.
- `overused-font` (detector): 61 redeclaraciones redundantes de `font-family: 'Inter'` en hojas de estilo de componentes, además de la declaración global — no afecta lo visual, pero es limpieza de CSS pendiente.
- `layout-transition` (detector): `AdminView.css:584` y `:780` animan `height`/`width` en una barra de gráfico y una barra de progreso — casos aislados de bajo impacto real, `transform: scale` sería más performante.
- Errores del catálogo (`CatalogoGrid.jsx:116`, `CatalogoPage.jsx:116`) muestran mensaje estático sin botón de reintento, a diferencia del patrón de reintento consistente que sí tiene todo el admin.

#### Questions to Consider

- ¿Hay una razón real para que login/registro de cliente y de admin compartan una sola página? Separarlas resuelve gratis la confusión de copy y permite optimizar cada una para su usuario real.
- Si el checkout no colecta pago real (ofrece "Tarjeta de crédito" pero no pide número/CVV), ¿el paso de pago debería asumirse visualmente como una simulación, o el pago real está en el roadmap y conviene reconstruir el paso alrededor de eso?
- El admin recibió claramente más atención de diseño (toasts, confirm modals, reintentos consistentes) que la tienda (sin confirmación, sin reintento, sin resumen en checkout) — ¿fue deliberado, o conviene rebalancear hacia la tienda, que es donde se gana o se pierde la confianza real?
- `useIsMobile` es el único mecanismo de breakpoint y es un booleano duro sin layout específico para tablet más allá de la excepción ya corregida del mega-menú (768–1024px) — ¿hay otras zonas de ese rango de ancho sin auditar todavía?
