const { spawn } = require("child_process");
const { sleep, crossCombineArray } = require("../../utils");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { mkdirsSync } = require("../../utils/fs-utils");
const { Worker, isMainThread } = require("worker_threads");


module.exports.record = async function (options, tempVideoPath, tempVoicePath) {
  mkdirsSync(tempVideoPath);
  const browser = options.browser || (await puppeteer.launch());
  const page = options.page || (await browser.newPage());
  const { duration, wavFileId } = await options.prepare(browser, page);

  // const screenshotWorker = new Worker(
  //   path.join(__dirname, "./screenshot-worker.js")
  // );

  const frames = Math.ceil(options.frames * duration);
  const emptyFrames = Math.ceil((duration / 18) * 6);

  const dom = await page.$("#canvasWrap");

  const ffmpegPath = options.ffmpeg || "ffmpeg";
  const fps = options.fps || 60;

  const outFile = path.join(tempVideoPath, `${wavFileId}.webm`);

  const args = ffmpegArgs(fps);

  if ("format" in options) args.push("-f", options.format);
  else if (!outFile) args.push("-f", "matroska");

  args.push(outFile || "-");

  const ffmpeg = spawn(ffmpegPath, args);

  if (options.pipeOutput) {
    ffmpeg.stdout.pipe(process.stdout);
    ffmpeg.stderr.pipe(process.stderr);
  }

  const closed = new Promise((resolve, reject) => {
    ffmpeg.on("error", reject);
    ffmpeg.on("close", resolve);
    resolve(wavFileId);
  });

  try {
    const num = fps / options.frames;
    const screenshotGather = [];

    // screenshotWorker.on("message", (pipes) => {
    //   console.log("pipes");
    //   screenshotGather.push(pipes);
    // });

    const framesMap = async (section, limit) => {
      return new Promise(async (resolve) => {
        const screenshotPipes = [];
        for (let i = 0; i < frames; i++) {
          if (options.logEachFrame)
            console.log(
              `[puppeteer-recorder] ${section} rendering frame ${i} of ${frames}.`
            );
          await options.render(browser, page, i);
          const originTime = new Date().getTime();
          let screenshot = await dom.screenshot({ omitBackground: true });
          console.log(new Date().getTime() - originTime);
          screenshotPipes.push(screenshot);
        }
        resolve(screenshotPipes);
      });
    };

    for (let i = 0; i < num; ++i) {
      if (i > 0) {
        await sleep(100);
      }
      // console.log(dom.screenshot, 'dom')
      // screenshotWorker.postMessage({
      //   dom,
      //   frames,
      // });
      screenshotGather.push(framesMap(i));
      // if (i === num - 1) {
      //   console.log(15000);
      //   await sleep(15000);
      // }
    }

    const screenshotPipesResult = crossCombineArray(
      await Promise.all(screenshotGather)
    );

    for (let i = 0; i < screenshotPipesResult.length; ++i) {
      await write(ffmpeg.stdin, screenshotPipesResult[i]);
    }

    // 总时长 18s 54张图
    // 延迟   2s 每张图350ms 5张没效图

    // 实际用 49张图 3帧每秒  16.3秒完成视频

    ffmpeg.stdin.end();

    return await closed;
  } catch (error) {
    const wavFile = path.join(tempVoicePath, `./${wavFileId}.wav`);
    const webmFile = path.join(tempVideoPath, `./${wavFileId}.webm`);
    if (fs.existsSync(wavFile)) {
      fs.unlinkSync(path.join(tempVoicePath, `./${wavFileId}.wav`));
    }
    if (fs.existsSync(webmFile)) {
      fs.unlinkSync(path.join(tempVoicePath, `./${wavFileId}.webm`));
    }
  }
};

const ffmpegArgs = (fps) => [
  "-y",
  "-framerate",
  "15",
  "-f",
  "image2pipe",
  "-r",
  `${+fps}`,
  "-i",
  "-",
  "-c:v",
  "libvpx",
  "-c:a",
  "aac",
  "-auto-alt-ref",
  "0",
  "-pix_fmt",
  "yuv420p",
  "-metadata:s:v:0",
  'alpha_mode="1"',
];

const write = (stream, buffer) => {
  try {
    return new Promise((resolve, reject) => {
      stream.write(buffer, (error) => {
        if (error) {
          console.log(error, "error");
          reject(error);
        } else resolve();
      });
    });
  } catch (error) {}
};
