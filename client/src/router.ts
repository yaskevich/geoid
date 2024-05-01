import { createRouter, createWebHistory, RouteRecordRaw, RouterScrollBehavior } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    // component: Home,
    component: () => import('./components/Home.vue'),
  },
  {
    path: '/places',
    name: 'Places',
    // component: Home,
    component: () => import('./components/Places.vue'),
  },
  {
    path: '/place/:id?',
    name: 'Place',
    // component: User,
    component: () => import('./components/Place.vue'),
  },
  {
    path: '/users',
    name: 'Users',
    // component: Users,
    component: () => import('./components/Users.vue'),
  },
  {
    path: '/user/:id?',
    name: 'User',
    // component: User,
    component: () => import('./components/User.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
