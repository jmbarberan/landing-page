module.exports = {
  transpileDependencies: [
    'vuetify'
  ],

  chainWebpack: config => {
    config
        .plugin('html')
        .tap(args => {
            args[0].title = "ViniaPro";
            return args;
        })
  },

  pluginOptions: {
    i18n: {
      locale: 'es',
      fallbackLocale: 'es'
    }
  }
}
