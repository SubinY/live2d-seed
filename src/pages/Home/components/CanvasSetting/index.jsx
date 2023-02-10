import { Switch, Tabs } from "antd";
import {
  forwardRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import TvModal from "@/components/TvModal/index";
import { useModel } from "umi";
import classNames from "classnames/bind";
import stylesLess from "./index.less";

const classNamesStyles = classNames.bind(stylesLess);

const bgList = [
  {
    src: "./bg1.jpg",
  },
  {
    src: "./bg2.jpg",
  },
  {
    src: "./bg3.jpeg",
  },
];

const CanvasSetting = forwardRef((props, ref) => {
  const { title = "设置画布", onOk } = props;
  const { init, canvasModel, setCanvasModel } = useModel("useCombineModel");
  const [bg, setBg] = useState(canvasModel?.backgroundUrl);
  const modalRef = useRef();

  useImperativeHandle(ref, () => {
    return {
      ref: modalRef,
      createCanvas,
    };
  });

  const createCanvas = useCallback(() => {
    init("canvasPerson1");
  }, [init]);

  const ModalProps = useMemo(
    () => ({
      title,
      width: 1100,
      confirmText: "确认",
      onFinish: (values) => {
        return new Promise(async (resolve, reject) => {
          setCanvasModel({
            ...canvasModel,
            backgroundUrl: bg,
          });
          resolve(true);
        });
      },
      onClose: () => {
        setBg(canvasModel?.backgroundUrl);
      },
    }),
    [canvasModel, bg]
  );

  const handleChangeBg = useCallback(
    (v) => {
      setBg(v);
    },
    [canvasModel, setCanvasModel]
  );

  const TabItem = useMemo(() => {
    const imgCardList = (list) => {
      return (
        <div className={classNamesStyles("card-wrap")}>
          {list?.map((item) => (
            <div
              className={classNamesStyles("card-item")}
              style={{
                border:
                  item?.src === bg ? "2px solid #0F6EDD" : "1px solid #ccc",
              }}
              key={item?.src}
              onClick={() => handleChangeBg(item?.src)}
            >
              <img src={item?.src} />
            </div>
          ))}
        </div>
      );
    };

    return [
      {
        key: "1",
        label: `背景图`,
        children: imgCardList(bgList),
      },
      {
        key: "2",
        label: `人物`,
        children: `Content of Tab Pane 2`,
      },
    ];
  }, [bg, handleChangeBg]);

  return (
    <TvModal ref={modalRef} {...ModalProps}>
      <div className={classNamesStyles("modal-wrap")}>
        <div className={classNamesStyles("left")}>
          <div className={classNamesStyles("left-top")}></div>
          <div className={classNamesStyles("left-bottom")}>
            <img
              id="canvasBg1"
              className={classNamesStyles("canvasBg1")}
              src={bg}
            />
            <canvas
              id="canvasPerson1"
              className={classNamesStyles("canvasPerson1")}
            ></canvas>
          </div>
        </div>
        <div className={classNamesStyles("right")}>
          <Tabs defaultActiveKey="1" centered items={TabItem} />
        </div>
      </div>
    </TvModal>
  );
});

export default CanvasSetting;
