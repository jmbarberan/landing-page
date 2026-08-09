import { describe, it, expect, vi } from 'vitest'
import Inicio from '@/views/Inicio.vue'
import { mountWithVuetify } from './helpers'

const stubs = {
  navigation: true,
  foote: true,
  home: true,
  about: true,
  download: true,
  pricing: true,
  contact: true,
}

describe('Inicio', () => {
  it('monta y registra el listener de scroll', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const wrapper = mountWithVuetify(Inicio, { global: { stubs } })

    expect(wrapper.findComponent(Inicio).exists()).toBe(true)
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
  })

  it('muestra el boton flotante solo al bajar de 60px', async () => {
    const wrapper = mountWithVuetify(Inicio, { global: { stubs } })
    const vm = wrapper.findComponent(Inicio).vm

    expect(vm.fab).toBe(false)

    window.scrollY = 200
    vm.onScroll()
    await vm.$nextTick()

    expect(vm.fab).toBe(true)
  })

  it('retira el listener al desmontar', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = mountWithVuetify(Inicio, { global: { stubs } })

    wrapper.unmount()

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
