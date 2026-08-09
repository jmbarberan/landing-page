import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import i18n from '@/plugins/i18n'

// Vuetify 3 components como v-app-bar y v-navigation-drawer son "layout
// items": su setup() inyecta incondicionalmente una clave de layout que solo
// provee <v-app> (o <v-layout>). Montar esos componentes de forma aislada
// (sin envolverlos en <v-app>) hace que lancen "[Vuetify] Could not find
// injected layout" aunque el componente este migrado correctamente a la API
// de Vuetify 3. `Symbol.for('vuetify:layout')` es la misma clave que usa
// Vuetify internamente (Symbol.for comparte el registro global de simbolos),
// asi que aqui se provee un layout minimo que satisface el contrato que
// consumen useLayout/useLayoutItem sin necesidad de un <v-app> real en el
// arbol de render.
const VUETIFY_LAYOUT_KEY = Symbol.for('vuetify:layout')

function fakeLayoutPlugin() {
  return {
    install(app) {
      app.provide(VUETIFY_LAYOUT_KEY, {
        register: () => ({
          layoutItemStyles: computed(() => ({})),
          layoutItemScrimStyles: computed(() => ({})),
        }),
        unregister: () => {},
        mainRect: computed(() => ({ top: 0, left: 0, right: 0, bottom: 0 })),
        mainStyles: computed(() => ({})),
        getLayoutItem: () => undefined,
        items: computed(() => []),
        layoutRect: computed(() => undefined),
        rootZIndex: computed(() => 1000),
      })
    },
  }
}

export function mountWithVuetify(component, options = {}) {
  const vuetify = createVuetify({ components, directives })
  const { global: globalOptions = {}, ...rest } = options

  return mount(component, {
    global: {
      ...globalOptions,
      plugins: [vuetify, i18n, fakeLayoutPlugin(), ...(globalOptions.plugins ?? [])],
    },
    ...rest,
  })
}
