import { Outlet } from "umi";
import { ConfigProvider } from "antd";
import zh_CN from "antd/lib/locale-provider/zh_CN";
import "moment/locale/zh-cn";
import classNames from "classnames/bind";
import styleless from "./ProjectLayout.less";
import { DEFAULT_NAME } from "@/constants";

const classNameStyles = classNames.bind(styleless);

export default () => {
  return (
    <div id="layout" className={classNameStyles("layout")}>
      <div className={classNameStyles("header")}>
        <div className={classNameStyles("title")}>
          <span>{DEFAULT_NAME}</span>
        </div>
      </div>
      <ConfigProvider locale={zh_CN}>
        <div className={classNameStyles("content")}>
          <Outlet />
        </div>
      </ConfigProvider>
    </div>
  );
};
