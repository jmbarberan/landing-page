import { describe, it, expect } from 'vitest'
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
