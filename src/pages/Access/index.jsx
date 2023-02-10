import { PageContainer } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { Button } from 'antd';
import { Outlet } from 'umi'
const AccessPage = () => {
  const accessBtnCode = useAccess().route_btn_codes();
  return (
    <PageContainer
      ghost
      header={{
        title: '权限示例',
      }}
    >
      <Access accessible={accessBtnCode['xxxxxxx'] || false}>
        <Button>只有 Admin 可以看到这个按钮</Button>
      </Access>
      <Outlet />
    </PageContainer>
  );
};

export default AccessPage;
