<template>
  <div>
    <section class="pb-8" id="contact">
      <v-container fluid>
        <v-card
          class="mx-auto"
          outlined
          :loading="procesando"
        >
          <template slot="progress">
            <div class="esquinero">
              <span>Guardando</span>
              <v-progress-circular
                indeterminate
                color="primary"
                class="mlft3"
              ></v-progress-circular>
            </div>            
          </template>
          <v-card-title>
            <span>Productos</span>
          </v-card-title>
          <v-card-text>          
            <v-row align="center" justify="center">
              <v-col cols="12">
                <v-row justify="center">
                  <v-col cols="12" sm="12">
                    <v-form ref="form" v-model="valid" :lazy-validation="lazy">
                      <v-container>
                        <v-row>
                          <v-col class="col-xs-12" sm="12" md="3" lg="3">
                            <v-text-field
                                class="entrada"
                                v-model="producto.Codigo"
                                label="Codigo"
                                :readonly="procesando"
                            ></v-text-field>
                          </v-col>
                          <v-col class="col-xs-12" sm="12" md="5" lg="5">
                            <v-text-field 
                                class="entrada"
                                v-model="producto.Nombre"
                                label="Nombre"
                                :rules="nameRules"
                                required
                                :readonly="procesando"
                            ></v-text-field>
                          </v-col>
                          <v-col class="col-xs-12" sm="12" md="4" lg="4">
                            <v-text-field
                                class="entrada"
                                v-model="producto.Medida"
                                label="U. medida"
                                :readonly="procesando"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col class="col-xs-12" sm="12" md="3" lg="3">
                            <v-text-field
                                class="entrada"
                                v-model="producto.Descripcion"
                                label="Categoria"
                                :readonly="procesando"
                            ></v-text-field>
                          </v-col>
                          <v-col class="col-xs-12" sm="12" md="3" lg="3">
                            <v-text-field
                                type="number"
                                class="entrada"
                                v-model="producto.Precio"
                                label="Precio 1"
                                :readonly="procesando"
                            ></v-text-field>
                          </v-col>
                          <v-col class="col-xs-12" sm="12" md="3" lg="3">
                            <v-text-field
                                type="number"
                                class="entrada"
                                v-model="producto.Precio2"
                                label="Precio 2"
                                :readonly="procesando"
                            ></v-text-field>
                          </v-col>
                          <v-col class="col-xs-12" sm="12" md="3" lg="3">
                            <v-checkbox
                              class="entrada"
                              v-model="producto.Iva"
                              label="Grabado con iva"
                              :readonly="procesando"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-container>
                      
                      <div class="centrado"> 
                        <v-btn
                          :disabled="!valid"
                          color="primary"
                          :dark="valid"
                          rounded
                          class="boton mt-3 mb-3 mr-3"
                          @click="guardar"
                        >Guardar</v-btn>
                      </div>
                    </v-form>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
      <div class="svg-border-waves text-white">
        <v-img src="~@/assets/img/borderWavesBlue.svg"/>
      </div>
      <v-snackbar
        v-model="snackbar.enabled"
        timeout="3000"
        right
        top
        :color="snackbar.color"
      >
        {{ snackbar.text }}
        <template v-slot:action="{ attrs }">
          <div class="mrgt3">
            <v-btn
              icon
              v-bind="attrs"
              @click="snackbar.enabled = false"
            >
              <v-icon
                center
              >mdi-close</v-icon>
            </v-btn>
          </div>
        </template>
      </v-snackbar>
    </section>
    <foote />
  </div>
