const { recordVideo } = require("../services/recordVideo");
const fs = require("fs-extra");
const path = require("path");
const { BASE_URL } = require("../constant");
const { sleep } = require("../utils");

module.exports = {
  record: async (req, res, next) => {
    let fileId;
    try {
      const { duration, text, canvasBg } = req.query;
      fileId = await recordVideo({
        duration,
        text,
        canvasBg,
      });
      res.status(200).send({
        success: true,
        data: `${BASE_URL}:9999/tempFile/temp/combine/${fileId}.webm`,
      });
    } catch (error) {
      console.log(error, "error");
      res.status(200).send({
        success: false,
        data: null,
        message: "合成错误，请重新尝试！",
      });
      next(error);
    } finally {
      await sleep(30000);
      const wavFilePath = path.join(
        __dirname,
        `../../tempFile/temp/voice/${fileId}.wav`
      );
      const webmFilePath = path.join(
        __dirname,
        `../../tempFile/temp/video/${fileId}.webm`
      );
      const combineFilePath = path.join(
        __dirname,
        `../../tempFile/temp/combine/${fileId}.webm`
      );
      if (fs.existsSync(wavFilePath)) {
        fs.unlinkSync(wavFilePath);
      }
      if (fs.existsSync(webmFilePath)) {
        fs.unlinkSync(webmFilePath);
      }
      if (fs.existsSync(combineFilePath)) {
        fs.unlinkSync(combineFilePath);
      }
    }
  },
};
