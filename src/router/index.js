import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/index.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('../views/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'organ',
        name: 'Organ',
        component: () => import("../views/organ/index.vue"),
        meta: { title: '机构管理', icon: 'Setting' }
      },
      {
        path: 'scope',
        name: 'Scope',
        component: () => import("@/components/CourierScope.vue"),
        meta: { title: '作业返回', icon: 'Coordinate' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router