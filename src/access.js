const isDevelopment = process.env.NODE_ENV === 'development';

const findRouterSet = (routes, route) => {
  for (let i = 0; i < routes.length; i++) {
    if (routes[i].path == route) {
      return routes[i]
    }
    if (routes[i].children && routes[i].children.length) {
      let result = findRouterSet(routes[i].children, route);
      if (result) return result;
    }
  }
}
export default (initialState) => {
  // 在这里按照初始化数据定义项目中的权限，统一管理
  // 参考文档 https://next.umijs.org/docs/max/access
  // 默认只处理秩序监管下面的按钮权限
  const g_umi_routes = isDevelopment ? [] : window.top?.g_umi_routes?.filter(v => v.path === '/zxjgpt') ?? []
  return {
    g_umi_routes,
    route_btn_codes: (r) => {
      let returnObj = {};
      if (isDevelopment) return returnObj;
      const route = r || window.top.location.href.split('#')[1]
      const routerSet = findRouterSet(g_umi_routes, route);
      if (routerSet && routerSet.buttonCodes) {
        const buttonCodesArr = routerSet.buttonCodes.split(',')
        buttonCodesArr.forEach(v => {
          returnObj[v] = true
        })
      }
      return returnObj
    }
  }
};
