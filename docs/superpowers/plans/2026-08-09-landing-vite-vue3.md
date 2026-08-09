# Migración de viniapro-landing a Vite + Vue 3 + Vuetify 3 — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar el landing de vue-cli 4 / Vue 2 / Vuetify 2 a Vite / Vue 3 / Vuetify 3, eliminando el código muerto de Productos, y pasar ambos proyectos del monorepo a pnpm con lockfile congelado.

**Architecture:** SPA estática de una sola página con secciones ancladas. Se conserva la estructura de componentes actual (un componente por sección, `Inicio.vue` como contenedor) y el despliegue existente (build estático servido por nginx en contenedor multi-etapa). El cambio es de herramienta y de framework, no de arquitectura.

**Tech Stack:** Vite + `@vitejs/plugin-vue` + `vite-plugin-vuetify`, Vue 3, Vuetify 3, vue-router 4, vue-i18n 9, sass, eslint 9 flat config, pnpm, Node 20, nginx 1.27-alpine.

**Spec:** `docs/superpowers/specs/2026-08-09-landing-vite-vue3-design.md`

## Global Constraints

- Directorio del landing: `C:\Desarrollo\Repositorios\viniapro\viniapro-landing`. Repo git propio, remoto `origin` → `https://github.com/jmbarberan/landing-page.git`, rama actual la que esté activa.
- Directorio del ERP (solo Task 11): `C:\Desarrollo\Repositorios\viniapro\viniapro-erp`. Repo git distinto, remoto `github-viniapro`.
- Node 20 en local y en Docker. Ambos `Dockerfile` usan `docker.io/library/node:20-alpine` y no se cambia esa base.
- Gestor de paquetes: pnpm 11.2.2, fijado en el campo `packageManager` de cada `package.json`.
- Ningún `npm install` ni `npm ci` tras la Task 2. En Docker siempre `pnpm install --frozen-lockfile`.
- El alias `@` apunta a `<proyecto>/src` y debe funcionar en JS, en plantillas y en `url()` de CSS.
- No se añade CSS para replicar los espaciados, elevaciones ni tipografía de Vuetify 2. Se adoptan los defaults de Vuetify 3.
- Locales soportados: `es` (por defecto) y `en`. `globalInjection: true` para que `$t()` siga disponible en plantillas.
- No se toca `nginx.conf` ni `.htaccess`.
- Todos los commits van en español, en imperativo, y siguen el estilo del repo.

## Nota sobre verificación

**Este proyecto no tiene framework de pruebas y este plan no lo añade.** Es un landing estático sin lógica de negocio: el valor de unos tests unitarios sobre plantillas Vuetify no compensa su coste, y añadir Vitest sería alcance que nadie pidió. Es una desviación deliberada del ciclo TDD habitual.

En su lugar, **cada task termina con una verificación ejecutable concreta** — build que compila, lint limpio, o una comprobación en el navegador con las herramientas del Browser pane — y un commit. Ninguna task se da por terminada sin que su comprobación pase. Las comprobaciones de navegador son obligatorias, no opcionales: "compila" no es evidencia de que la sección se vea bien.

## Prerrequisito: Node 20 en local

El shell de desarrollo tiene **Node v16.14.0**, que no sirve: Vite 7 exige Node ≥20 y pnpm 11 también. Antes de empezar, instalar Node 20 (por ejemplo con `nvm-windows`) y confirmar:

```bash
node -v    # debe imprimir v20.x
pnpm -v    # debe imprimir 11.2.2
```

Si `node -v` sigue mostrando v16, **detenerse y avisar**. Todo el plan a partir de la Task 2 falla de formas confusas con Node 16.

## Estructura de archivos

**Se crean:**

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Punto de entrada de Vite, en la raíz del proyecto |
| `vite.config.js` | Plugins, alias `@`, `transformAssetUrls` de Vuetify |
| `eslint.config.js` | Flat config de eslint 9 |
| `.dockerignore` | Excluir `node_modules`, `dist`, `.git`, `.vscode`, `.env` del contexto de build |
| `pnpm-lock.yaml` | Generado por `pnpm install` |

**Se modifican:** `package.json`, `.env`, `.gitignore`, `Dockerfile`, `src/main.js`, `src/router.js`, `src/App.vue`, `src/plugins/vuetify.js`, `src/plugins/i18n.js`, `src/views/Inicio.vue`, `src/views/Error.vue`, y los siete componentes de `src/components/`.

**Se eliminan:** `src/Productos.vue`, `src/ProductosLista.vue`, `src/utils/index.js`, `vue.config.js`, `babel.config.js`, `public/index.html`, `package-lock.json`.

**No se tocan:** `nginx.conf`, `.htaccess`, `LICENSE`, `README.md`, `src/assets/`, `public/favicon.ico`, `src/locales/`.

---

### Task 1: Eliminar el código muerto de Productos

Se hace **antes** de migrar, sobre el stack actual, para que el build viejo sirva de red de seguridad: si el build seguía funcionando antes y sigue funcionando después, el borrado no rompió nada.

**Files:**
- Delete: `src/Productos.vue`, `src/ProductosLista.vue`, `src/utils/index.js`
- Modify: `src/router.js`, `src/components/Navigation.vue:118-121`, `.env`

**Interfaces:**
- Consumes: nada
- Produces: nada. Ninguna task posterior importa de `src/utils/`.

