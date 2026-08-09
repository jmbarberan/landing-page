import { describe, it, expect } from 'vitest'
import HomeSection from '@/components/HomeSection.vue'
import { mountWithVuetify } from './helpers'

describe('HomeSection', () => {
  it('renderiza las tres tarjetas de caracteristicas', () => {
    const wrapper = mountWithVuetify(HomeSection)
    const texto = wrapper.text()

    expect(texto).toContain('Diseño Minimalista')
    expect(texto).toContain('Datos Seguros')
    expect(texto).toContain('Multiples dispositivos')
  })

  it('resuelve las imagenes de los iconos a rutas de assets, no a require', () => {
    const wrapper = mountWithVuetify(HomeSection)

    for (const feature of wrapper.findComponent(HomeSection).vm.features) {
      expect(typeof feature.img).toBe('string')
      expect(feature.img.length).toBeGreaterThan(0)
    }
  })

  it('no carga el iframe del video mientras el modal esta cerrado', async () => {
    const wrapper = mountWithVuetify(HomeSection)
    const vm = wrapper.findComponent(HomeSection).vm

    expect(wrapper.find('iframe').exists()).toBe(false)

    vm.dialog = true
    await vm.$nextTick()

    expect(wrapper.find('iframe').exists()).toBe(true)
  })
})
