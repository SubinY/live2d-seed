const { parentPort, workerData } = require("worker_threads");

parentPort.on("message", async ({ dom, frames }) => {
  console.log(dom.screenshot, 'dom', 'worker')
  const screenshotPipes = [];
  for (let i = 0; i < frames; i++) {
    const originTime = new Date().getTime();
    let screenshot = await dom.screenshot({ omitBackground: true });
    console.log(new Date().getTime() - originTime);
    screenshotPipes.push(screenshot);
  }
  parentPort.postMessage(screenshotPipes);
});