- [ ] **Step 1: Confirmar el estado de partida del árbol de trabajo**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing status --short
```

Espera: `src/components/Navigation.vue` aparece modificado (cambio preexistente del usuario, 1 línea añadida y 4 borradas). **Si aparece cualquier otro archivo modificado, detenerse y preguntar.** Si el usuario confirma que el cambio de `Navigation.vue` es suyo y válido, commitearlo aparte antes de seguir.

- [ ] **Step 2: Verificar que el build actual funciona**

```bash
npm --prefix C:/Desarrollo/Repositorios/viniapro/viniapro-landing run build
```

Espera: termina sin error y genera `dist/`. Este es el estado de referencia. Si ya falla aquí, detenerse: el problema es previo y hay que diagnosticarlo antes de borrar nada.

- [ ] **Step 3: Borrar los dos componentes**

```bash
rm C:/Desarrollo/Repositorios/viniapro/viniapro-landing/src/Productos.vue
rm C:/Desarrollo/Repositorios/viniapro/viniapro-landing/src/ProductosLista.vue
```

- [ ] **Step 4: Limpiar las rutas comentadas de `src/router.js`**

Borrar los dos bloques comentados de `productos` y `productos/editor` (líneas 13-24 aproximadamente). El archivo queda con las tres rutas vivas: `/`, `/error` y el comodín. No se cambia nada más en este paso — la migración a vue-router 4 es la Task 3.

- [ ] **Step 5: Borrar el método comentado de `src/components/Navigation.vue`**

Eliminar el bloque `/*irProductos() { ... }*/` (líneas 118-121). Dejar el objeto `methods` con `onResize` y `navegar`, cuidando que no quede una coma colgando tras `navegar`.

- [ ] **Step 6: Borrar `src/utils/index.js` entero**

Comprobado: el único importador del módulo era `ProductosLista.vue` (`import { getProductos, setProductos } from "./utils/index"`). Con Productos fuera, las ocho funciones del archivo quedan sin uso — incluidas `mapOrder`, `getDateWithFormat`, `getCurrentTime` y `ThemeColors`, que nunca llegaron a importarse en ningún sitio.

```bash
rm C:/Desarrollo/Repositorios/viniapro/viniapro-landing/src/utils/index.js
rmdir C:/Desarrollo/Repositorios/viniapro/viniapro-landing/src/utils
```

Antes de borrar, confirmar que sigue sin importadores:

```bash
grep -rn "utils" C:/Desarrollo/Repositorios/viniapro/viniapro-landing/src --include=*.vue --include=*.js
```

Espera: sin resultados una vez borrados los dos componentes de Productos.

- [ ] **Step 7: Quitar `VUE_APP_RUTA_API` del `.env`**

El archivo queda solo con:

```
VUE_APP_I18N_LOCALE=es
VUE_APP_I18N_FALLBACK_LOCALE=es
```

(El renombrado a `VITE_*` es la Task 2.)

- [ ] **Step 8: Comprobar que no quedan referencias**

```bash
grep -rn "Productos\|RUTA_API\|getCurrentUser\|setCurrentUser" C:/Desarrollo/Repositorios/viniapro/viniapro-landing/src C:/Desarrollo/Repositorios/viniapro/viniapro-landing/.env
```

Espera: sin resultados. Si aparece alguno, resolverlo antes de seguir.

- [ ] **Step 9: Verificar que el build sigue funcionando**

```bash
npm --prefix C:/Desarrollo/Repositorios/viniapro/viniapro-landing run build
```

Espera: termina sin error, igual que en el Step 2.

- [ ] **Step 10: Commit**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing add -A
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing commit -m "Elimina las vistas de Productos y su codigo asociado"
```

---

### Task 2: Andamiaje de build — pnpm, dependencias, Vite

Al terminar esta task el proyecto **no arranca todavía**: el código fuente sigue siendo Vue 2. Eso es esperado. El entregable verificable es que las dependencias instalan y que `vite` reconoce la configuración.

**Files:**
- Create: `vite.config.js`, `index.html`
- Modify: `package.json`, `.env`, `.gitignore`
- Delete: `vue.config.js`, `babel.config.js`, `public/index.html`, `package-lock.json`

**Interfaces:**
- Consumes: nada
- Produces: alias `@` → `<proyecto>/src` disponible en JS, plantillas y CSS. Scripts `pnpm dev`, `pnpm build`, `pnpm preview`, `pnpm lint`. Variables `VITE_I18N_LOCALE` y `VITE_I18N_FALLBACK_LOCALE`.

- [ ] **Step 1: Reescribir `package.json`**

```json
{
  "name": "viniapro-landing",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.2.2",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix"
  },
  "dependencies": {
    "@fontsource/roboto": "^5.1.0",
    "@mdi/font": "^7.4.47",
    "vue": "^3.5.13",
    "vue-i18n": "^9.14.2",
    "vue-router": "^4.5.0",
    "vuetify": "^3.7.6"
  },
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "@vitejs/plugin-vue": "^5.2.1",
    "eslint": "^9.17.0",
    "eslint-plugin-vue": "^9.32.0",
    "sass": "^1.83.0",
    "vite": "^7.0.0",
    "vite-plugin-vuetify": "^2.0.4"
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}
```

Nota: `"type": "module"` es necesario para que `vite.config.js` y `eslint.config.js` se lean como ESM. El bloque `eslintConfig` desaparece de aquí; se sustituye por `eslint.config.js` en la Task 9. Los rangos `^` son la línea objetivo; la versión exacta la fija `pnpm-lock.yaml`.

- [ ] **Step 2: Borrar los archivos de configuración obsoletos**

```bash
cd C:/Desarrollo/Repositorios/viniapro/viniapro-landing
rm vue.config.js babel.config.js package-lock.json
rm -rf node_modules
```

- [ ] **Step 3: Crear `vite.config.js`**

```js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8080,
  },
})
```

`transformAssetUrls` es lo que hace que Vite reescriba las rutas de assets en props de componentes Vuetify (`v-img src`, `v-parallax src`, `v-navigation-drawer image`). Sin él, esas imágenes se sirven rotas en producción aunque el build compile.

- [ ] **Step 4: Crear `index.html` en la raíz**

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link rel="icon" href="/favicon.ico" />
    <title>ViniaPro</title>
  </head>
  <body>
    <noscript>
      <strong>ViniaPro no funciona correctamente sin JavaScript. Actívalo para continuar.</strong>
    </noscript>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

