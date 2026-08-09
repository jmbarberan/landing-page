<template>
  <section id="about">
    <v-container fluid>
      <v-row align="center" justify="center">
        <v-col cols="10">
          <v-row align="center" justify="center">
            <v-col cols="12" md="7">
              <h1 class="font-weight-light display-2">Acerca de</h1>
              <h1 class="font-weight-light display-1 mb-3">
                ViniaPro
              </h1>
              <v-row>
                <v-col cols="12" class="d-flex align-center">
                  <v-img
                    src="@/assets/img/icon1.svg"
                    max-width="60px"
                    class="mr-4"
                  />
                  <p class="text-justify">
                    VINIAPRO es un Sistema Administrativo Integrado, adaptable 
                    a gran variedad de negocios (como supermercados, ferreterías, 
                    farmacias, tiendas en línea, etc.), facil aprender y operar.
                  </p>
                </v-col>
                <v-col cols="12" class="d-flex align-center">
                  <v-img
                    src="@/assets/img/icon2.svg"
                    max-width="60px"
                    class="mr-4"
                  />
                  <p class="text-justify">
                    Ayuda a optimizar sus operaciones, a planificar sus finanzas y 
                    automatizar procesos con datos fiables y varios niveles de 
                    seguridad. Disponga de la información de su negocio en tiempo real.
                  </p>
                </v-col>
                <v-col cols="12" class="d-flex align-center">
                  <v-img
                    src="@/assets/img/icon3.svg"
                    max-width="60px"
                    class="mr-4"
                  />
                  <p class="text-justify">
                    VINIAPRO funciona en una amplia gama de dispositivos: computadoras, 
                    tabletas, teléfonos inteligentes; puede operar desde cualquier lugar 
                    por medio de internet. y localmente con sus propios equipos
                  </p>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" md="5" class="d-none d-md-flex">
              <v-img
                src="@/assets/img/ill1.svg"
                class="d-block ml-auto mr-auto"
                max-width="400px"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped>
#about {
  background-color: #f4f7f5;
}
</style>
