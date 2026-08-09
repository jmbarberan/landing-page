import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('./views/Inicio.vue'),
  },
  {
    path: '/error',
    component: () => import('./views/Error.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('./views/Error.vue'),
  },
]

export default createRouter({
  history: createWebHistory(),
  linkActiveClass: 'active',
  routes,
})