Los dos `<link>` a CDN (Google Fonts y MDI) no se copian: esas dependencias pasan a importarse desde `main.js` en la Task 3.

- [ ] **Step 5: Borrar `public/index.html`**

```bash
rm C:/Desarrollo/Repositorios/viniapro/viniapro-landing/public/index.html
```

`public/favicon.ico` se queda: Vite sirve `public/` en la raíz, así que `href="/favicon.ico"` sigue resolviendo.

- [ ] **Step 6: Renombrar las variables del `.env`**

```
VITE_I18N_LOCALE=es
VITE_I18N_FALLBACK_LOCALE=es
```

- [ ] **Step 7: Actualizar `.gitignore`**

Cambiar la línea `/dist` por `dist`, y añadir al final:

```
# Vite
*.local
```

- [ ] **Step 8: Instalar dependencias con pnpm**

```bash
cd C:/Desarrollo/Repositorios/viniapro/viniapro-landing
pnpm install
```

Espera: se genera `pnpm-lock.yaml`. **pnpm 10+ bloquea los scripts de compilación por defecto** y avisará de los paquetes ignorados. Anotar cuáles son: se resuelven en el Step 9.

- [ ] **Step 9: Configurar la allowlist de scripts de compilación**

Revisar el aviso del Step 8. Añadir a `package.json` solo los paquetes que realmente necesitan compilar (típicamente `esbuild`; posiblemente `@parcel/watcher`):

```json
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild"]
  }
```

Ajustar la lista a lo que pnpm haya reportado de verdad — **no copiar esta lista a ciegas**. Reinstalar:

```bash
pnpm install
```

Espera: sin avisos de scripts ignorados que afecten a paquetes necesarios para el build.

- [ ] **Step 10: Verificar que Vite lee la configuración**

```bash
cd C:/Desarrollo/Repositorios/viniapro/viniapro-landing
pnpm exec vite --help
```

Espera: imprime la ayuda de Vite sin errores de parseo de `vite.config.js`.

- [ ] **Step 11: Commit**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing add -A
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing commit -m "Sustituye vue-cli por Vite y migra a pnpm"
```

---

### Task 3: Migrar el bootstrap de la aplicación

Entregable: la app arranca en el dev server y renderiza, aunque los componentes de sección aún tengan APIs de Vuetify 2 que fallen.

**Files:**
- Modify: `src/main.js`, `src/plugins/vuetify.js`, `src/plugins/i18n.js`, `src/router.js`, `src/App.vue`, `src/views/Error.vue`

**Interfaces:**
- Consumes: alias `@` y variables `VITE_I18N_*` de la Task 2
- Produces: instancias `vuetify`, `i18n` y `router` exportadas por defecto desde sus módulos. `$t()` disponible en todas las plantillas. `useGoTo()` de `vuetify` disponible para las tasks 4-8.

- [ ] **Step 1: Reescribir `src/plugins/vuetify.js`**

```js
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  display: {
    thresholds: {
      xs: 0,
      sm: 340,
      md: 540,
      lg: 800,
      xl: 1280,
      xxl: 1920,
    },
  },
})
```

Los cinco primeros umbrales son los que ya había. `xxl` no existía en Vuetify 2 y hay que darle un valor; 1920 es el default de Vuetify 3. `scrollBarWidth` ya no es opción de `display` en Vuetify 3 y se elimina. **Estos umbrales quedan marcados para revisión del usuario en la Task 12.**

- [ ] **Step 2: Reescribir `src/plugins/i18n.js`**

```js
import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: import.meta.env.VITE_I18N_LOCALE || 'es',
  fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE || 'es',
  messages: { en, es },
})
```

`globalInjection: true` es imprescindible: `Navigation.vue` usa `$t()` en plantilla y `this.$t()` en `created()`. Sin él, ambos quedan indefinidos.

- [ ] **Step 3: Reescribir `src/router.js`**

```js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('./views/Inicio.vue'),
  },
  {
    path: '/error',
    component: () => import('./views/Error.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('./views/Error.vue'),
  },
]

export default createRouter({
  history: createWebHistory(),
  linkActiveClass: 'active',
  routes,
})
```

Tres cambios obligatorios: `path: "*"` no es válido en vue-router 4 y se escribe `/:pathMatch(.*)*`; los imports necesitan la extensión `.vue` explícita porque Vite no la infiere; y los comentarios `/* webpackChunkName */` se eliminan por ser directivas de webpack sin efecto en Rollup.

- [ ] **Step 4: Reescribir `src/main.js`**

```js
import { createApp } from 'vue'

import '@fontsource/roboto/100.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'
import router from './router'

createApp(App)
  .use(vuetify)
  .use(i18n)
  .use(router)
  .mount('#app')
```

Los seis pesos de Roboto son los que cargaba el `<link>` de Google Fonts. `Vue.config.productionTip` no existe en Vue 3 y desaparece. `vue-youtube-embed` deja de registrarse: se sustituye por un `<iframe>` en la Task 6.

- [ ] **Step 5: Revisar `src/App.vue` y `src/views/Error.vue`**

Ambos son muy pequeños (4 y 5 líneas). Comprobar que `App.vue` contiene un `<router-view />` y ningún API de Vue 2. Si `Error.vue` usa componentes Vuetify, dejarlos: se validan en el Step 7.

- [ ] **Step 6: Arrancar el dev server**

Usar `preview_start` con `.claude/launch.json`, creándolo si no existe:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "landing",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "port": 8080
    }
  ]
}
```

- [ ] **Step 7: Verificar el arranque en el navegador**

Navegar a `/error` (la ruta más simple, sin componentes de sección todavía sin migrar). Con `read_console_messages` comprobar que **no hay errores de resolución de módulos ni de plugins**. Es esperado y aceptable que `/` falle todavía: sus componentes se migran en las tasks 4-8. Lo que aquí se valida es que Vue, Vuetify, el router y el i18n arrancan.

