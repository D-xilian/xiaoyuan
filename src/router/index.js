import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue')
  },
  {
    path: '/activity/create',
    name: 'CreateActivity',
    component: () => import('../views/CreateActivity.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetail',
    component: () => import('../views/ActivityDetail.vue')
  },
  {
    path: '/activity/:id/edit',
    name: 'EditActivity',
    component: () => import('../views/EditActivity.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/activity/register',
    name: 'ActivityRegistration',
    component: () => import('../views/ActivityRegistration.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/activity/register/:activityId',
    name: 'ActivityRegistrationWithId',
    component: () => import('../views/ActivityRegistration.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/registration/list',
    name: 'RegistrationList',
    component: () => import('../views/RegistrationList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/registration/:id',
    name: 'RegistrationDetail',
    component: () => import('../views/RegistrationDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-activities',
    name: 'MyActivities',
    component: () => import('../views/MyActivities.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-join',
    name: 'MyJoin',
    component: () => import('../views/MyJoin.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-collection',
    name: 'MyCollection',
    component: () => import('../views/MyCollection.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'NotificationList',
    component: () => import('../views/NotificationList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/volunteer/recruitment',
    name: 'VolunteerRecruitment',
    component: () => import('../views/VolunteerRecruitment.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user')
  
  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else {
    next()
  }
})

export default router