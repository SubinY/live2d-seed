import { PlayCircleOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { Button, Input, Slider, Switch, Space, message } from "antd";
import { useState, useCallback, useRef, useEffect } from "react";
import CanvasSetting from "./components/CanvasSetting/index";
import { useModel } from "@umijs/max";
import classNames from "classnames/bind";
import stylesLess from "./index.less";
import useTTS from "./useTTS";
import sleep from "@/utils/sleep";
import useVideoRecord from "./useVideoRecord";
import API from "@/api";
import { downloadFile } from "./../../utils/download";

const classNamesStyles = classNames.bind(stylesLess);

const PERSON_SCALE = 0.5;

const HomePage = () => {
  const [textareaValue, setTextareaValue] = useState();
  const [captionShow, setCaptionShow] = useState(true);
  const { init, canvasModel, modelIns, resetPersonPos } =
    useModel("useCombineModel");
  const { handleCombine, playLoading } = useTTS(modelIns);
  const [modelInsScale, setModelInsScael] = useState(PERSON_SCALE);
  const [caption, setCaption] = useState();
  const [downloadLoading, setDownloadLoading] = useState(false);
  const modalRef = useRef();
  const captionId = useRef(); // 控制每次只能出现一次字幕集合
  const recordArea = useRef();

  useEffect(() => {
    init("canvasPerson", PERSON_SCALE);
    // initRecord(recordArea.current);
  }, []);

  useEffect(() => {
    if (modelIns?.pixiModel) {
      modelIns.pixiModel.internalModel.idParamAngleX = "";
      modelIns.pixiModel.internalModel.idParamAngleY = "";
      modelIns.pixiModel.internalModel.idParamAngleZ = "";
      modelIns.pixiModel.internalModel.idParamEyeBallX = "";
      modelIns.pixiModel.internalModel.idParamEyeBallY = "";
      modelIns.pixiModel.internalModel.idParamBodyAngleX = "";
    }
  }, [modelIns?.pixiModel]);

  const handleTextarea = (v) => {
    setTextareaValue(v?.currentTarget?.value);
  };

  const handleResetPerson = useCallback(
    (v) => {
      resetPersonPos();
      modelIns.scaleX = PERSON_SCALE;
      setModelInsScael(PERSON_SCALE);
    },
    [resetPersonPos, setModelInsScael]
  );

  const handleCanvas = useCallback(
    (v) => {
      modalRef.current?.ref?.current?.setVisible(true);
    },
    [modalRef]
  );

  const handlePersonSize = useCallback(
    (v) => {
      modelIns.scaleX = v;
      setModelInsScael(v);
    },
    [modelIns, setModelInsScael]
  );

  const handlePlayAudio = useCallback(
    async (isBackEnd) => {
      if (!textareaValue?.trim())
        return message.warning("请输入要合成的文字！");
      return new Promise(async (resolve, reject) => {
        try {
          message.warning("正在合成，请稍后...", 0);
          const { textJson, duration } = await handleCombine(
            textareaValue,
            modelIns,
            isBackEnd
          );
          captionId.current = new Date().getTime();
          loopShowCaption(captionId.current, textJson);
          resolve(Math.ceil(duration / 1000));
        } catch (error) {
          reject();
        } finally {
          message.destroy();
        }
      });
    },
    [handleCombine, textareaValue, modelIns]
  );

  const loopShowCaption = async (currentCaptionId, textJson) => {
    const replaceLastMask = (text) => {
      const lastMark = text.slice(text.length - 1);
      if (/[，。？,\\.\\?]/.test(lastMark))
        return text.substr(0, text.length - 1);
      return text;
    };
    for (let i = 0; i < textJson.length; ++i) {
      if (currentCaptionId !== captionId.current) return;
      const curr = textJson[i];
      const next = textJson[i + 1];
      const { bg: prevBg, ed: prevEd, onebest: prevOnebest } = curr;
      const { bg: nextBg, ed: nextEd, onebest: nextOnebest } = next || {};
      const showText = replaceLastMask(prevOnebest);
      let waitTime = nextBg - (prevEd || 0) + (prevEd - prevBg || 0);
      if (!next) waitTime = prevEd - prevBg;
      setCaption(showText);
      await sleep(waitTime);
    }
    setCaption("");
  };

  const handleStartRecording = async () => {
    try {
      setDownloadLoading(true);
      if (!textareaValue?.trim())
        return message.warning("请输入要合成的文字！");
      message.warning("正在生成，请稍后...", 0);
      // const duration = await handlePlayAudio();

      const { data } = await API.Voice.videoRecord({
        duration: 5,
        text: textareaValue,
        canvasBg: canvasModel?.backgroundUrl,
      });
      if (data) {
        downloadFile(data, "播报.webm");
      }
    } catch (error) {
    } finally {
      setDownloadLoading(false);
      message.destroy();
    }
  };

  const handleCaptionShow = () => {
    setCaptionShow(!captionShow);
  };

  return (
    <PageContainer ghost>
      <div className={classNamesStyles("home")}>
        <div className={classNamesStyles("header")}>
          <div className={classNamesStyles("title")}>标题</div>
          <div className={classNamesStyles("btn-wrap")}>
            <Space>
              <Button
                type="primary"
                loading={downloadLoading}
                onClick={handleStartRecording}
              >
                下载
              </Button>
            </Space>
          </div>
        </div>
        <div className={classNamesStyles("wrap")}>
          <div className={classNamesStyles("left")}>
            <div className={classNamesStyles("left-top")}>
              <div className={classNamesStyles("left-top-btn")}>
                <div className={classNamesStyles("slider-wrap")}>
                  <span>调整人物大小</span>
                  <Slider
                    className={classNamesStyles("slider-bar")}
                    min={0.1}
                    max={1}
                    step={0.1}
                    onChange={handlePersonSize}
                    value={modelInsScale}
                  />
                </div>
                <Space>
                  <Button type="default" onClick={handleResetPerson}>
                    重置人物
                  </Button>
                  <Button type="default" onClick={handleCanvas}>
                    设置画布
                  </Button>
                </Space>
              </div>
            </div>
            <div id="canvasWrap" className={classNamesStyles("left-bottom")}>
              {/* <div
                style={{ width: "100%", height: "100%", background: "red", position: 'absolute', top: 0 }}
              ></div> */}
              <img
                id="canvasBg"
                className={classNamesStyles("canvasBg")}
                src={canvasModel?.backgroundUrl}
              />
              <div className={classNamesStyles("canvasPersonWrap")}>
                <canvas
                  ref={recordArea}
                  id="canvasPerson"
                  className={classNamesStyles("canvasPerson")}
                ></canvas>
              </div>
              {captionShow && caption ? (
                <div className={classNamesStyles("caption")}>{caption}</div>
              ) : null}
            </div>
            <div className={classNamesStyles("left-footer")}>
              <div className={classNamesStyles("switch-wrap")}>
                显示字幕
                <Switch
                  checked={captionShow}
                  style={{ verticalAlign: "text-top", marginLeft: "10px" }}
                  onChange={handleCaptionShow}
                />
              </div>
            </div>
          </div>
          <div className={classNamesStyles("right")}>
            <div className={classNamesStyles("right-top")}>
              <div className={classNamesStyles("right-top-btn")}>
                <Button
                  style={{ opacity: 0 }}
                  type="default"
                  id="freePlayBack"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handlePlayAudio(true)}
                  loading={playLoading}
                >
                  后端试听
                </Button>
                <Button
                  type="default"
                  id="freePlay"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handlePlayAudio(false)}
                  loading={playLoading}
                >
                  试听
                </Button>
              </div>
            </div>
            <div className={classNamesStyles("right-bottom")}>
              <Input.TextArea
                id="textarea"
                value={textareaValue}
                onChange={handleTextarea}
                className={classNamesStyles("textarea")}
                rows={4}
                placeholder="请输入文字"
              />
            </div>
          </div>
        </div>
      </div>
      <CanvasSetting ref={modalRef} onOk={() => {}} />
    </PageContainer>
  );
};

export default HomePage;
