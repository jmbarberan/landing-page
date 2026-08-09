import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import i18n from '@/plugins/i18n'

// Vuetify 3 components como v-app-bar y v-navigation-drawer son "layout
// items": su setup() inyecta incondicionalmente una clave de layout que solo
// provee <v-app> (o <v-layout>). Montar esos componentes de forma aislada
// (sin envolverlos en <v-app>) hace que lancen "[Vuetify] Could not find
// injected layout" aunque el componente este migrado correctamente a la API
// de Vuetify 3.
//
// La solucion anterior inyectaba un proveedor de layout falso usando la
// clave de simbolo global interna que emplea Vuetify para este contrato,
// con posiciones y tamanos estaticos. Se descarto a proposito: ese doble
// falso siempre devuelve el mismo resultado, asi que cualquier asercion
// futura sobre el posicionamiento entre la barra, el drawer y el contenido
// pasaria siempre, detecte o no una regresion real. Ademas dependia de una
// API interna no publica de Vuetify que puede cambiar sin aviso entre
// versiones.
//
// Por eso aqui se monta un host que envuelve el componente en un <v-app>
// real: ejercita el algoritmo de layout genuino de Vuetify, que es
// exactamente lo que hace la aplicacion en produccion (ver
// src/views/Inicio.vue). El <v-app> no es decorativo.
export function mountWithVuetify(component, options = {}) {
  const vuetify = createVuetify({ components, directives })
  const { global: globalOptions = {}, props, slots, ...rest } = options

  const Host = {
    name: 'VuetifyLayoutHost',
    render: () => h(components.VApp, null, {
      default: () => [h(component, props, slots)],
    }),
  }

  return mount(Host, {
    global: {
      ...globalOptions,
      plugins: [vuetify, i18n, ...(globalOptions.plugins ?? [])],
    },
    ...rest,
  })
}
