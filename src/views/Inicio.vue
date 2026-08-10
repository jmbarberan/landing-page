<template>
  <v-app>
    <navigation
      :color="color"
      :flat="flat"
    />
    <v-main class="pt-0">
      <home />
      <about />
      <download />
      <pricing />
      <contact />
    </v-main>
    <v-scale-transition>
      <v-btn
        v-show="fab"
        icon="mdi-arrow-up"
        class="btn-to-top"
        color="secondary"
        theme="dark"
        @click="toTop"
      />
    </v-scale-transition>
    <foote />
  </v-app>
</template>

<script>
import { useGoTo } from "vuetify";
import navigation from "../components/Navigation.vue";
import foote from "../components/Footer.vue";
import home from "../components/HomeSection.vue";
import about from "../components/AboutSection.vue";
import download from "../components/DownloadSection.vue";
import pricing from "../components/PricingSection.vue";
import contact from "../components/ContactSection.vue";

export default {
  name: "App",

  components: {
    navigation,
    foote,
    home,
    about,
    download,
    pricing,
    contact,
  },

  setup() {
    return { goTo: useGoTo() };
  },

  data: () => ({
    fab: null,
    color: "",
    flat: null,
  }),

  watch: {
    fab(value) {
      if (value) {
        this.color = "secondary";
        this.flat = false;
      } else {
        this.color = "transparent";
        this.flat = true;
      }
    },
  },

  created() {
    const top = window.scrollY || 0;
    if (top <= 60) {
      this.color = "transparent";
      this.flat = true;
    }
  },

  mounted() {
    window.addEventListener("scroll", this.onScroll, { passive: true });
    this.onScroll();
  },

  unmounted() {
    window.removeEventListener("scroll", this.onScroll);
  },

  methods: {
    onScroll() {
      if (typeof window === "undefined") return;
      this.fab = window.scrollY > 60;
    },
    toTop() {
      this.goTo(0);
    },
  },
};
</script>

<style scoped>
.v-main {
  background-image: url("@/assets/img/bgMain.png");
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
}

.btn-to-top {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 5;
}
</style>