Con `read_page`, confirmar que la vista de error renderiza contenido.

- [ ] **Step 8: Commit**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing add -A
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing commit -m "Migra el bootstrap a Vue 3, Vuetify 3, vue-router 4 y vue-i18n 9"
```

---

### Task 4: Migrar `Navigation.vue`

El componente con más cambios de API del proyecto: barra superior, drawer móvil y navegación por anclas.

**Files:**
- Modify: `src/components/Navigation.vue`

**Interfaces:**
- Consumes: `useGoTo` de `vuetify`, `$t()` del i18n de la Task 3
- Produces: componente `Navigation` con props `color: String` y `flat: Boolean`, consumido por `Inicio.vue` en la Task 5. Las props no cambian de nombre ni de tipo.

- [ ] **Step 1: Sustituir `$vuetify.goTo` por el composable `useGoTo`**

`$vuetify.goTo()` no existe en Vuetify 3. Añadir un `setup()` al componente y usar `this.goTo(...)` en su lugar:

```js
import { useGoTo } from 'vuetify'

export default {
  setup() {
    return { goTo: useGoTo() }
  },
  // ...resto de opciones
}
```

En el método `navegar`, reemplazar `this.$vuetify.goTo(destino)` por `this.goTo(destino)`. En la plantilla, los seis `@click="$vuetify.goTo('#...')"` pasan a `@click="goTo('#...')"`.

- [ ] **Step 2: Migrar el `v-navigation-drawer`**

```vue
<v-navigation-drawer
  v-model="drawer"
  temporary
  theme="dark"
  image="@/assets/img/bgDrawer.jpg"
>
```

Cambios: la prop `app` desaparece (el layout lo resuelve `v-app`); `dark` pasa a `theme="dark"`; `src` pasa a `image`. La ruta `@/assets/...` funciona gracias a `transformAssetUrls` de la Task 2.

- [ ] **Step 3: Migrar el primer `v-list-item` (cabecera del drawer)**

`v-list-item-avatar` y `v-list-item-content` no existen en Vuetify 3. La cabecera pasa a usar props y el slot `prepend`:

```vue
<v-list>
  <v-list-item title="Software" subtitle="Ecuador">
    <template #prepend>
      <v-avatar>
        <img src="@/assets/img/logo.png" alt="Logo" />
      </v-avatar>
    </template>
  </v-list-item>
</v-list>
```

- [ ] **Step 4: Migrar la lista de navegación**

`v-list-item-icon` desaparece; el icono va en el slot `prepend` y el texto en la prop `title`:

```vue
<v-list density="compact">
  <v-list-item
    v-for="([icon, text, link], i) in items"
    :key="i"
    link
    :title="text"
    @click="navegar(link)"
  >
    <template #prepend>
      <v-icon>{{ icon }}</v-icon>
    </template>
  </v-list-item>
</v-list>
```

`dense` pasa a `density="compact"`.

- [ ] **Step 5: Migrar el `v-app-bar`**

```vue
<v-app-bar
  :color="color"
  :flat="flat"
  theme="dark"
  class="px-15"
  :class="{ expand: flat }"
>
```

`app` desaparece, `dark` pasa a `theme="dark"`.

- [ ] **Step 6: Migrar los botones**

Los seis `v-btn text` pasan a `v-btn variant="text"`. El botón "Ingresar", que hoy combina `rounded outlined text`, pasa a:

```vue
<v-btn rounded variant="outlined" :href="appurl" target="_blank" color="primary">
  <span class="mr-2">Ingresar</span>
</v-btn>
```

`variant` es excluyente: no pueden convivir `outlined` y `text`; se elige `outlined`, que es el aspecto dominante hoy.

- [ ] **Step 7: Verificar en el navegador — escritorio**

Con `resize_window` a 1280x800 y recargando, comprobar con `read_page` que los seis botones del menú están presentes con sus etiquetas traducidas (Inicio, Acerca, Demostración, Planes, Contactenos, Ingresar). Con `read_console_messages`, cero errores.

Hacer clic en "Planes" con `computer` y confirmar por `javascript_tool` que `window.scrollY` cambió: eso valida que `useGoTo` funciona.

- [ ] **Step 8: Verificar en el navegador — móvil**

Con `resize_window` al preset `mobile` (375px) y recargando, comprobar que aparece el icono de hamburguesa en lugar de los botones. Hacer clic y confirmar con `read_page` que el drawer se abre con las seis entradas y sus iconos.

- [ ] **Step 9: Captura**

`computer {action: "screenshot"}` en móvil con el drawer abierto, y en escritorio. Se guardan para la revisión de la Task 12.

- [ ] **Step 10: Commit**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing add src/components/Navigation.vue
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing commit -m "Migra Navigation a la API de Vuetify 3"
```

---

### Task 5: Migrar `Inicio.vue`

**Files:**
- Modify: `src/views/Inicio.vue`

**Interfaces:**
- Consumes: `Navigation` de la Task 4 (props `color`, `flat`)
- Produces: el contenedor `v-app` que envuelve todas las secciones. Las tasks 6-8 migran componentes que se renderizan dentro de su `v-main`.

- [ ] **Step 1: Añadir la extensión `.vue` a todos los imports**

```js
import navigation from '../components/Navigation.vue'
import foote from '../components/Footer.vue'
import home from '../components/HomeSection.vue'
import about from '../components/AboutSection.vue'
import download from '../components/DownloadSection.vue'
import pricing from '../components/PricingSection.vue'
import contact from '../components/ContactSection.vue'
```

Vite no resuelve extensiones implícitas para `.vue`. Sin esto el build falla.

- [ ] **Step 2: Sustituir la directiva `v-scroll`**

