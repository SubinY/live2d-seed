import { ProFormText } from '@ant-design/pro-form';
import { Button, message } from 'antd';
import { useModal } from '../index';

function Demo() {
  const { TvModal, modal, modalRef } = useModal();

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          modal.show();
        }}
      >
        modal.show()
      </Button>
      <TvModal
        ref={modalRef}
        title="useModal"
        trigger={undefined}
        onFinish={async (values) => {
          console.log(values);
          return await new Promise((resolve) => {
            setTimeout(() => {
              message.success('创建成功');
              resolve(true);
            }, 1000);
          });
        }}
      >
        <ProFormText name="name" label="名称" />
        <ProFormText name="age" label="年龄" />
      </TvModal>
    </div>
  );
}

export default Demo;
