import { describe, it, expect, afterEach } from 'vitest'
import AboutSection from '@/components/AboutSection.vue'
import ContactSection from '@/components/ContactSection.vue'
import DownloadSection from '@/components/DownloadSection.vue'
import Footer from '@/components/Footer.vue'
import HomeSection from '@/components/HomeSection.vue'
import Navigation from '@/components/Navigation.vue'
import PricingSection from '@/components/PricingSection.vue'
import Inicio from '@/views/Inicio.vue'
import { mountWithVuetify } from './helpers'

// Props booleanas de Vuetify 2 retiradas en Vuetify 3. Si un componente
// todavia las pasa, Vue 3 no las reconoce como prop del componente y las
// deja caer al DOM como atributo HTML inerte (p.ej. outlined="true"). No
// generan error de consola ni fallo de otros tests: el unico rastro
// observable es el atributo suelto en el elemento renderizado.
//
// La asercion se hace sobre las claves reales de wrapper.attributes() del
// elemento host de cada componente Vuetify (localizado por su clase
// v-btn/v-card/etc.), no con una expresion regular de texto libre. Eso evita
// falsos positivos con nombres de clases CSS que contienen las mismas
// palabras como substring, por ejemplo "v-btn--size-large" (contiene
// "large") o "v-field--variant-outlined" (contiene "outlined"): esas
// palabras viven dentro del valor del atributo class, nunca como nombre de
// atributo propio, asi que buscar en las claves de attributes() nunca las
// captura.
const RETIRED_PROPS_BY_SELECTOR = {
  '.v-btn': ['outlined', 'depressed', 'large', 'small', 'x-large', 'x-small', 'fab', 'dark', 'light', 'text', 'shaped'],
  '.v-card': ['shaped', 'outlined', 'dark', 'light'],
  '.v-img': ['contain'],
  '.v-footer': ['padless', 'dark', 'light'],
  '.v-toolbar': ['dark', 'light'],
  '.v-app-bar': ['dark', 'light'],
  '.v-navigation-drawer': ['dark', 'light'],
  '.v-list': ['dense'],
}

function expectSinPropsRetiradas(wrapper) {
  for (const [selector, retiredProps] of Object.entries(RETIRED_PROPS_BY_SELECTOR)) {
    const elementos = wrapper.findAll(selector)

    for (const elemento of elementos) {
      const atributos = elemento.attributes()

      for (const prop of retiredProps) {
        if (prop in atributos) {
          throw new Error(
            `${selector} tiene la prop retirada "${prop}" cayendo como atributo inerte (${prop}="${atributos[prop]}"). ` +
            `HTML: ${elemento.html().slice(0, 200)}`
          )
        }
      }
    }
  }
}

const stubsInicio = {
  navigation: true,
  foote: true,
  home: true,
  about: true,
  download: true,
  pricing: true,
  contact: true,
}

// Los "ocho componentes" con superficie Vuetify real de la migracion.
// src/views/Error.vue queda fuera a proposito: no usa ni un solo componente
// de Vuetify (solo div/h3/p), asi que no puede padecer este defecto.
const CASOS = [
  ['AboutSection', AboutSection, {}],
  ['ContactSection', ContactSection, {}],
  ['DownloadSection', DownloadSection, {}],
  ['Footer', Footer, {}],
  ['HomeSection', HomeSection, {}],
  ['Navigation', Navigation, { props: { color: 'transparent', flat: true } }],
  ['PricingSection', PricingSection, {}],
  ['Inicio', Inicio, { global: { stubs: stubsInicio } }],
]

describe('Props booleanas retiradas de Vuetify 2', () => {
  let wrapper

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  it.each(CASOS)('%s no deja props retiradas como atributos inertes', (_nombre, componente, opciones) => {
    wrapper = mountWithVuetify(componente, opciones)
    expectSinPropsRetiradas(wrapper)
  })
})
