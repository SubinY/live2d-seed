export const REQ_RESEND_COUNT_EXCEED_MSG = '重发次数超出上限';
export const REQ_OVERTIME_DURATION = 8 * 1000; // 8s超时

export const REQ_STATUS_403 = 403; // 权限不足
export const REQ_STATUS_504 = 504; // 网关异常

export const RES_PERMISSION_DENIED_CODE = 80001; // 权限不足
export const RES_LOGOUT_CODE = 60015; // 登录过期
export const RES_UNAUTHORIZED_CODE = 40006; // TOKEN失效
export const RES_SUCCESS_DEFAULT_CODE = 2000; // 处理成功

export const ERROR_SITUATION = [
  {
    status: REQ_STATUS_403,
    errorCode: RES_PERMISSION_DENIED_CODE,
    message: '当前账号没有该操作权限',
    showType: 'message',
  },
  {
    status: REQ_STATUS_403,
    errorCode: RES_UNAUTHORIZED_CODE,
    modal: {
      title: '登录已过期',
      message: '登录已过期，请重新登录',
      okText: '重新登录'
    },
    showType: 'modal',
  },
  {
    status: REQ_STATUS_403,
    errorCode: RES_LOGOUT_CODE,
    modal: {
      title: '登录已过期',
      message: '登录已过期，请重新登录',
      okText: '重新登录'
    },
    showType: 'modal',
  }
];

// 禁止跳出登出弹窗的白名单
export const WHITE_API_NO_CATCH_LIST = []