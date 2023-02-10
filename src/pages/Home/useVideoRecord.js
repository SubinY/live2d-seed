import { useRef } from "react";

export default function useVideoRecord() {
  const allChunks = useRef([]);
  const recorder = useRef();

  async function initRecord(recordDom) {
    const stream2 = recordDom.captureStream(60); // 60 FPS recording
    recorder.current = new MediaRecorder(stream2, {
      mimeType: "video/webm;codecs=vp9",
    });
    recorder.current.ondataavailable = (e) => {
      console.log("TCL: e", e);
      allChunks.current.push(e.data);
    };
  }

  //end & download
  function stopAndblobDownload() {
    if (!recorder.current) return;
    recorder.current.stop();
    const link = document.createElement("a");
    link.style.display = "none";
    const fullBlob = new Blob(allChunks.current);
    const downloadUrl = window.URL.createObjectURL(fullBlob);
    link.href = downloadUrl;
    link.download = `test${Math.random()}.webm`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  //start
  function startRecording() {
    if (!recorder.current) return;
    recorder.current.start(10);
  }

  return { initRecord, startRecording, stopAndblobDownload };
}
