import { describe, it, expect, afterEach } from 'vitest'
import ContactSection from '@/components/ContactSection.vue'
import Footer from '@/components/Footer.vue'
import ErrorView from '@/views/Error.vue'
import { mountWithVuetify } from './helpers'

describe('ContactSection', () => {
  let activeWrapper

  afterEach(() => {
    // El v-snackbar teletransporta a document.body; desmontamos para no
    // dejar nodos huerfanos entre tests.
    if (activeWrapper) {
      activeWrapper.unmount()
      activeWrapper = undefined
    }
  })

  it('renderiza los campos del formulario', () => {
    const wrapper = mountWithVuetify(ContactSection)

    expect(wrapper.findAll('input').length).toBeGreaterThan(0)
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('no deja rutas de assets con el prefijo ~ de webpack', () => {
    const wrapper = mountWithVuetify(ContactSection)
    expect(wrapper.html()).not.toContain('~@/')
  })

  it('el boton de enviar no deja la prop dark retirada como atributo inerte', () => {
    const wrapper = mountWithVuetify(ContactSection)
    const html = wrapper.html()
    // dark ya no es prop de v-btn en Vuetify 3: si el componente sigue
    // pasandola, Vue 3 la deja caer al DOM como atributo inerte dark="true".
    expect(html).not.toMatch(/<button[^>]* dark="/)
  })

  it('el boton de cerrar del snackbar vive en el slot actions (v-slot:action ya no existe en Vuetify 3)', async () => {
    const wrapper = mountWithVuetify(ContactSection)
    activeWrapper = wrapper
    await wrapper.findComponent(ContactSection).vm.submit()
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 50))
    const bodyHtml = document.body.innerHTML
    // Si el slot correcto (#actions) no se usa, el boton "Cerrar" no aparece
    // en absoluto dentro del snackbar renderizado.
    expect(bodyHtml).toContain('Cerrar')
  })
})

describe('Footer', () => {
  it('renderiza los enlaces sociales', () => {
    const wrapper = mountWithVuetify(Footer)
    expect(wrapper.html()).toContain('youtube.com')
  })

  it('v-footer no deja la prop padless retirada como atributo inerte', () => {
    const wrapper = mountWithVuetify(Footer)
    const html = wrapper.html()
    expect(html).not.toContain(' padless=""')
  })

  it('v-footer no deja la prop dark retirada como atributo inerte', () => {
    const wrapper = mountWithVuetify(Footer)
    const html = wrapper.html()
    expect(html).not.toMatch(/<footer[^>]* dark="/)
  })
})

describe('Error', () => {
  it('monta sin errores', () => {
    const wrapper = mountWithVuetify(ErrorView)
    expect(wrapper.findComponent(ErrorView).exists()).toBe(true)
  })
})
