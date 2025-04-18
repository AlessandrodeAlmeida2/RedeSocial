import { createRouter, createWebHistory, type NavigationGuardNext } from 'vue-router'
import HomeView from '../views/HomeView.vue'
//@ts-ignore
import LoginView from '@/views/LoginView.vue'
//@ts-ignore
import { supabase } from '../supabase';
import FooterView from '@/components/FooterView.vue';

let localUser;

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      alias: '/home',
      meta: { requiresAuth: true }
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('../components/CadastroView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: LoginView
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../components/UserView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/event',
      name: 'event',
      component: () => import('@/components/EventView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/moderacao',
      name: 'moderacao',
      component: () => import('@/components/ModeracaoEventos.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/aluno',
      name: 'aluno',
      component: () => import('@/components/AlunosView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/aluno/:id',
      name: 'aluno-perfil',
      component: () => import('@/views/AlunoPerfilView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/grupos',
      name: 'grupos',
      component: () => import('@/components/GruposView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chat/:groupId/chat',
      name: 'chat',
      component: () => import('@/components/GroupChat.vue'),
      props: true
    },
    {
      path: '/footer',
      name: 'footer',
      component: FooterView
    },
  ]
})

//getUser
async function getUser(next: NavigationGuardNext) {
  localUser = await supabase.auth.getSession();

  if (localUser.data.session == null) {
    next('/login');
  } else {
    next();
  }
}

//auth requirements
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    getUser(next);
  } else {
    next();
  }
})

export default router
