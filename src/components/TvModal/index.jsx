import { ModalForm } from '@ant-design/pro-form';
import { Button } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const TvModal = forwardRef(
  (
    {
      type = 'primary', // 按钮类型
      text,
      children = '',
      layout = 'horizontal',
      width = 480,
      initialValues,
      asyncInitialValues, // 根据最新的 asyncInitialValues 实时更新 form 的数据
      cancelText = '取消',
      confirmText = '确认',
      onFinish = () => Promise.resolve(false),
      onClose = () => {},
      ...restProps
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const formRef = useRef();

    useImperativeHandle(ref, () => {
      return {
        formRef: formRef.current,
        setVisible,
        visible
      };
    });

    useEffect(() => {
      if (asyncInitialValues) {
        formRef.current?.setFieldsValue(asyncInitialValues);
      }
    }, [asyncInitialValues]);

    const open = () => {
      formRef.current?.resetFields(); // 保证每次都能清空
      setVisible(true);
    };

    const trigger =
      text && typeof text === 'string' ? (
        <Button type={type} ghost onClick={open}>
          {text}
        </Button>
      ) : (
        <div style={{ display: 'inline-block', cursor: 'pointer' }} onClick={open}>
          {text}
        </div>
      );

    // eslint-disable-next-line no-param-reassign
    restProps.modalProps = {
      ...restProps.modalProps,
      destroyOnClose: !asyncInitialValues,
      maskClosable: false,
      onCancel: () => {
        setVisible(false);
        formRef.current?.resetFields();
        onClose();
      },
      afterClose: () => {
        setVisible(false);
        formRef.current?.resetFields();
        onClose();
      },
    };

    const modalFormProps = {
      formRef,
      visible,
      layout,
      width,
      labelCol: { span: 6 },
      trigger,
      submitter: {
        render: () => [
          <Button
            key="close"
            onClick={() => {
              setVisible(false);
              onClose();
              formRef.current?.resetFields();
            }}
          >
            {cancelText}
          </Button>,
          confirmText ? (
            <Button
              key="save"
              type="primary"
              onClick={async () => {
                formRef.current?.submit();
              }}
              loading={loading}
            >
              {confirmText}
            </Button>
          ) : (
            ''
          ),
        ],
      },
      onFinish: async () => {
        const values = await formRef.current?.validateFields();
        setLoading(true);
        try {
          const canClose = await onFinish(values);
          // 操作成功才会清除
          if (canClose) {
            formRef.current?.resetFields();
            setVisible(false);
          }
          setLoading(false);
        } catch {
          // formRef.current?.resetFields();
          setLoading(false);
        }
      },
      ...restProps,
    };

    return (
      <div>
        <ModalForm
          {...modalFormProps}
          initialValues={!asyncInitialValues ? initialValues : {}}
          //   preserve={!!asyncInitialValues}
          onVisibleChange={(v) => {
            if (!v) {
              formRef.current?.resetFields();
              onClose();
            }
          }}
        >
          {children}
        </ModalForm>
      </div>
    );
  },
);

export default TvModal;

/**
 * NiceModal 实现
 * TODO: promise
 */

const MODAL_REGISTRY = {};

export const register = (id, comp, props) => {
  if (!MODAL_REGISTRY[id]) {
    MODAL_REGISTRY[id] = { comp, props };
  } else {
    MODAL_REGISTRY[id].props = props;
  }
};

export const unregister = (id) => {
  delete MODAL_REGISTRY[id];
};

const modalCallbacks = {};

const symModalId = Symbol('NiceTvModalId');

let uidSeed = 0;
const getUid = () => `_nice_it_modal_${(uidSeed += 1)}`;

const getModalId = (modal) => {
  if (typeof modal === 'string') return modal;
  if (!modal[symModalId]) {
    modal[symModalId] = getUid();
  }
  return modal[symModalId];
};

export const useModal = () => {
  const modalRef = useRef();
  const modal = forwardRef((props, ref) => {
    return <TvModal ref={modalRef} {...props} />;
  });
  return {
    TvModal: modal,
    modalRef,
    modal: {
      show: () => {
        const modalId = getModalId(modal);
        if (!MODAL_REGISTRY[modalId]) {
          register(modalId, modal);
        }
        modalRef.current?.setVisible(true);
        let theResolve;
        let theReject;
        const promise = new Promise((resolve, reject) => {
          theResolve = resolve;
          theReject = reject;
        });
        modalCallbacks[modalId] = {
          resolve: theResolve,
          reject: theReject,
          promise,
        };

        return modalCallbacks[modalId].promise;
      },
      hide: () => {
        modalRef.current?.setVisible(false);
        return Promise.resolve(true);
      },
      remove: () => {
        const modalId = getModalId(modal);
        if (!MODAL_REGISTRY[modalId]) {
          return;
        }
        delete MODAL_REGISTRY[modalId];
      },
      resolve: (args) => {
        const modalId = getModalId(modal);
        modalCallbacks[modalId]?.resolve?.(args);
        delete modalCallbacks[modalId];
      },
      reject: (args) => {
        const modalId = getModalId(modal);
        modalCallbacks[modalId]?.reject?.(args);
        delete modalCallbacks[modalId];
      },
    },
  };
};
