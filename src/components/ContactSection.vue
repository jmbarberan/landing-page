<template>
  <section
    id="contact"
    class="pb-8"
  >
    <v-container fluid>
      <v-row
        align="center"
        justify="center"
      >
        <v-col cols="10">
          <v-row justify="center">
            <v-col
              cols="12"
              sm="5"
            >
              <h1 class="font-weight-light display-1">
                Contactenos
              </h1>
              <h3 class="font-weight-light mt-3">
                En VINIAPRO queremos saber de ti. Escribenos un mensaje
                resolveremos cualquier inquietud sobre nuestro servicio
                nos podremos en contacto contigo pronto.
              </h3>
              <h3 class="font-weight-light mt-3">
                Puedes contactarnos tambien por estos canales.
              </h3>
              <a
                class="font-weight-light mt-3"
                href="https://wa.me/593989036143"
              >
                <h3>Teléfono: +593 98 903-6143</h3>
              </a>
              <a
                class="font-weight-light"
                href="mailto:gerencia@novainsersa.ec"
              >
                <h3>Email: sales@viniagent.com</h3>
              </a>
            </v-col>
            <v-col
              cols="12"
              sm="7"
            >
              <v-form
                ref="form"
                v-model="valid"
              >
                <v-text-field
                  v-model="name"
                  :rules="nameRules"
                  label="Nombre"
                  required
                />

                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="E-mail"
                  required
                />

                <v-textarea
                  v-model="textArea"
                  :rules="textAreaRules"
                  label="Mensaje"
                  required
                />

                <v-btn
                  :disabled="!valid"
                  color="primary"
                  rounded
                  block
                  class="mt-3"
                  @click="submit"
                >
                  Enviar
                </v-btn>
              </v-form>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <div class="svg-border-waves text-white">
      <v-img src="@/assets/img/borderWavesBlue.svg" />
    </div>
    <v-snackbar
      v-model="snackbar.enabled"
      timeout="3000"
      location="top right"
      :color="snackbar.color"
    >
      {{ snackbar.text }}

      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.enabled = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </section>
</template>

<script>
// import {db} from '@/main'

export default {
  data: () => ({
    icons: ["fa-facebook", "fa-twitter", "fa-linkedin", "fa-instagram"],
    valid: true,
    name: "",
    nameRules: [
      (v) => !!v || "Este campo es necesario",
      (v) => (v && v.length >= 6) || "El nombre debe tener mas de 6 caracteres",
    ],
    email: "",
    emailRules: [
      (v) => !!v || "Este campo es necesario",
      (v) => /.+@.+\..+/.test(v) || "El correo electronico debe ser válido",
    ],
    textArea: "",
    textAreaRules: [
      (v) => !!v || "Este campo es necesario",
      (v) => (v && v.length >= 10) || "Mínimo de 10 caracteres",
    ],
    snackbar: {
      enabled: false,
      text: '',
      color: ''
    }
  }),
  methods: {
    submit() {
      /*db.collection("contactData").add({
        name: this.name,
        email: this.email,
        message: this.textArea
      }).then(() => {
        this.snackbar.text = "Mensagem enviada com sucesso"
        this.snackbar.color = "success"
        this.snackbar.enabled = true
      }).catch(() => {
        this.snackbar.text = "Erro ao enviar mensagem"
        this.snackbar.color = "danger"
        this.snackbar.enabled = true
      })*/
      this.snackbar.text = "Mensaje enviado con exito"
      this.snackbar.color = "success"
      this.snackbar.enabled = true
      this.name = ""
      this.email = ""
      this.textArea = ""
    }
  }
};
</script>

<style scoped>
#contact {
  background-color: #f4f7f5;
}

/* Vuetify 3 renombro .v-image a .v-img */
.svg-border-waves .v-img {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3rem;
  width: 100%;
  overflow: hidden;
}

</style>
