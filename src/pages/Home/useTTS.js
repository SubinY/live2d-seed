import { ttsRecorder } from "../../services/tts_ws/index.js";
import { useRef, useState } from "react";
import API from "@/api";
import sleep from '@/utils/sleep';

let audioCtx = null;

export default function useTTS() {
  const [playLoading, setPlayLoading] = useState(false);
  const playRef = useRef(false);

  const handleCombine = (text, modelIns, isBackEnd = false) => {
    return new Promise(async (resolve, reject) => {
      try {
        setPlayLoading(true);
        ttsRecorder.setParams({
          text,
        });
        if (audioCtx) {
          audioCtx.close();
          playRef.current = false;
          setMouthOpenY(0, modelIns);
        }
        if (["init", "endPlay", "errorTTS"].indexOf(ttsRecorder.status) > -1) {
          const { wavBuffer, url, voiceBlob, voiceBuffer } =
            await ttsRecorder.start();
          try {
            if (ttsRecorder.rawAudioData.length) {
              const api = isBackEnd
                ? API.Voice.voiceToTextBack
                : API.Voice.voiceToText;
              const { data, success } = await api(voiceBlob);
              const { textArr } = data;
              if (success) {
                const lastCaption = textArr[textArr.length - 1];
                const { ed } = lastCaption;
                videoAnalyser(wavBuffer, modelIns, ed);
                resolve({
                  textJson: textArr,
                  duration: ed,
                });
              } else {
                reject();
              }
            } else {
              alert("请先合成");
              reject();
            }
          } catch (error) {
            reject();
          }
        } else {
          ttsRecorder.stop();
          reject();
        }
      } catch (error) {
      } finally {
        setPlayLoading(false);
      }
    });
  };

  const setMouthOpenY = (v, modelIns) => {
    v = Math.max(0, Math.min(1, v));
    modelIns?.pixiModel?.internalModel?.coreModel?.setParameterValueById(
      "ParamMouthOpenY",
      v
    );
  };

  const eyeRunAction = (action = "close", modelIns, v) => {
    const step = 0.1;
    setTimeout(() => {
      let value;
      if (action === "close") {
        value = (v - step).toFixed(1);
      } else {
        value = v + step;
      }
      modelIns?.pixiModel?.internalModel?.coreModel?.setParameterValueById(
        "ParamEyeLOpen",
        value
      );
      modelIns?.pixiModel?.internalModel?.coreModel?.setParameterValueById(
        "ParamEyeROpen",
        value
      );

      if (+value >= 1 || +value <= -1) return;
      if (+value <= 0 || action === "open") {
        return eyeRunAction("open", modelIns, +value);
      }
      eyeRunAction("close", modelIns, +value);
    }, 1000 / 30);
  };

  const eyeRun = async (totalTime, modelIns) => {
    if (!totalTime) return;
    let count = totalTime - 1;
    const run = async (count) => {
      if (count < 0) return;
      eyeRunAction("close", modelIns, 1);
      await sleep(4000);
      run(count - 1);
    };
    await run(count);
  };

  const videoAnalyser = async (arraybuffer, modelIns, captionDuration) => {
    audioCtx = new AudioContext();
    const captionSecond = Math.floor(captionDuration / 1000) || 0;
    eyeRun(captionSecond, modelIns);

    // 新建分析仪
    const analyser = audioCtx.createAnalyser();
    // 根据 频率分辨率建立个 Uint8Array 数组备用
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // 取音频文件成 arraybuffer
    // const arraybuffer = await fetch('/1669188833895.wav').then((res) =>
    //   res.arrayBuffer()
    // );
    audioCtx.decodeAudioData(arraybuffer, (buffer) => {
      // 新建 Buffer 源
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      // 连接到 audioCtx
      source.connect(audioCtx.destination);

      // 连接到 音频分析器
      source.connect(analyser);

      // 开始播放
      source.start(0);
      playRef.current = true;
      run();
    });

    // 需要用到频谱的时候 从分析仪获取到 之前备用的 frequencyData 里
    const getByteFrequencyData = () => {
      analyser.getByteFrequencyData(frequencyData);
      return frequencyData;
    };

    const o = 80;
    const arrayAdd = (a) => a.reduce((i, a) => i + a, 0);
    const run = () => {
      // TODO： 音频结束还在跑，有bug **********************************
      if (!playRef.current) return;
      const frequencyData = getByteFrequencyData();
      const arr = [];
      // 频率范围还是太广了，跳采！
      for (let i = 0; i < 450; i += o) {
        arr.push(frequencyData[i]);
      }
      setMouthOpenY((arrayAdd(arr) / arr.length - 20) / 60, modelIns);
      setTimeout(run, 1000 / 30);
    };
  };

  return { handleCombine, playLoading };
}
