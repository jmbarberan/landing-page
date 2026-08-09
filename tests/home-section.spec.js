import { describe, it, expect, afterEach } from 'vitest'
import HomeSection from '@/components/HomeSection.vue'
import { mountWithVuetify } from './helpers'

describe('HomeSection', () => {
  let wrapper

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  it('renderiza las tres tarjetas de caracteristicas', () => {
    wrapper = mountWithVuetify(HomeSection)
    const texto = wrapper.text()

    expect(texto).toContain('Diseño Minimalista')
    expect(texto).toContain('Datos Seguros')
    expect(texto).toContain('Multiples dispositivos')
  })

  it('resuelve las imagenes de los iconos a rutas de assets, no a require', () => {
    wrapper = mountWithVuetify(HomeSection)

    for (const feature of wrapper.findComponent(HomeSection).vm.features) {
      expect(typeof feature.img).toBe('string')
      expect(feature.img.length).toBeGreaterThan(0)
    }
  })

  it('no carga el iframe del video mientras el modal esta cerrado', async () => {
    wrapper = mountWithVuetify(HomeSection)
    const vm = wrapper.findComponent(HomeSection).vm

    // El v-dialog hace Teleport del contenido a document.body (comportamiento
    // real de produccion, sin la prop `attach`). Por eso la busqueda del
    // iframe se hace contra document.body y no contra wrapper.html().
    expect(document.body.querySelector('iframe')).toBeNull()

    vm.dialog = true
    await vm.$nextTick()

    expect(document.body.querySelector('iframe')).not.toBeNull()
  })
})
