<template>
  <div>   
      <section>
        <v-container fluid>
          <v-card
            outlined
          >
            <v-card-title>
              <div class="contenedor">
                <v-text-field
                v-model="busqueda"
                append-icon="mdi-magnify"
                label="Buscar"
                single-line
                hide-details
                class="buscador"
              ></v-text-field>
              <v-btn
                outlined
                rounded
                text
                class="derecha"
                @click="nuevo()"
              >
                Nuevo
              </v-btn>
              </div>
            </v-card-title>
            <v-data-table
              :headers="encabezados"
              :items="productos"
              :search="busqueda"
              :loading="buscando"
              :loading-text="buscandoTexto"
            >
              <template
                v-slot:progress
              >
                <v-progress-linear
                  color="purple"
                  :height="10"
                  indeterminate
                ></v-progress-linear>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon
                  small
                  class="mr-2"
                  title="Modificar"
                  @click="editarItem(item)"
                >
                  mdi-pencil
                </v-icon>
                <!--v-icon
                  small
                  @click="deleteItem(item)"
                >
                  mdi-delete
                </v-icon-->
              </template>
            </v-data-table>
            <v-card-actions>
              <v-btn
                outlined
                rounded
                text
                @click="nuevo()"
              >
                Nuevo
              </v-btn>
              <v-btn
                outlined
                rounded
                text
                @click="consultar()"
                class="ml-3"
              >
                Consultar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-container>
      </section>
      <foote />
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
  </div>
</template>

<script>
const apiroot = process.env.RUTA_API
import foote from "./components/Footer";
import { getProductos, setProductos } from "./utils/index"
export default {
  components: {
    foote
  },
  data: () => ({
    procesando: false,
    busqueda: "",
    encabezados: [
      { text: 'Codigo', value: 'Codigo', sortable: false },
      { text: 'Nombre', value: 'Nombre' },
      { text: 'U.Medida', value: 'Medida', sortable: false },
      { text: 'Grupo', value: 'Descripcion' },
      { text: 'Costo', value: 'UltimoCosto', sortable: false, align: 'right' },
      { text: 'Existencias', value: 'Exitencia', align: 'right' },
      { text: 'Acciones', value: 'actions', sortable: false },
    ],
    productos: [],
    buscando: false,
    buscandoTexto: "Espere mientras se cargan los datos",
    snackbar: {
      enabled: false,
      text: '',
      color: ''
    },
  }),
  methods: {
    editarItem(item) {
      this.$router.push({
        name: "producto-editar",
        params: {
          id: 1,
          prd: item
        }
      })
    },
    nuevo() {
      this.$router.push({
        name: "producto-editar",
        params: {
          id: 0,
          prd: {}
        }
      })
    },
    consultar() {
      this.buscando = true;
      this.listarProductos().then(response => response.json())
      .then(datos => {
        this.productos = datos
        setProductos(datos).then(() => {
          this.buscando = false
          this.mostrarAlerta("Lista actualizada")
        })        
      }).catch(error => {
        this.buscando = false
        this.mostrarAlerta("No se pudo actualizar la lista")
        console.error(error)
      })
    },
    async listarProductos() {
      let emp = 2
      let est = 0
      const response = await fetch(apiroot + `/inventarios/productos/empresa/${emp}/estado/${est}/listar`, {
        method: "GET"
      })
      return response
    },
    mostrarAlerta(texto) {
      this.snackbar.text = texto
      this.snackbar.enabled = true
    }
  },
  mounted() {
    this.buscando = true;
    getProductos().then(datos => {      
      if (datos != null && JSON.parse(datos).length > 0) {
        this.productos = JSON.parse(datos)
      } else {
        this.consultar();
      }
    })
  },
}
</script>

<style>
.contenedor {
  display: flex;
  align-content: stretch;
}
.buscador {
  flex-grow: 1;
}
.derecha {
  flex-grow: 0;
  margin-left: 3px;
}
</style>