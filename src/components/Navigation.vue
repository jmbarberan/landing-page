<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      temporary
      theme="dark"
      image="@/assets/img/bgDrawer.jpg"
    >
      <v-list>
        <v-list-item title="Software" subtitle="Ecuador">
          <template #prepend>
            <v-avatar>
              <img src="@/assets/img/logo.png" alt="Logo" />
            </v-avatar>
          </template>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list density="compact">
        <v-list-item
          v-for="([icon, text, link], i) in items"
          :key="i"
          link
          :title="text"
          @click="navegar(link)"
        >
          <template #prepend>
            <v-icon>{{ icon }}</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      :color="color"
      :flat="flat"
      theme="dark"
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
        <v-btn variant="text" @click="goTo('#hero')">
          <span class="mr-2">{{ $t('menu.home') }}</span>
        </v-btn>
        <v-btn variant="text" @click="goTo('#features')">
          <span class="mr-2">{{ $t("menu.acerca") }}</span>
        </v-btn>
        <v-btn variant="text" @click="goTo('#download')">
          <span class="mr-2">{{ $t("menu.demo") }}</span>
        </v-btn>
        <v-btn variant="text" @click="goTo('#pricing')">
          <span class="mr-2">{{ $t("menu.planes") }}</span>
        </v-btn>
        <v-btn variant="text" @click="goTo('#contact')">
          <span class="mr-2">{{ $t("menu.contacto") }}</span>
        </v-btn>
        <v-btn rounded variant="outlined" :href="appurl" target="_blank" color="primary">
          <span class="mr-2">Ingresar</span>
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
import { useGoTo } from "vuetify";

export default {
  setup() {
    return { goTo: useGoTo() };
  },
  data: () => ({
    drawer: null,
    isXs: false,
    items: [],
    appurl: "https://app.viniagent.com"
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
        this.goTo(destino)
      } else {
        window.open(destino, "_blank")
      }
    },
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
