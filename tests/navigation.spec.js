import { describe, it, expect } from 'vitest'
import Navigation from '@/components/Navigation.vue'
import { mountWithVuetify } from './helpers'

describe('Navigation', () => {
  it('renderiza las etiquetas del menu traducidas', () => {
    const wrapper = mountWithVuetify(Navigation, {
      props: { color: 'transparent', flat: true },
    })

    const texto = wrapper.text()
    expect(texto).toContain('Inicio')
    expect(texto).toContain('Acerca')
    expect(texto).toContain('Planes')
    expect(texto).toContain('Ingresar')
  })

  it('construye las seis entradas del drawer', () => {
    const wrapper = mountWithVuetify(Navigation, {
      props: { color: 'transparent', flat: true },
    })

    expect(wrapper.vm.items).toHaveLength(6)
    expect(wrapper.vm.items[0][2]).toBe('#hero')
  })
})
