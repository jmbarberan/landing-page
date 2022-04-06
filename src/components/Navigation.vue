<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      app
      temporary
      dark
      src="@/assets/img/bgDrawer.jpg"
    >
      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <img src="@/assets/img/logo.png" alt="Logo" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="title">Software</v-list-item-title>
            <v-list-item-subtitle>Ecuador</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list dense>
        <v-list-item
          v-for="([icon, text, link], i) in items"
          :key="i"
          link
          @click="navegar(link)"
        >
          <v-list-item-icon class="justify-center">
            <v-icon>{{ icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="subtitile-1">{{
              text
            }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      :color="color"
      :flat="flat"
      dark
      class="px-15"
      :class="{ expand: flat }"
    >
      <v-toolbar-title>
        <v-img src="@/assets/img/logo.png" max-width="50px" />
      </v-toolbar-title>
      <v-spacer />
      <v-app-bar-nav-icon
        @click.stop="drawer = !drawer"
        class="mr-4"
        v-if="isXs"
      />
      <div v-else>
        <v-btn text @click="$vuetify.goTo('#hero')">
          <span class="mr-2">{{ $t('menu.home') }}</span>
        </v-btn>
        <v-btn text @click="$vuetify.goTo('#features')">
          <span class="mr-2">{{ $t("menu.acerca") }}</span>
        </v-btn>
        <v-btn text @click="$vuetify.goTo('#download')">
          <span class="mr-2">{{ $t("menu.demo") }}</span>
        </v-btn>
        <v-btn text @click="$vuetify.goTo('#pricing')">
          <span class="mr-2">{{ $t("menu.planes") }}</span>
        </v-btn>
        <v-btn text @click="$vuetify.goTo('#contact')">
          <span class="mr-2">{{ $t("menu.contacto") }}</span>
        </v-btn>
        <!--v-btn rounded outlined text :href="appurl" target="_blank" color="primary">
          <span class="mr-2">Acceder</span>
        </v-btn-->
        <v-btn rounded outlined text @click="irProductos()" color="primary">
          <span class="mr-2">Acceder</span>
        </v-btn>
      </div>
    </v-app-bar>
  </div>
</template>

<style scoped>
.v-toolbar {
  transition: 0.6s;
}

.expand {
  height: 80px !important;
  padding-top: 10px;
}
</style>

<script>
export default {
  data: () => ({
    drawer: null,
    isXs: false,
    items: [],
    appurl: "https://viniapro.com/productos"
  }),
  props: {
    color: String,
    flat: Boolean,
  },
  methods: {
    onResize() {
      this.isXs = window.innerWidth < 850;
    },
    navegar(destino) {
      if (destino.startsWith("#")) {
        this.$vuetify.goTo(destino)
      } else {
        window.open(destino, "_blank")
      }
    },
    irProductos() {
      this.$router.push({ name: "productos-lista" })
    }
  },

  watch: {
    isXs(value) {
      if (!value) {
        if (this.drawer) {
          this.drawer = false;
        }
      }
    },
  },
  created() {
    this.items = [
      ["mdi-home-outline", this.$t("menu.home"), "#hero"],
      ["mdi-information-outline", this.$t("menu.acerca"), "#features"],
      ["mdi-download-box-outline", this.$t("menu.demo"), "#download"],
      ["mdi-currency-usd", this.$t("menu.planes"), "#pricing"],
      ["mdi-email-outline", this.$t("menu.contacto"), "#contact"],
      ["mdi-key", "Acceder", this.appurl],
    ]
  },
  mounted() {
    this.onResize();
    window.addEventListener("resize", this.onResize, { passive: true });
  },
};
</script>
