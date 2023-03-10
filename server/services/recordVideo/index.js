const puppeteer = require("puppeteer");
const { record } = require("./puppeteer-recorder");
const path = require("path");
const { uuid, sleep } = require("../../utils");
const { mergeVoice } = require("./mergeVoice");
const { BASE_URL } = require("../../constant");

const ffmpegBinPath = path.join(
  __dirname,
  `../../../tempFile/thirdly/${
    process.env.NODE_ENV === "development" ? "ffmpeg_win" : "ffmpeg"
  }`
);
const tempVideoPath = path.join(__dirname, `../../../tempFile/temp/video`);
const tempVoicePath = path.join(__dirname, `../../../tempFile/temp/voice`);

async function recordBeforeOperate(page, text, canvasBg) {
  return new Promise(async (resolve, reject) => {
    try {
      await page.waitForSelector("#textarea");
      if (canvasBg) {
        await page.waitForSelector("#canvasBg");
        // console.log(canvasBg, "canvasBg");
        await page.$eval(
          "#canvasBg",
          (el, value) => {
            return el.setAttribute("src", value);
          },
          canvasBg
        );
      }
      await page.type("#textarea", text);
      await page.click("#freePlayBack");
      page.on("response", async (res) => {
        const { data } = await res.json();
        if (!data) return reject();
        const { textArr, fileId } = data;
        const lastCaption = textArr?.[textArr?.length - 1] || 0;
        const { ed } = lastCaption;

        resolve({
          duration: ed / 1000,
          wavFileId: fileId,
        });
      });
    } catch (error) {
      console.log(error, "recordBeforeOperate");
    }
  });
}

async function recordVideo(videoInfo) {
  return new Promise(async (resolve, reject) => {
    try {
      const { text: videoText, canvasBg } = videoInfo;

      const browser = await puppeteer.launch({
        ...process.env.NODE_ENV === "development" ? {} : {
          executablePath: path.join(__dirname, '../../../node_modules/puppeteer/chrome-linux/chrome')
        },
        headless: true,
        defaultViewport: null,
        // ignoreDefaultArgs: ["--mute-audio"],
        args: [
          "--use-fake-ui-for-media-stream",
          "--window-size=1920,1080",
          "-disable-gpu",
          "-disable-dev-shm-usage",
          "-disable-setuid-sandbox",
          "-no-first-run",
          "-no-sandbox",
          "-no-zygote",
          "-single-process",
        ],
      });
      const page = await browser.newPage();

      // await page.goto("http://localhost:8000/home");
      // await recordBeforeOperate(page, videoText, canvasBg);
      /* eslint-disable */
      // const tempSoleOutputPath = path.join(
      //   __dirname,
      //   `../../../tempFile/temp/video/${_uuid}.webm`
      // );

      const wavFileId = await record({
        ffmpeg: ffmpegBinPath,
        browser,
        page,
        logEachFrame: true,
        // screenShotDom: "#canvasWrap",
        // output: tempSoleOutputPath, // ??????????????????
        fps: 3, // ??????????????? ?????????
        frames: 3, // ?????????????????????
        prepare: async (browser, page) => {
          /* ??????????????????????????? */
          try {
            await page.goto("http://localhost:8000/home");
            // await page.goto(`${BASE_URL}:8000/home`);
            /* ---------------- ????????????????????? start ---------------- */
            return await recordBeforeOperate(page, videoText, canvasBg);
            /* ---------------- ????????????????????? end ---------------- */
          } catch (e) {
            console.log(e, "prepare");
            reject();
          }
        },
        render: async (browser, page, frame) => {
          /* ?????????????????????????????? */
        },
      }, tempVideoPath, tempVoicePath);

      // console.log("video gen finish");
      // console.log(wavFileId, "wavFileId ");
      // mergeVoice(wavFileId);
      await page.close();
      await sleep(1000);
      await mergeVoice(wavFileId, tempVideoPath, tempVoicePath);
      resolve(wavFileId);
    } catch (error) {
      console.log(error, "recordVideo");
      reject();
    }
  });

  // // ????????????????????????
  // await page.exposeFunction("onReplayStart", async () => {
  //   // await startReplay();
  // });
  // // ????????????????????????
  // await page.exposeFunction("onReplayFinish", async () => {
  //   // await finishReplay();
  // });
}

module.exports = {
  recordVideo,
};
