# Migración de viniapro-landing a Vite + Vue 3 + Vuetify 3

Fecha: 2026-08-09

## Contexto

`viniapro-landing` es la web pública de ViniaPro: una SPA estática de una sola página con secciones ancladas (inicio, acerca, demo, planes, descarga, contacto), más una vista de error. Se construye con vue-cli 4 sobre webpack 4 y corre Vue 2.6 con Vuetify 2.4.

Tres problemas motivan el cambio:

1. **Dependencias sin soporte.** Vue 2 llegó a fin de vida el 31 de diciembre de 2023 y no recibe parches de seguridad. Vuetify 2 solo funciona con Vue 2, así que ambos arrastran. vue-cli está descontinuado.
2. **Build frágil.** El `Dockerfile` necesita `NODE_OPTIONS=--openssl-legacy-provider` porque webpack 4 usa una API de crypto que Node ≥17 retiró. Es un parche que tapa una incompatibilidad de fondo.
3. **Código muerto.** `src/Productos.vue` y `src/ProductosLista.vue` (776 de las ~2000 líneas del proyecto) ya están desconectados: sus rutas están comentadas en `src/router.js` y la única llamada (`irProductos()` en `Navigation.vue`) también.

Resultado esperado: el mismo landing, servido igual (build estático tras nginx en contenedor), sobre un stack con soporte y un build que no necesita banderas heredadas.

## Decisiones tomadas

| Decisión | Elección |
|---|---|
| Alcance | Vite + Vue 3 + Vuetify 3 (modernización completa) |
| Fidelidad visual | Se adoptan los defaults de Vuetify 3; sin CSS de parcheo para replicar los espaciados antiguos. Requiere revisión del usuario |
| i18n | Se mantiene, migrado a vue-i18n 9, con los locales `es` y `en` |
| Fuentes e iconos | Se empaquetan en local; se eliminan las peticiones a CDN |
| Gestor de paquetes | pnpm, con lockfile commiteado y `--frozen-lockfile` en Docker |
| Node | `node:20-alpine`, igual que `viniapro-erp` |

## Alcance

### Se elimina

- `src/Productos.vue` y `src/ProductosLista.vue`.
- Las rutas comentadas de `productos` y `productos/editor` en `src/router.js`.
- El método comentado `irProductos()` en `src/components/Navigation.vue`.
- De `src/utils/index.js`: `getProductos`, `setProductos`, `getCurrentUser`, `setCurrentUser` — solo las usaban las vistas eliminadas.
- La variable `VUE_APP_RUTA_API` del `.env`: era la única lectura de red del proyecto y solo ocurría en `Productos.vue` y `ProductosLista.vue`. Tras el borrado, el landing no hace ninguna petición a la API.
- `babel.config.js` y `vue.config.js`.

`src/utils/index.js` conserva `mapOrder`, `getDateWithFormat`, `getCurrentTime` y `ThemeColors`. Si al terminar ninguna resulta estar en uso, el archivo se elimina entero.

### Se conserva sin cambios

- `nginx.conf`: el `try_files $uri $uri/ /index.html` del history mode y el cacheo de assets siguen siendo correctos para la salida de Vite.
- `.htaccess`: apunta a un despliegue Apache alternativo, ajeno a esta migración.
- Todos los assets de `src/assets/img/` y `public/favicon.ico`.
- El contenido, los textos y la estructura de secciones del landing.

## Stack objetivo

| Hoy | Después |
|---|---|
| vue-cli 4 + webpack 4 | Vite 7 + `@vitejs/plugin-vue` |
| Vue 2.6 | Vue 3.5 |
| Vuetify 2.4 | Vuetify 3 + `vite-plugin-vuetify` |
| vue-router 3 | vue-router 4 |
| vue-i18n 8 | vue-i18n 9 |
| vue-youtube-embed | `<iframe>` nativo |
| Roboto y MDI por CDN | `@fontsource/roboto` + `@mdi/font` |
| babel + core-js | (fuera; esbuild se encarga) |
| eslint 6 + babel-eslint | eslint 9 (flat config) + eslint-plugin-vue 10 |

`sass` se mantiene como dependencia de desarrollo: `HomeSection.vue` y `PricingSection.vue` usan `<style lang="scss">`, y Vite compila SCSS si `sass` está instalado.

Las versiones mayores de la tabla indican la línea objetivo, no un pin: la versión concreta de cada paquete se resuelve al instalar y queda fijada en `pnpm-lock.yaml`.

## Migración de código

### Entrada de la aplicación

`src/main.js` pasa de `new Vue({...}).$mount('#app')` a `createApp(App).use(...).mount('#app')`. `Vue.config.productionTip` desaparece (no existe en Vue 3).

`public/index.html` se mueve a `index.html` en la raíz del proyecto, que es donde Vite espera el punto de entrada. Se eliminan los placeholders EJS de webpack (`<%= BASE_URL %>` y `<%= htmlWebpackPlugin.options.title %>`), el título queda escrito literalmente como `ViniaPro`, y se añade `<script type="module" src="/src/main.js"></script>`. Los dos `<link>` a CDN se retiran; Roboto y MDI se importan desde `main.js`.

### Configuración de Vite

`vite.config.js` nuevo con `@vitejs/plugin-vue`, `vite-plugin-vuetify` (para treeshaking de componentes y estilos) y el alias `@ → /src`. El alias es necesario: `src/plugins/i18n.js` importa `@/locales/en.json`.

### Router

vue-router 4: `new VueRouter({...})` pasa a `createRouter({ history: createWebHistory(), ... })`. La ruta comodín `path: "*"` no es válida en vue-router 4 y se reescribe como `path: "/:pathMatch(.*)*"`. `linkActiveClass` se mantiene. Los comentarios `webpackChunkName` de los imports dinámicos se eliminan: son directivas de webpack sin efecto en Rollup.

