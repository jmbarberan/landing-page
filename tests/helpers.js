import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import i18n from '@/plugins/i18n'

export function mountWithVuetify(component, options = {}) {
  const vuetify = createVuetify({ components, directives })
  const { global: globalOptions = {}, ...rest } = options

  return mount(component, {
    global: {
      plugins: [vuetify, i18n, ...(globalOptions.plugins ?? [])],
      stubs: globalOptions.stubs,
      mocks: globalOptions.mocks,
    },
    ...rest,
  })
}
