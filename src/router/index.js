import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/courier/Index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'organ',
        name: 'Organ',
        component: () => import("@/views/organ/index.vue"),
        meta: { title: '机构管理', icon: 'Setting' }
      },
      {
        path: 'courierScope',
        name: 'CourierScope',
        component: () => import("@/views/courier/CourierScope.vue"),
        meta: { title: '快递员作业范围', icon: 'Coordinate' }
      },
      {
        path: 'organScope',
        name: 'OrganScope',
        component: () => import("@/views/organ/OrganScope.vue"),
        meta: { title: '机构作业范围', icon: 'Coordinate' }
      },
      {
        path: 'transportLine',
        name: 'TransportLine',
        component: () => import("@/views/line/index.vue"),
        meta: { title: '转运路线管理', icon: 'Map' }
      },
      {
        path: 'driver',
        name: 'Driver',
        component: () => import("@/views/driver/index.vue"),
        meta: { title: '司机管理', icon: 'Map' }
      },
      {
        path: 'truck',
        name: 'Truck',
        component: () => import("@/views/truck/index.vue"),
        meta: { title: '货车管理', icon: 'Car' }
      }
    ]
  },
  {
    path: "/login",
    component: () => import("@/views/login/login.vue")
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router