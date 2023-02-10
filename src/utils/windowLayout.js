import { history } from 'umi'
const isDevelopment = process.env.NODE_ENV === 'development';

const formatPublicParam = data => {
    var str = '';
    for (let i in data) {
        str += i + '=' + data[i] + '&';
    }
    str = str.length > 0 ? '?' + str.substring(0, str.length - 1) : '';
    return encodeURI(str);
};

// 获取链接后面的参数
const useSearchParams = () => {
    var search = window.location.hash.split("?")[1];
    var obj = {};
    if (!search) return obj
    var searchArr = search.split('&');
    var obj = {};
    searchArr.forEach((v, i) => {
        let str = v.split('=')[1];
        if (str.indexOf('%') === -1) {
            obj[v.split("=")[0]] = v.split("=")[1];
        } else {
            obj[v.split("=")[0]] = JSON.parse(decodeURIComponent(v.split("=")[1]));
        }

    })
    return obj
}

/**
 * @param pathname 新打开的url地址
 * @param query 需要凭借到链接后面的参数
 * @param state 隐式传参
 * @param name tab名称
 * @param closeType 如果是prev则关闭之前的页面
 */
export const openPage = ({ pathname = '', query = {}, state = {}, name }, closeType = false) => {
    let urlParam = Object.keys(query).length ? formatPublicParam(query) : '';
    if (Object.keys(state).length) {
        sessionStorage.setItem('state', JSON.stringify(state))
    }
    if (isDevelopment) {
        history.push(`${pathname}${urlParam}`)
        return
    }
    const url = `${window.location.origin}${window.location.pathname}/#${pathname}${urlParam}`
    const topWindow = window.top.baseNav;
    const ag = closeType ? 'prev' : '';
    topWindow.open(url, name, '', '', '', '', ag);
}
/**
 * @param isRefresh 返回的同时是否刷新页面
 */
export const backPage = (isRefresh = false) => {
    if (isDevelopment) {
        history.back()
        return
    }
    const topWindow = window.top.baseNav;
    topWindow.refreshAfterClose(isRefresh);
}
/**
 * @param 获取参数
 */
export const getParams = () => {
    var query = useSearchParams();
    var stateS = sessionStorage.getItem('state')
    sessionStorage.removeItem('state');
    var state = stateS ? JSON.parse(stateS) : {};
    return { query, state }
}