Vuetify 3 no incluye `v-scroll`. Se reemplaza por un listener explícito. Quitar `v-scroll="onScroll"` de la plantilla y añadir al componente:

```js
  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true })
    this.onScroll()
  },

  unmounted() {
    window.removeEventListener('scroll', this.onScroll)
  },
```

Y simplificar `onScroll`, que ya no recibe un evento de Vuetify:

```js
    onScroll() {
      if (typeof window === 'undefined') return
      this.fab = window.scrollY > 60
    },
```

`window.pageYOffset` está obsoleto; `window.scrollY` es el equivalente actual.

- [ ] **Step 3: Sustituir `$vuetify.goTo` en `toTop`**

Igual que en la Task 4: añadir `setup() { return { goTo: useGoTo() } }` con `import { useGoTo } from 'vuetify'`, y cambiar el método a:

```js
    toTop() {
      this.goTo(0)
    },
```

- [ ] **Step 4: Migrar el botón flotante**

Las props `fab`, `fixed`, `bottom`, `right` y `dark` de `v-btn` desaparecen en Vuetify 3. Se sustituyen por la prop `icon` y posicionamiento CSS:

```vue
<v-scale-transition>
  <v-btn
    v-show="fab"
    icon="mdi-arrow-up"
    class="btn-to-top"
    color="secondary"
    theme="dark"
    @click="toTop"
  />
</v-scale-transition>
```

Y en el bloque `<style scoped>`:

```css
.btn-to-top {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 5;
}
```

- [ ] **Step 5: Corregir la ruta del fondo en CSS**

En `<style scoped>`, `url("~@/assets/img/bgMain.png")` pasa a `url("@/assets/img/bgMain.png")`. El prefijo `~` es sintaxis de webpack; Vite resuelve el alias `@` directamente en `url()`.

- [ ] **Step 6: Actualizar `window.pageYOffset` en `created()`**

```js
  created() {
    const top = window.scrollY || 0
    if (top <= 60) {
      this.color = 'transparent'
      this.flat = true
    }
  },
```

- [ ] **Step 7: Verificar en el navegador**

Recargar `/`. Con `read_console_messages`, cero errores (los componentes de sección aún sin migrar pueden fallar; anotar cuáles y seguir — se arreglan en las tasks 6-8, pero **la barra superior, el fondo y el botón flotante deben funcionar ya**).

Con `javascript_tool`, hacer `window.scrollTo(0, 500)` y confirmar con `read_page` que el botón flotante aparece. Hacer clic y confirmar que `window.scrollY` vuelve a 0.

Con `javascript_tool`, verificar que el fondo carga:

```js
getComputedStyle(document.querySelector('.v-main')).backgroundImage
```

Espera: una `url(...)` que apunta a un asset servido, **no** `none` ni una ruta con `~`.

- [ ] **Step 8: Commit**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing add src/views/Inicio.vue
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing commit -m "Migra Inicio a Vuetify 3 y sustituye la directiva v-scroll"
```

---

### Task 6: Migrar `HomeSection.vue`

La sección con más superficie de cambio: parallax, tarjetas con hover, imágenes por `require()` y el modal del vídeo.

**Files:**
- Modify: `src/components/HomeSection.vue`

**Interfaces:**
- Consumes: `useGoTo` de `vuetify`
- Produces: nada que consuman otras tasks

- [ ] **Step 1: Sustituir los `require()` por imports estáticos**

`require()` no existe en un módulo ESM y Vite no lo soporta. Añadir al principio del `<script>`:

```js
import icon1 from '@/assets/img/icon1.png'
import icon2 from '@/assets/img/icon2.png'
import icon3 from '@/assets/img/icon3.png'
```

Y en `data()`, cambiar `img: require("@/assets/img/icon2.png")` por `img: icon2`, y análogamente para los otros dos. **Atención al orden**: hoy la primera tarjeta ("Diseño Minimalista") usa `icon2`, la segunda ("Datos Seguros") usa `icon1` y la tercera usa `icon3`. Mantener esa correspondencia.

- [ ] **Step 2: Migrar el `v-parallax`**

`v-parallax` se reescribió en Vuetify 3: ya no acepta `dark` ni `height` de la misma forma, y el contenido va en el slot por defecto sobre una imagen de fondo.

```vue
<v-parallax src="@/assets/img/bgHero.jpg" height="750" class="text-white">
```

Quitar la prop `dark` y añadir `class="text-white"` para conservar el texto claro sobre la imagen. Verificar en el navegador que el contenido sigue centrado; si Vuetify 3 lo alinea distinto, ajustar con clases de utilidad, no con CSS nuevo.

- [ ] **Step 3: Migrar el `v-hover`**

Los slot props cambiaron. De:

```vue
<v-hover v-slot:default="{ hover }">
  <v-card class="card" shaped :elevation="hover ? 10 : 4" :class="{ up: hover }">
```

a:

```vue
<v-hover v-slot="{ isHovering, props }">
  <v-card
    v-bind="props"
    class="card"
    rounded="lg"
    :elevation="isHovering ? 10 : 4"
    :class="{ up: isHovering }"
  >
```

Dos cosas imprescindibles: `v-bind="props"` es lo que conecta los listeners de hover al elemento (sin eso el hover nunca se dispara), y `shaped` no existe en Vuetify 3 — el equivalente más cercano es `rounded="lg"`.

Actualizar también el `:class="{ 'zoom-efect': isHovering }"` del `v-img` interior.

- [ ] **Step 4: Sustituir el componente `<youtube>` por un `<iframe>`**

`vue-youtube-embed` solo existe para Vue 2. Reemplazar el bloque del `v-dialog`:

```vue
<v-dialog v-model="dialog" max-width="640px">
  <v-card>
    <iframe
      v-if="dialog"
      class="video-frame"
      :src="`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`"
      title="Demostración de ViniaPro"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  </v-card>
