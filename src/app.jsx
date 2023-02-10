// 运行时配置
import { notification, message } from "antd";
import { isEmpty } from "@/utils/index";
import { history } from "umi";
import logo from "@/assets/yhLogo.png";
import { Container } from "@/utils";

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://next.umijs.org/docs/api/runtime-config#getinitialstate

message.config({
  getContainer: Container,
});

const loginPath = "/user/login";
export async function getInitialState() {
  // if (location.pathname !== loginPath) {
  //   const accessToken = localStorage.getItem('access_token');
  //   if (accessToken) {
  //     try {
  //       const [{data}, {data: orgInfo}] = await Promise.all([fetchCurrent(), getLoginOrgInfo()]);
  //       //兼容企业微信，调用接口需要公参：Position-Code
  //       if (data !== null && typeof data === 'object' && !localStorage.getItem('currentUser')) {
  //         localStorage.setItem('currentUser', JSON.stringify(data));
  //       }
  //       return {...data, orgInfo};
  //     } catch (error) {
  //       message.error(`初始化用户信息报错:${error}`);
  //     }
  //   } else {
  //     history.push(loginPath);
  //   }
  // }

  return {};
}

//request运行时配置

const codeMessage = {
  200: "服务器成功返回请求的数据。",
  201: "新建或修改数据成功。",
  202: "一个请求已经进入后台排队（异步任务）。",
  204: "删除数据成功。",
  400: "发出的请求有错误，服务器没有进行新建或修改数据的操作。",
  401: "用户没有权限（令牌、用户名、密码错误）。",
  403: "用户得到授权，但是访问是被禁止的。",
  404: "发出的请求针对的是不存在的记录，服务器没有进行操作。",
  406: "请求的格式不可得。",
  410: "请求的资源被永久删除，且不会再得到的。",
  422: "当创建一个对象时，发生一个验证错误。",
  500: "服务器发生错误，请检查服务器。",
  502: "网关错误。",
  503: "服务不可用，服务器暂时过载或维护。",
  504: "网关超时。",
};

export const request = {
  // timeout: 10000,
  // other axios options you want
  errorConfig: {
    errorHandler(error, opts) {
      console.log(error, opts);
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === "BizError") {
      } else if (error.response) {
        const response = error.response;
        if (response && response.status) {
          const errorText = codeMessage[response.status] || response.statusText;
          const {
            status,
            config: { url },
          } = response;
          switch (status) {
            case 401:
              notification.error({
                message: `Token过期 ${status}: ${url}`,
                description: errorText,
              });
              if (process.env.NODE_ENV === "development") {
                localStorage.clear();
                // 调用登出
                history.push(loginPath);
              }
              break;
            case 402:
              break;
            case 400:
              response.data = data;
              if (isEmpty(data) || data.code !== "A0301") {
                notification.error({
                  message: `参数异常 ${status}: ${url}`,
                  description: errorText,
                });
              }
              break;
            case 500:
              notification.error({
                message: `请求错误 ${status}: ${url}, 请联系系统管理员`,
                description: errorText,
              });
              break;
            default:
              notification.error({
                message: `请求错误 ${status}: ${url}`,
                description: errorText,
              });
          }
        }
        return response;
      } else {
        // 发送请求时出了点问题
        message.error("Request error, please retry.");
      }
    },
    errorThrower(res) {
      console.log(res);
      // const { success, data, errorCode, errorMessage, showType } = res;
      // if (!success) {
      //   const error = new Error(errorMessage);
      //   error.name = 'BizError';
      //   error.info = { errorCode, errorMessage, showType, data };
      //   throw error; // 抛出自制的错误
      // }
    },
  },
  requestInterceptors: [
    (url, options) => {
      let currentUser = "";
      console.log(url, 'url')
      try {
        currentUser = JSON.parse(localStorage.getItem("currentUser"));
      } catch (error) {}
      if (
        ["post", "put", "delete", "get"].includes(
          options?.method?.toLowerCase()
        )
      ) {

        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Authorization: `Bearer ${accessToken}`,
          // token: casJwt,
          ...options.headers,
        };

        if (currentUser) {
          // 存在存储的当前登录人信息的时候，响应头增加Position-Code；
          headers["Position-Code"] = currentUser?.currentPosition?.positionCode;
        }
        // 上传文件的fetch请求header里面不能写Content-Type，需fetch自己适配，所以上传文件是将Content-Type设置为upload用以删除默认Content-Type;
        if (
          options &&
          options.headers &&
          options.headers["Content-Type"] === "upload"
        ) {
          delete headers["Content-Type"];
        }

        //转换porTable 的分页查询参数
        if (Object.keys(options?.data || {}).includes("pageSize")) {
          const { pageSize: size, ...rest } = options?.data;
          options.data = { size, ...rest };
        }

        return {
          url,
          options: { ...options, headers },
        };
      }
      return {
        url,
        options: { ...options },
      };
    },
  ],
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data, request } = response;
      if (request.responseType !== "blob") {
        if (data.success === false) {
          message.error(data.message || "请求失败！");
        }
      }
      return response;
    },
  ],
};

// export const layout = () => {
//   return {
//     rightContentRender: () => <RightContent />,
//     logo: logo,
//     logout: () => history.push(loginPath),
//   };
// };
