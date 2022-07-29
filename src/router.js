import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: () => import(/* webpackChunkName: "home" */ "./views/Inicio.vue"),
  },
  {
    path: "/error",
    component: () => import(/* webpackChunkName: "error" */ "./views/Error")
  },
  //{
  //  name: "productos-lista",
  //  path: "/productos",
  //  component: () => import(/* webpackChunkName: "prdLista" */ "./ProductosLista.vue")
  //},
  //{
  //  name: "producto-editar",
  //  path: "/productos/editor",
  //  component: () => import(/* webpackChunkName: "prdEditor" */ "./Productos.vue")
  //},
  {
    path: "*",
    component: () => import(/* webpackChunkName: "error" */ "./views/Error")
  }
];

const router = new VueRouter({
  linkActiveClass: "active",
  routes,
  mode: "history",
});
//router.beforeEach(AuthGuard);
export default router;
