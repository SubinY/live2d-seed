const { spawn, exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { mkdirsSync } = require("../../utils/fs-utils");

const ffmpegBinPath = path.join(
  __dirname,
  `../../../tempFile/thirdly/${
    process.env.NODE_ENV === "development" ? "ffmpeg_win" : "ffmpeg"
  }`
);

const tempCombinePath = path.join(__dirname, `../../../tempFile/temp/combine`);

module.exports.mergeVoice = function (wavFileId, tempVideoPath, tempVoicePath) {
  return new Promise((resolve, reject) => {
    mkdirsSync(tempCombinePath);
    try {
      exec(
        `${ffmpegBinPath} -i ${path.join(
          tempVideoPath,
          `./${wavFileId}.webm`
        )} -i ${path.join(
          tempVoicePath,
          `./${wavFileId}.wav`
        )} -map 0:0 -map 1:0 ${path.join(
          tempCombinePath,
          `./${wavFileId}.webm`
        )}`,
        (err, stdout, stderr) => {
          if (err) {
            console.log("ffmpeg combine error");
            return reject();
          }
          resolve();
        }
      );
    } catch (error) {
      console.log(error, "mergeVoice");
      const wavFile = path.join(tempVoicePath, `./${wavFileId}.wav`);
      const webmFile = path.join(tempVideoPath, `./${wavFileId}.webm`);
      if (fs.existsSync(wavFile)) {
        fs.unlinkSync(path.join(tempVoicePath, `./${wavFileId}.wav`));
      }
      if (fs.existsSync(webmFile)) {
        fs.unlinkSync(path.join(tempVoicePath, `./${wavFileId}.webm`));
      }
      reject(error);
    }
  });
};
