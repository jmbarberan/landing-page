<template>
  <v-footer
    theme="dark"
    class="pa-0"
  >
    <v-card
      flat
      tile
      class="secondary white--text text-center"
    >
      <v-card-text>
        <v-btn
          v-for="(icon, i) in icons"
          :key="i"
          class="mx-4 white--text"
          :href="icon.link"
          target="_blank"
          icon
        >
          <v-icon size="24px">
            {{ icon.text }}
          </v-icon>
        </v-btn>
      </v-card-text>

      <v-card-text class="white--text pt-0">
        Siga nuestras cuentas en las redes sociales para tutoriales, tips, y mucho mas.
      </v-card-text>

      <v-divider />

      <v-card-text class="white--text">
        {{ new Date().getFullYear() }} — <strong>Software Ecuador</strong>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
export default {
  name: "AppFooter",
  data: () => ({
    icons: [
      {
        text: "mdi-facebook",
        link: "https://www.facebook.com/viniapro",
      },
      {
        text: "mdi-twitter",
        link: "https://twitter.com/MartinBarberan1",
      },
      {
        text: "mdi-youtube",
        link: "https://www.youtube.com/channel/UC53mj3FYRO49GuvN1qfF87Q",
      },
      {
        text: "mdi-instagram",
        link: "https://www.instagram.com/martinbarberan/",
      },
    ],
  }),
};
</script>

<style scoped>
.v-card {
  width: 100%;
}
</style>