</template>
<script>
const apiroot = "https://iceq-api.pointerp.pw/api/v4"
import foote from "./components/Footer";
export default {
  components: {
    foote
  },
  data: () => ({
    procesando: false,
    valid: true,
    nameRules: [
      (v) => !!v || "Este campo es necesario",
      (v) => (v && v.length >= 6) || "El nombre debe tener mas de 6 caracteres",
    ],
    reqRules: [
      (v) => !!v || "Este campo es necesario"
    ],
    lazy: false,
    snackbar: {
      enabled: false,
      text: '',
      color: ''
    },
    producto: {
      Id: 0,
      Codigo: "",
      Nombre: "",
      Barcode: "",
      Grupo: 0,
      Descripcion: "",
      Medida: "",
      Tipo: 1,
      UltimoCosto: 0,
      EmpresaId: 2,
      Exitencia: 0,
      Adicional: 0,
      EmbalajeTipo: 0,
      EmbalejeCantidad: 0,
      EmbalajeUnidad: 1,
      EmbalajeVolumen: "",
      EspecieId: 0,
      Marca: 0,
      Precio: 0,
      PrecioOrigen: 0,
      Estado: 0,
      relPrecios: [],
      relImposiciones: [],
      Iva: true,
      Precio2: 0,
    },
  }),

  created() {
    /*const top = window.pageYOffset || 0;
    if (top <= 60) {
      this.color = "transparent";
      this.flat = true;
    }*/
  },

  /*watch: {
    fab(value) {
      if (value) {
        this.color = "secondary";
        this.flat = false;
      } else {
        this.color = "transparent";
        this.flat = true;
      }
    },
  },*/

  methods: {
    submit () {
      this.procesando = true
      this.toTop()
      this.traerRolesJSON().then(roles => {
        console.table(roles)
        this.mostrarAlerta("Guardado exitosamente")
        this.reiniciar()
        this.procesando = false
      }).catch(error => {
        console.log("Error al consultar")
        console.log(error.message)
        this.mostrarAlerta("No se pudo consultar")
        this.procesando = false
      })
    },
    reiniciar () {
      this.producto = {
        Id: 0,
        Codigo: "",
        Nombre: "",
        Barcode: "",
        Grupo: 0,
        Descripcion: "",
        Medida: "",
        Tipo: 1,
        UltimoCosto: 0,
        EmpresaId: 2,
        Exitencia: 0,
        Adicional: 0,
        EmbalajeTipo: 0,
        EmbalejeCantidad: 0,
        EmbalajeUnidad: 1,
        EmbalajeVolumen: 0,
        EspecieId: 0,
        Marca: 0,
        Precio: 0,
        PrecioOrigen: 0,
        Estado: 0,
        relPrecios: [],
        relImposiciones: [],
        Iva: true,
        Precio2: 0
      }
    },
    guardar () {
      this.toTop()
      this.procesando = true
      let precios = []
      if (this.producto.Precio != undefined) {
        const precio = {
          ProductoId: 0,
          Precio: this.producto.Precio,
          MinimoCondicion: 1,
          VolumenCondicion: 1
        }
        precios.push(precio)
      }
      if (this.producto.Precio2 != undefined) {
        const precio2 = {
          ProductoId: 0,
          Precio: this.producto.Precio2,
          MinimoCondicion: 1,
          VolumenCondicion: 1
        }
        precios.push(precio2)
      }
      this.producto.relPrecios = precios;
      if (this.producto.Iva) {
        const ivai = {
          ProductoId: 0,
          ImpuestoId: 1
        }
        this.producto.relImposiciones = [
          ivai
        ]
      }

      this.guardarProducto(this.producto).then(resp => {
        if (resp.ok) {
          this.mostrarAlerta("Producto guardado exitosamente")
          this.reiniciar()
          this.procesando = false
        } else {
          console.log("Error al guardar")
          console.log(resp.text())
          this.mostrarAlerta("No se pudo guardar")
          this.procesando = false
        }      
      }).catch(error => {
        console.log("Error al guardar")
        console.log(error.message)
        this.mostrarAlerta("Error al guardar")
        this.procesando = false
      })
    },
    toTop() {
      this.$vuetify.goTo(0);
    },
    async traerRolesJSON() {
      const response = await fetch(apiroot + '/seguridad/roles');
      if (response.ok) {
        return await response.json()
      } else {
        console.log("Error proceso no ejecutado")
        console.log(response.text())
        return [];
      }
    },
    async guardarProducto(p) {
      const response = await fetch(apiroot + "/inventarios/productos/guardar", {
        method: "POST",
        body: JSON.stringify(p),
        headers: {
          "Content-Type": "application/json"
        }
      })
      return response
    },
    mostrarAlerta(texto) {
      this.snackbar.text = texto
      //this.snackbar.color = "green"
      this.snackbar.enabled = true
    }
  },
};
</script>

<style>
  body {
    font-family: sans-serif;
  }

  .esquinero {
    margin-left: 4px;
    margin-top: 4px;
  }

  .mlft3 {
    margin-left: 4px;
  }

  .mrgt3 {
    margin-right: 5px;
  }

  .col {
    flex-basis: auto !important;
  }

  .centrado {
    display: flex;
    justify-content: center;
  }

  .boton {
    margin-left: auto;
    margin-right: auto;
  }

  .entrada {
    font-family: sans-serif;
  }

  .entrada label {
    font-family: sans-serif;
    font-size: small;
    overflow: visible;
  }

  .entrada label:active {
    overflow: visible;
  }

  #contact {
    width: 100%;
    background-color: #f4f7f5;
  }
</style>