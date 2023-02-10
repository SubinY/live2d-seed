// import { isDev } from './share';

const matchFileType = (url) => {
  if (typeof url !== 'string') throw new Error('请传入字符串');
  const regex = /(\.(\w+)\?)|(\.(\w+)$)/;
  const matchArr = decodeURIComponent(url).match(regex) || [];
  return matchArr[2] ?? '';
};

/**
 * 下载统一接口，判断浏览器是否支持a标签download属性，如果不支持采用form表单提交方式下载文件
 * @param url 受限通远策略
 * @param fileName
 */
export function download(url, fileName) {
  const isSupportDownload = 'download' in document.createElement('a');
  if (isSupportDownload) {
    downloadByLink(url, fileName);
  } else {
    downloadByForm(url);
  }
}

/**
 * 根据url直接下载文件（IE10+ 浏览器）
 * @param url 文件地址
 * @param fileName 自定义下载文件名称（必须有文件名后缀，比如图片就 picture.jpg，excel文档就为：模板.xls）
 * 不过这里的文件名目前可能受到浏览器兼容性的影响，一些浏览器可能需要通过右键文件另存为才可以自定义文件名称。
 */
function downloadByLink(url, fileName) {
  if (!url) {
    return;
  }
  const eleA = document.createElement('a');
  eleA.style.display = 'none';
  eleA.href = url;
  eleA.nodeValue = `下载${fileName}`;
  eleA.setAttribute('download', fileName || '模板.xlsx');
  document.body.appendChild(eleA);
  eleA.click();
  document.body.removeChild(eleA);
}

/**
 * 根据url直接下载文件
 * 不好的地方是不能更改下载文件的文件名称，如http://yztfile.gz.bcebos.com/WMGb-cvmXnwLHOIj.xlsx 下载的文件为 WMGb-cvmXnwLHOIj.xlsx
 * @param url
 */
function downloadByForm(url) {
  if (!url) {
    return;
  }
  const eleForm = document.createElement('form');
  eleForm.method = 'GET';
  eleForm.style.display = 'none';
  eleForm.action = url;
  document.body.appendChild(eleForm);
  eleForm.submit();
  document.body.removeChild(eleForm);
}

/**
 * cos下载
 * @param url
 * @param fileName
 * @param preview 是否预览，预览则打开新页面
 * @param needTips 是否需要全局提示
 */
export function downloadFile(url, fileName, preview, needTips = true) {
  const msgTips = () => {};
  const cosOrigin =
    process.env.COS_URL || 'https://dev-pimage-touchtv.oss-cn-shenzhen.aliyuncs.com';
  // 处理跨域
  // const cosUrl = isDev ? `${window.location.origin}/cos-file/${url.split(cosOrigin)[1]}` : url;
  const x = new XMLHttpRequest();
  x.open('GET', url, true);
  x.responseType = 'blob';
  x.onload = () => {
    const tempUrl = window.URL.createObjectURL(x.response);
    const a = document.createElement('a');
    const downloadFileName = fileName || `下载.${matchFileType(url)}`;
    a.href = tempUrl;
    if (!preview) {
      a.download = downloadFileName;
    } else {
      a.target = '_blank';
    }
    a.click();
    msgTips?.();
  };
  x.onerror = () => {
    msgTips?.();
  };
  x.send();
}
