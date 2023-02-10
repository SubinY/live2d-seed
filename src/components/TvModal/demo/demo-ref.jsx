import { ProFormText } from '@ant-design/pro-form';
import { message } from 'antd';
import { useRef, useEffect } from 'react';
import TvModal from '../index';

function Demo() {
  const modalRef = useRef();

  const ModalProps = {
    text: '新建',
    // asyncInitialValues: currentRow,
    onFinish: async (values) => {
      console.log(values);
      return await new Promise((resolve) => {
        setTimeout(() => {
          message.success('创建成功');
          resolve(true);
        }, 1000);
      });
    },
  };

  return (
    <div>
      <TvModal ref={modalRef} {...ModalProps} title="新建">
        <ProFormText name="name" label="名称" />
        <ProFormText name="age" label="年龄" />
      </TvModal>
    </div>
  );
}

export default Demo;
