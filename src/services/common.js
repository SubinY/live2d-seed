import {request} from '@umijs/max';

//获取当前用户
export async function queryCurrentUser(options) {
  return request('/api/system/user/current', {
    method: 'GET',
    ...(options || {}),
  });
}

//登录
export async function login({username, password}) {
  return request('/api/oauth2/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic cG9ydGFsOjEyMzQ1Ng==',
    },
    params: {
      grantType: 'password',
      username: username,
      password: password,
      grant_type: 'password',
    },
  });
}