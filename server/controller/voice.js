const path = require("path");
const fs = require("fs-extra");
const { uuid } = require("../utils");
const { mkdirsSync } = require("../utils/fs-utils");
const { Weblfasr } = require("../services/weblfasr-node");

const TEMP_URL = path.join(__dirname, `../../tempFile/temp/voice`);

const getCapiton = async (url) => {
  const weblfasr = new Weblfasr({
    filePath: url,
  });
  const textJSON = await weblfasr.allApiRequest();
  return textJSON;
};

const commonToText = async (req, res, next) => {
  const id = uuid();
  mkdirsSync(TEMP_URL);
  const WAV_URL = path.join(TEMP_URL, `${id}.wav`);
  return new Promise(async (resolve, reject) => {
    try {
      const fileBlob = req.files.blob;
      if (fs.existsSync(WAV_URL)) {
        fs.unlinkSync(WAV_URL);
      }
      const wavFile = fs.readFileSync(fileBlob.path, "binary");
      fs.writeFileSync(WAV_URL, wavFile, "binary");
      const explainData = await getCapiton(WAV_URL);
      const { data, ok } = explainData;
      if (ok === 0) {
        res.status(200).send({
          success: true,
          data: {
            textArr: data,
            fileId: id,
          },
        });
      } else {
        res.status(200).send({
          success: false,
          data: null,
        });
      }
      resolve(id);
    } catch (err) {
      console.log(WAV_URL, "voiceReject");
      fs.unlinkSync(WAV_URL);
      reject();
      next(err);
    }
  });
};

module.exports = {
  toTextByBack: commonToText,
  toText: async (req, res, next) => {
    const id = await commonToText(req, res, next);
    if (id) {
      const WAV_URL = path.join(TEMP_URL, `${id}.wav`);
      fs.unlinkSync(WAV_URL);
    }
  },
};