### i18n

vue-i18n 9 con `createI18n({ legacy: false, globalInjection: true })`. `globalInjection` es lo que mantiene disponible `$t()` en las plantillas, que es como lo usa `Navigation.vue` (10 llamadas). Las variables de entorno pasan de `process.env.VUE_APP_I18N_*` a `import.meta.env.VITE_I18N_*`, y el `.env` se actualiza en consecuencia.

### Vuetify

`src/plugins/vuetify.js` pasa de `new Vuetify({...})` a `createVuetify({...})`. Los iconos MDI se registran explícitamente mediante `@mdi/font` y la configuración `icons` de Vuetify 3.

Los breakpoints personalizados actuales (`xs: 0, sm: 340, md: 540, lg: 800, xl: 1280`) se trasladan a `display.thresholds`. **Punto de revisión explícito:** son valores inusualmente bajos y la escala de Vuetify 3 incorpora `xxl`, así que hay que validarlos observando el comportamiento real en móvil antes de darlos por buenos.

### Plantillas

Cambios conocidos de Vuetify 2 a 3 que afectan a este código:

- `v-list-item-content` desaparece. El drawer de `Navigation.vue` pasa a usar las props `title` y `subtitle` de `v-list-item`.
- `v-btn`: las props booleanas `text` y `depressed` pasan a `variant="text"` y `variant="flat"`.
- `v-text-field` y `v-textarea`: `outlined` pasa a `variant="outlined"`.
- `v-hover`: los slot props cambian a `{ isHovering, props }`.
- `v-app-bar`: la prop `app` desaparece; el layout lo resuelve `v-app`.
- `v-parallax`: componente reescrito, hay que rehacer su uso.
- `v-row`, `v-col`, `v-img`, `v-snackbar`, `v-scale-transition`, `v-container`, `v-card`: se mantienen con ajustes menores de props.

`v-data-table`, `v-dialog`, `v-checkbox` y `v-form` con validación solo aparecían en los archivos de Productos, así que su migración no es necesaria.

El componente `<youtube>` de `vue-youtube-embed` (`HomeSection.vue`) se sustituye por un `<iframe>` de YouTube con `aspect-ratio` en CSS. La librería solo existe para Vue 2 y no tiene sucesor mantenido.

### Estilos

No se añade CSS para reproducir los espaciados, elevaciones ni tipografía de Vuetify 2. Se adoptan los defaults de Vuetify 3 y el resultado se somete a revisión visual, sección por sección.

## Build y despliegue

`Dockerfile`, etapa de build:

- Base `node:20-alpine`, igual que `viniapro-erp`.
- pnpm activado con corepack, versión fijada por el campo `packageManager` de `package.json`.
- `pnpm install --frozen-lockfile` en lugar de `npm install`: falla si el lockfile no cuadra, en vez de resolver versiones nuevas silenciosamente.
- Desaparece `NODE_OPTIONS=--openssl-legacy-provider`.

Etapa de producción: sin cambios. `nginx:1.27-alpine`, `dist` copiado a `/usr/share/nginx/html`, `nginx.conf` montado como `default.conf`, puerto 80.

Se añade un `.dockerignore` (el proyecto no tiene ninguno) con `node_modules`, `dist`, `.git`, `.gitignore`, `.vscode` y `.env`.

## pnpm en ambos proyectos

**Landing:** `pnpm-lock.yaml` generado desde cero. El `package-lock.json` actual es `lockfileVersion 1` (npm 6) y se invalida igualmente al reemplazar medio stack; se elimina.

**ERP (`viniapro-erp`):** `pnpm import` genera `pnpm-lock.yaml` a partir del `package-lock.json` existente, heredando las versiones exactas ya fijadas y validadas. Se elimina `package-lock.json` y el `Dockerfile` pasa de `npm ci` a `pnpm install --frozen-lockfile`.

En los dos: campo `packageManager` en `package.json` para que corepack fije la versión de pnpm, y allowlist `onlyBuiltDependencies` con los paquetes que legítimamente necesitan ejecutar scripts de compilación. pnpm 10+ bloquea los scripts de ciclo de vida por defecto, que es la defensa que motivó esta elección; la allowlist se descubre en el primer build, no se adivina.

## Verificación

**Durante la migración**, con el dev server de Vite:

- Consola del navegador sin errores ni warnings de Vue.
- Cada sección del landing revisada en desktop (1280px) y móvil (375px), con capturas.
- Navegación: `/`, `/error` y una ruta inexistente (que debe caer en el comodín).
- Drawer móvil: apertura, cierre y navegación por anclas.
- Formulario de contacto: envío y snackbar.
- Vídeo de YouTube embebido: carga y proporción correcta.

**Antes de cerrar:**

- `pnpm build` termina sin errores y genera `dist/index.html` más los assets.
- `pnpm lint` limpio.
- `docker build` completo de las dos etapas, y el contenedor sirve la SPA con las rutas del history mode funcionando.
- Revisión visual final por parte del usuario, con atención especial a los breakpoints personalizados.

## Riesgos

- **La migración de plantillas Vuetify concentra el grueso del trabajo y del riesgo.** Parte de las diferencias entre Vuetify 2 y 3 solo se manifiestan al ejecutar. Se mitiga con revisión visual por secciones, pero requiere una pasada de aceptación del usuario.
- **Los breakpoints personalizados** pueden no comportarse igual bajo la escala de Vuetify 3. Se validan explícitamente en móvil.
- **La allowlist de `onlyBuiltDependencies`** no se puede determinar de antemano; sale del primer build en limpio.
