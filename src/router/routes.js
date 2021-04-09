const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'Create', component: () => import('pages/Create.vue') },
      { path: 'Item/:id', component: () => import('pages/Item.vue'), name: 'Item' },
      { path: 'User/:id', component: () => import('pages/User.vue'), name: 'User' },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
