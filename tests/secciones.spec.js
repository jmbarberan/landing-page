import { describe, it, expect } from 'vitest'
import AboutSection from '@/components/AboutSection.vue'
import DownloadSection from '@/components/DownloadSection.vue'
import PricingSection from '@/components/PricingSection.vue'
import { mountWithVuetify } from './helpers'

describe.each([
  ['AboutSection', AboutSection],
  ['DownloadSection', DownloadSection],
  ['PricingSection', PricingSection],
])('%s', (nombre, componente) => {
  it('monta sin errores', () => {
    const wrapper = mountWithVuetify(componente)
    expect(wrapper.findComponent(componente).exists()).toBe(true)
  })

  it('no deja rutas de assets con el prefijo ~ de webpack', () => {
    const wrapper = mountWithVuetify(componente)
    expect(wrapper.html()).not.toContain('~@/')
  })
})
