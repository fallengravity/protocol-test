const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Index.vue'),
        name: 'marketplace',
      },
      {
        path: 'Create',
        component: () => import('pages/Create.vue'),
        name: 'Create',
      },
      {
        path: 'Item/:id',
        component: () => import('pages/Item.vue'),
        name: 'Item',
      },
      {
        path: 'User/:id',
        component: () => import('pages/User.vue'),
        name: 'User',
      },
    ],
  },
  {
    path: '*',
    component: () => import('pages/Error404.vue'),
    name: 'Error404',
  },
];

export default routes;
