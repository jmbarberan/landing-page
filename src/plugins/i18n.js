import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

Vue.use(VueI18n)

const msj = {
  'en': en,
  'es': es
};

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'es',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'es',
  messages: msj
})
