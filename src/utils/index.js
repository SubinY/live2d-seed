import {message} from 'antd';

/**
 * 判断传入值是否为空
 * @param obj
 * @returns {boolean}
 */
export const isEmpty = (obj) => {
  if (null === obj) {
    return true;
  }
  if ('object' === typeof obj) {
    return 0 === Object.keys(obj).length;
  }
  return typeof obj === 'undefined' || obj === '';
};
// 公共的处理请求封装
export const handleRes = (res, actionRef) => {
  if (!res) {
    message.error('请求异常！');
  }
  if (res?.code === '00000') {
    message.success('操作成功');
    actionRef?.current?.reload();
    return true;
  } else {
    // message.error(res.message);
  }
};
// 转换接口数据为proTable需要的数据
export const handleProTableRes = ({code, data}) => {
  return {
    success: code === '00000',
    total: data?.total,
    data: data?.records,
  };
};

// 下载文件 res->文件流;fileType->文件类型默认xlsx;fileName->文件名称
export const downLoadFile = (res, fileName, fileType = 'xlsx') => {
  let type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  let blob = new Blob([res], {type});
  let src = window.URL.createObjectURL(blob);
  if (src) {
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = src;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(src);
  }
};
// 自动设置列展示的初始化设置
export const initColumnsStateMap = (columns = []) => {
  let filterColumns = columns.filter((item) => !item.hideInTable);
  return filterColumns
    .map((item) => item.dataIndex)
    .reduce((pre, cur, currentIndex) => {
      pre[cur] = {
        disable: false,
        fixed: filterColumns[currentIndex].fixed || false,
        show: true,
        order: currentIndex,
      };
      return pre;
    }, {});
};

//把用户设置的表格列自定义展示转换为排序后的数组
export const columnsStateMapToArray = (columnsStateMap = {}, filerKeys = ['option', 'index']) => {
  return Object.keys(columnsStateMap)
    .filter((key) => columnsStateMap[key].show && !filerKeys.includes(key))
    .sort((a, b) => columnsStateMap[a].order - columnsStateMap[b].order)
    .map((v) => {
      if (v.includes('Code')) {
        const splitStr = v.split('Code');
        return `${splitStr[0]}Name`;
      }
      return v;
    });
};

// 获取url
export const getFileUrl = (file) => {
  return file.filter((v) => v.status === 'done').map((v) => v.response.data);
};
// 回显图片
export const layoutFileList = (urls) => {
  return urls.map((v) => ({
    name: v.fileName,
    uid: Math.ceil(Math.random() * 100000),
    thumbUrl: v.url,
    type: v.fileType,
    status: 'done',
    response: {data: v},
  }));
};

// 放在顶级
export const Container = () => window.top.document.body;
