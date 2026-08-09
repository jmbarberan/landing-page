import { describe, it, expect } from 'vitest'
import { defineComponent, inject, h } from 'vue'
import App from '@/App.vue'
import { mountWithVuetify } from './helpers'

describe('App', () => {
  it('monta sin errores', () => {
    const wrapper = mountWithVuetify(App, {
      global: {
        stubs: {
          RouterView: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})

describe('mountWithVuetify', () => {
  it('registra los componentes de Vuetify (renderiza un v-btn real)', () => {
    const ConBoton = defineComponent({
      template: '<v-btn>Click</v-btn>',
    })

    const wrapper = mountWithVuetify(ConBoton)

    expect(wrapper.find('.v-btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('Click')
  })

  it('registra i18n y resuelve claves del locale es', () => {
    const ConTraduccion = defineComponent({
      template: '<div>{{ $t("menu.home") }}</div>',
    })

    const wrapper = mountWithVuetify(ConTraduccion)

    expect(wrapper.text()).toBe('Inicio')
  })

  it('propaga claves arbitrarias de global (por ejemplo provide) al componente montado', () => {
    const ConInject = defineComponent({
      setup() {
        const valor = inject('miClave')
        return () => h('div', valor)
      },
    })

    const wrapper = mountWithVuetify(ConInject, {
      global: {
        provide: {
          miClave: 'valor-inyectado',
        },
      },
    })

    expect(wrapper.text()).toBe('valor-inyectado')
  })
})
