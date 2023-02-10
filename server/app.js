const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const router = require("./router");
const path = require("path");
const fs = require("fs-extra");
const formidable = require("express-formidable");
const CACHE_CONTROL = "no-store, no-cache, must-revalidate, private";
const { recordVideo } = require("./services/recordVideo");
const { mergeVoice } = require("./services/recordVideo/mergeVoice");
const { spawn } = require("child_process");

const PORT = 9999;
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "PUT, POST, PATCH, GET, DELETE, OPTIONS"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.static(path.resolve(__dirname, "../dist"), { setHeaders }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(formidable());
app.use("/api", router);
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).send(err.message);
});

// 临时资源
app.use("/tempFile", express.static(path.resolve(__dirname, "../tempFile")));

// console.log(22112);
// recordVideo({
//   text: "用Web网页模拟视频我玩的很溜，但是直接变成视频，可就触及了我的技术盲区了，上面这些方案折腾了一圈，都不太给力，本质上都是录屏为主，声音融合也是大问题",
// });

// mergeVoice('80d46ebe-ac3a-4384-96ea-93a7acb25891'); 

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server ready at http://0.0.0.0:${PORT}`);
});

function setHeaders(res) {
  res.set("Cache-Control", CACHE_CONTROL);
}

module.exports = server;
