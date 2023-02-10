const menuRoute =
  process.env.NODE_ENV !== 'development'
    ? {
        menuRender: false,
        hideInMenu: true
      }
    : {};

export default routes = [
  {
    name: '登录',
    path: '/user/login',
    component: './user/Login',
    ...menuRoute
  },
  {
    path: '/',
    component: '@/layouts/ProjectLayout',
    flatMenu: 'true',
    routes: [
      {
        path: '/',
        redirect: '/home'
      },
      {
        name: '首页',
        path: '/home',
        component: './Home',
        menuRender: true
        // hideInMenu: true
        // ...menuRoute
      }
    ]
  },
  {
    path: '/demo',
    component: './Demo',
  }
];