</v-dialog>
```

Y en `<style>`:

```css
.video-frame {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
}
```

El `v-if="dialog"` evita que el iframe cargue (y el vídeo empiece) mientras el modal está cerrado. Eliminar del componente los métodos `ready` y `playing` si solo servían a los eventos de la librería, y la variable `videoId` se conserva.

- [ ] **Step 5: Corregir la ruta `~@/` del `<img>` de la onda**

Línea 127: `src="~@/assets/img/wave2.svg"` pasa a `src="@/assets/img/wave2.svg"`.

- [ ] **Step 6: Sustituir `$vuetify.goTo`**

Línea 19: `@click="$vuetify.goTo('#features')"` pasa a `@click="goTo('#features')"`, con el mismo `setup()` y el import de `useGoTo` de las tasks anteriores.

- [ ] **Step 7: Verificar en el navegador**

Recargar `/`. Comprobar con `read_console_messages` que no hay errores.

Con `read_page`, confirmar que las tres tarjetas de características muestran sus títulos ("Diseño Minimalista", "Datos Seguros", "Multiples dispositivos").

Con `javascript_tool`, confirmar que las tres imágenes de icono cargaron de verdad:

```js
[...document.querySelectorAll('.card img')].map(i => [i.currentSrc, i.naturalWidth])
```

Espera: tres entradas con `naturalWidth > 0`. Un `naturalWidth` de 0 significa imagen rota — típico de una ruta `~@/` sin corregir.

Abrir el modal del vídeo con `computer` y confirmar con `read_page` que el iframe existe.

- [ ] **Step 8: Captura**

`computer {action: "screenshot"}` de la sección hero y de las tarjetas.

- [ ] **Step 9: Commit**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing add src/components/HomeSection.vue
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing commit -m "Migra HomeSection a Vuetify 3 y sustituye vue-youtube-embed por un iframe"
```

---

### Task 7: Migrar `AboutSection`, `DownloadSection` y `PricingSection`

Las tres son maquetación con `v-container`/`v-row`/`v-col`/`v-img`, sin lógica. Van juntas porque el cambio es el mismo y ninguna justifica su propio ciclo de revisión.

**Files:**
- Modify: `src/components/AboutSection.vue`, `src/components/DownloadSection.vue`, `src/components/PricingSection.vue`

**Interfaces:**
- Consumes: nada
- Produces: nada

- [ ] **Step 1: Corregir todas las rutas `~@/`**

- `src/components/DownloadSection.vue:33` — en CSS: `url("~@/assets/img/bgDownload.jpg")` → `url("@/assets/img/bgDownload.jpg")`
- `src/components/PricingSection.vue:16` — `<v-img src="~@/assets/img/paperplane.svg">` → `src="@/assets/img/paperplane.svg"`
- `src/components/PricingSection.vue:50` — `airplane.svg`, mismo cambio
- `src/components/PricingSection.vue:86` — `aeroplane.svg`, mismo cambio

- [ ] **Step 2: Revisar props de `v-btn` en las tres secciones**

Buscar `v-btn` con props booleanas de estilo y convertirlas: `text` → `variant="text"`, `outlined` → `variant="outlined"`, `depressed` → `variant="flat"`, `rounded` se mantiene.

```bash
grep -n "v-btn" -A4 src/components/AboutSection.vue src/components/DownloadSection.vue src/components/PricingSection.vue
```

- [ ] **Step 3: Revisar props de `v-card`**

`shaped` no existe en Vuetify 3 → `rounded="lg"`. `v-card-text` y `v-card-title` se mantienen con el mismo nombre.

- [ ] **Step 4: Verificar en el navegador**

Recargar `/` y comprobar consola limpia. Con `javascript_tool`, verificar que **todas** las imágenes de la página cargaron:

```js
[...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.currentSrc || i.src)
```

Espera: array vacío. Cualquier entrada es una imagen rota que hay que corregir antes de commitear.

Verificar el fondo de la sección de descarga:

```js
getComputedStyle(document.querySelector('#download')).backgroundImage
```

Espera: una `url(...)` resuelta.

- [ ] **Step 5: Captura**

Screenshot de las tres secciones en escritorio y en móvil.

- [ ] **Step 6: Commit**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing add src/components/AboutSection.vue src/components/DownloadSection.vue src/components/PricingSection.vue
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing commit -m "Migra las secciones Acerca, Descarga y Planes a Vuetify 3"
```

---

### Task 8: Migrar `ContactSection`, `Footer` y `Error`

**Files:**
- Modify: `src/components/ContactSection.vue`, `src/components/Footer.vue`, `src/views/Error.vue`

**Interfaces:**
- Consumes: nada
- Produces: nada

- [ ] **Step 1: Corregir la ruta `~@/` de `ContactSection.vue:65`**

`<v-img src="~@/assets/img/borderWavesBlue.svg"/>` → `src="@/assets/img/borderWavesBlue.svg"`

- [ ] **Step 2: Migrar los campos del formulario**

`v-text-field` y `v-textarea`: `outlined` → `variant="outlined"`, `solo` → `variant="solo"`, `filled` → `variant="filled"`. La prop `label` no cambia.

Si el formulario usa `:rules` con `v-form` y `ref`, en Vuetify 3 `validate()` es asíncrono y devuelve `{ valid, errors }`. Revisar el método `submit()` (línea 135) y, si llama a `this.$refs.form.validate()` esperando un booleano, adaptarlo:

```js
    async submit() {
      const { valid } = await this.$refs.form.validate()
      if (!valid) return
      // ...resto de la lógica existente, sin cambios
    },
```

- [ ] **Step 3: Migrar el `v-snackbar`**

En Vuetify 3 el contenido va en el slot por defecto y las acciones en el slot `actions`. Si el botón de cerrar está dentro del slot por defecto, moverlo:

```vue
<v-snackbar v-model="snackbar.enabled" :timeout="snackbar.timeout" :color="snackbar.color">
  {{ snackbar.text }}
  <template #actions>
    <v-btn variant="text" @click="snackbar.enabled = false">Cerrar</v-btn>
  </template>
