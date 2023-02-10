import { defineConfig } from "@umijs/max";
import routes from "./routes";
import path from "path";

export default defineConfig({
  base: "/",
  publicPath: "/",
  // history: {type: 'hash'},
  // layout: {
  //   title: '系统名称',
  //   locale: false,
  //   layout: 'side',
  //   contentWidth: 'Fluid',
  // },
  // vite: {},
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {
    dataField: "data",
  },
  define: {
    UMI_ENV: process.env.UMI_ENV || "",
  },
  devtool: "source-map",
  mfsu: {},
  clientLoader: {},
  routes,
  npmClient: "yarn",
  // chainWebpack: (config) => {
  //   config.module.rule("compile").exclude.add("public").add("thirdly").end();
  // },
  headScripts: [
    {
      src: "https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js",
    },
    {
      src: "https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js",
    },
  ],
});
