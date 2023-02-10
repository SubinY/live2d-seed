import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import md5 from 'md5';
import { login, queryCurrentUser } from '@/services/common';
import { history, useModel } from '@umijs/max';
import { RES_SUCCESS_DEFAULT_CODE } from '@/constants/requestCode';

export default () => {
  const { setInitialState } = useModel('@@initialState');

  const loginForm = async ({ username, password }) => {
    const { code, data } = await login({ username, password: md5(password) });
    if (code === RES_SUCCESS_DEFAULT_CODE) {
      const { access_token, cas_jwt, username, name } = data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('cas_jwt', cas_jwt);
      localStorage.setItem('username', username);
      localStorage.setItem('name', name);
      const result = await queryCurrentUser();
      localStorage.setItem('currentUser', JSON.stringify(result.data));
      setInitialState({ ...result.data, orgInfo: res.data });
      history.push('/home');
    }
  };
  return (
    <LoginForm title='登录' subTitle='登录测试' onFinish={loginForm}>
      <ProFormText
        name='username'
        fieldProps={{
          size: 'large',
          prefix: <UserOutlined className={'prefixIcon'} />
        }}
        placeholder={'用户名'}
        rules={[
          {
            required: true,
            message: '请输入用户名!'
          }
        ]}
      />
      <ProFormText.Password
        name='password'
        fieldProps={{
          size: 'large',
          prefix: <LockOutlined className={'prefixIcon'} />
        }}
        placeholder={'密码'}
        rules={[
          {
            required: true,
            message: '请输入密码！'
          }
        ]}
      />
    </LoginForm>
  );
};