</v-snackbar>
```

Conservar los nombres de las propiedades del objeto `snackbar` que ya use el componente.

- [ ] **Step 4: Migrar `Footer.vue`**

Revisar `v-footer` (la prop `padless` no existe en Vuetify 3; usar `class="pa-0"` si hacía falta) y los `v-btn` de redes sociales (`icon` sigue existiendo, pero ahora admite el nombre del icono como valor: `icon="mdi-youtube"`).

- [ ] **Step 5: Migrar `Error.vue`**

Son 5 líneas. Comprobar que no usa componentes retirados y que renderiza.

- [ ] **Step 6: Verificar en el navegador**

Recargar `/`. Consola limpia. Con `read_page`, confirmar que el formulario de contacto muestra sus campos y que el pie muestra los enlaces sociales.

Enviar el formulario vacío con `computer` y confirmar que aparece el snackbar (o los mensajes de validación, según lo que hiciera antes).

Navegar a `/error` y a `/ruta-que-no-existe`, y confirmar con `read_page` que ambas muestran la vista de error.

- [ ] **Step 7: Commit**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing add src/components/ContactSection.vue src/components/Footer.vue src/views/Error.vue
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing commit -m "Migra Contacto, Footer y Error a Vuetify 3"
```

---

### Task 9: ESLint 9 con flat config

**Files:**
- Create: `eslint.config.js`

**Interfaces:**
- Consumes: nada
- Produces: `pnpm lint` operativo

- [ ] **Step 1: Crear `eslint.config.js`**

```js
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
      },
    },
    rules: {},
  },
]
```

- [ ] **Step 2: Ejecutar el lint**

```bash
cd C:/Desarrollo/Repositorios/viniapro/viniapro-landing
pnpm lint
```

Espera: termina sin errores. `eslint . --fix` corrige lo autocorregible. Si quedan errores reales, **arreglarlos en el código**, no silenciarlos con reglas desactivadas ni con `eslint-disable`.

- [ ] **Step 3: Commit**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing add -A
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing commit -m "Configura eslint 9 con flat config"
```

---

### Task 10: Build de producción y Docker

**Files:**
- Create: `.dockerignore`
- Modify: `Dockerfile`

**Interfaces:**
- Consumes: `pnpm build` funcional de las tasks anteriores
- Produces: imagen que sirve la SPA por nginx en el puerto 80

- [ ] **Step 1: Build de producción**

```bash
cd C:/Desarrollo/Repositorios/viniapro/viniapro-landing
pnpm build
```

Espera: termina sin error y genera `dist/index.html` más `dist/assets/`.

- [ ] **Step 2: Comprobar el resultado con `preview`**

```bash
pnpm preview
```

Abrir la URL que imprime y repetir las comprobaciones clave: consola limpia, imágenes cargadas (el mismo snippet de `document.images` de la Task 7), navegación entre `/` y `/error`. Esto detecta los fallos que solo aparecen en el bundle de producción, que es exactamente donde muerden los assets mal referenciados.

- [ ] **Step 3: Crear `.dockerignore`**

```
node_modules
dist

.git
.gitignore
.vscode

.env
docs
```

- [ ] **Step 4: Reescribir el `Dockerfile`**

```dockerfile
FROM docker.io/library/node:20-alpine AS build
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM docker.io/library/nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

Cambios respecto al actual: `npm install` → `pnpm install --frozen-lockfile` (falla si el lockfile no cuadra, en vez de resolver versiones nuevas); desaparece `NODE_OPTIONS=--openssl-legacy-provider`, que solo existía por webpack 4. La etapa de nginx no cambia.

- [ ] **Step 5: Construir la imagen**

```bash
docker build -t viniapro-landing:test C:/Desarrollo/Repositorios/viniapro/viniapro-landing
```

Espera: las dos etapas completan sin error.

- [ ] **Step 6: Verificar el contenedor**

```bash
docker run --rm -d -p 8081:80 --name viniapro-landing-test viniapro-landing:test
```

Con `preview_start` apuntando a `http://localhost:8081`, comprobar que el landing carga, que las imágenes aparecen y que `/ruta-inexistente` devuelve la SPA en vez de un 404 de nginx (eso valida el `try_files`). Después:

```bash
docker stop viniapro-landing-test
```

- [ ] **Step 7: Commit**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing add Dockerfile .dockerignore
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing commit -m "Adapta el Dockerfile a pnpm y elimina el flag de OpenSSL legacy"
```

---

### Task 11: Migrar `viniapro-erp` a pnpm

Task independiente, en **otro repositorio**. No depende de las tasks 1-10 y puede ejecutarse antes o después.

**Files:**
- Create: `C:\Desarrollo\Repositorios\viniapro\viniapro-erp\pnpm-lock.yaml`
- Modify: `C:\Desarrollo\Repositorios\viniapro\viniapro-erp\package.json`, `C:\Desarrollo\Repositorios\viniapro\viniapro-erp\Dockerfile`
- Delete: `C:\Desarrollo\Repositorios\viniapro\viniapro-erp\package-lock.json`

**Interfaces:**
- Consumes: nada
- Produces: nada que consuman otras tasks

- [ ] **Step 1: Confirmar el punto de partida**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-erp status --short
```

Hay 6 archivos modificados sin commitear de un trabajo previo (fix de `stocks.vue` y limpieza de SSR/Docker). **Commitearlos antes de empezar esta task**, para que el cambio de gestor de paquetes quede aislado.

- [ ] **Step 2: Generar el lockfile de pnpm desde el de npm**

```bash
cd C:/Desarrollo/Repositorios/viniapro/viniapro-erp
pnpm import
```

Espera: genera `pnpm-lock.yaml` heredando las versiones exactas ya fijadas en `package-lock.json`. Esto importa: esas versiones son las que se han validado construyendo el proyecto, no unas nuevas.

- [ ] **Step 3: Borrar el lockfile de npm**

```bash
rm C:/Desarrollo/Repositorios/viniapro/viniapro-erp/package-lock.json
```

- [ ] **Step 4: Añadir `packageManager` a `package.json`**

Junto al bloque `engines`:

```json
  "packageManager": "pnpm@11.2.2",
```

- [ ] **Step 5: Instalar y resolver la allowlist de scripts**

```bash
cd C:/Desarrollo/Repositorios/viniapro/viniapro-erp
rm -rf node_modules
pnpm install --frozen-lockfile
```

pnpm avisará de los paquetes cuyos scripts de compilación ha bloqueado. Añadir a `package.json` **solo los que el build necesite de verdad** (esperables aquí: `esbuild`, `sass-embedded`, `vue-demi`; confirmar con la salida real):

```json
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild", "sass-embedded", "vue-demi"]
  }
```

Reinstalar tras el cambio.

- [ ] **Step 6: Verificar que el build sigue funcionando**

```bash
cd C:/Desarrollo/Repositorios/viniapro/viniapro-erp
pnpm build
```

Espera: termina sin error y genera `dist/index.html`. Este es el mismo build que ya se validó con npm; si ahora falla, casi seguro falta un paquete en `onlyBuiltDependencies`.

- [ ] **Step 7: Adaptar el `Dockerfile` del ERP**

Sustituir el bloque de instalación:

```dockerfile
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
```

y cambiar `npm run build` por `pnpm build`. La etapa `prod` instala `serve` globalmente y no usa el gestor del proyecto, así que no cambia.

- [ ] **Step 8: Construir la imagen del ERP**

```bash
docker build -t viniapro-erp:test C:/Desarrollo/Repositorios/viniapro/viniapro-erp
```

Espera: las dos etapas completan sin error.

- [ ] **Step 9: Commit**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-erp add -A
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-erp commit -m "Migra el gestor de paquetes a pnpm con lockfile congelado"
```

---

### Task 12: Revisión visual y ajuste de breakpoints

Última task. Cierra los dos puntos que la spec dejó marcados para decisión del usuario.

**Files:**
- Modify: `src/plugins/vuetify.js` (solo si la revisión lo exige)

**Interfaces:**
- Consumes: todo lo anterior
- Produces: el entregable final

- [ ] **Step 1: Recorrer el landing completo en escritorio**

Con el dev server y `resize_window` a 1280x800: capturas de cada sección (hero, tarjetas, acerca, descarga, planes, contacto, pie).

- [ ] **Step 2: Recorrer el landing completo en móvil**

`resize_window` al preset `mobile` y recargar (el preset móvil cambia el user agent y emula táctil, así que hace falta recargar para que se reevalúen las condiciones de carga). Capturas de las mismas secciones más el drawer abierto.

- [ ] **Step 3: Evaluar los breakpoints personalizados**

Los umbrales heredados (`sm: 340, md: 540, lg: 800, xl: 1280`) son inusualmente bajos. Comprobar en anchos de 375, 540, 800 y 1280 px que el layout no rompe y que la barra superior conmuta entre botones y hamburguesa donde debe.

Ojo a un detalle: `Navigation.vue` decide mostrar la hamburguesa con `window.innerWidth < 850`, un número escrito a mano que **no** viene de los breakpoints de Vuetify. Si el resultado es incoherente, señalarlo al usuario en lugar de cambiarlo por cuenta propia — es una decisión de diseño.

- [ ] **Step 4: Presentar el resultado al usuario**

Entregar las capturas de antes y después, agrupadas por sección, junto con:
- la lista de diferencias visuales achacables a los defaults de Vuetify 3,
- los hallazgos sobre breakpoints del Step 3,
- cualquier decisión que se haya tomado sobre la marcha y merezca confirmación.

**Esperar su aprobación.** Aquí es donde el usuario ejerce la revisión que pidió al elegir "aprovecho para retocar el diseño".

- [ ] **Step 5: Aplicar los ajustes que el usuario pida**

Si pide cambios de umbrales, tocarlos en `display.thresholds` de `src/plugins/vuetify.js`. Si pide ajustes visuales, aplicarlos con clases de utilidad de Vuetify antes que con CSS propio.

- [ ] **Step 6: Verificación final**

```bash
cd C:/Desarrollo/Repositorios/viniapro/viniapro-landing
pnpm lint
pnpm build
```

Ambos limpios.

- [ ] **Step 7: Commit final**

```bash
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing add -A
git -C C:/Desarrollo/Repositorios/viniapro/viniapro-landing commit -m "Ajusta breakpoints y detalles visuales tras la revision"
```

---

## Riesgos y puntos de parada

- **Node 16 en local.** El plan no arranca sin Node 20. Es el primer bloqueo y hay que resolverlo antes de la Task 2.
- **Assets rotos que compilan igual.** Una ruta `~@/` sin corregir no rompe el build: rompe la imagen en tiempo de ejecución. Por eso cada task de componente verifica `naturalWidth` en el navegador y no se conforma con que `pnpm build` pase.
- **`v-parallax` y `v-hover`** son los dos componentes cuyo comportamiento real puede desviarse más de lo previsto. Si el parallax queda visualmente muy distinto, plantearlo al usuario antes de invertir tiempo en replicar el efecto antiguo.
- **`onlyBuiltDependencies` no se puede adivinar.** Las listas que aparecen en las tasks 2 y 11 son una expectativa, no una respuesta. Usar siempre la salida real de pnpm.
- **El push no está en el plan.** Ninguna task sube nada a los remotos. Cuando todo esté verificado, el usuario decide qué se publica.
