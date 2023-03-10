import {
  Cubism2ModelSettings,
  Cubism2Spec,
  Cubism4InternalModel,
  Cubism4ModelSettings,
  CubismSpec,
  InternalModel,
  Live2DFactory,
  Live2DFactoryContext,
  Live2DLoader,
  XHRLoader,
  folderName,
} from "pixi-live2d-display";
import JSON5 from "json5";
import { ping } from "./ping";
import { snakeCase, unionBy } from "lodash-es";
import { url as urlUtils } from "@pixi/utils";
import { getAlternativeURL, getSettingsJSON } from "./data";
import { isMocFile, isMocFileV3 } from "./helpers";

// replace the XHRLoader to handle failures
Live2DLoader.middlewares[Live2DLoader.middlewares.indexOf(XHRLoader.loader)] =
  async (context, next) => {
    const url = context.settings
      ? context.settings.resolveURL(context.url)
      : context.url;

    try {
      await XHRLoader.loader(context, next);
      return;
    } catch (e) {
      if (!(e && e.status === 403 && url.includes("jsdelivr"))) {
        throw e;
      }

      console.warn(
        "Received 403 response from jsDelivr, switching to the alternative URL"
      );
    }

    context.url = getAlternativeURL(url);

    await XHRLoader.loader(context, next);

    return next();
  };

// replace the default urlToJSON middleware
Live2DFactory.live2DModelMiddlewares[
  Live2DFactory.live2DModelMiddlewares.indexOf(Live2DFactory.urlToJSON)
] = urlToJSON;

const defaultInit = InternalModel.prototype.init;

InternalModel.prototype.init = async function () {
  await patchInternalModel(this);
  defaultInit.call(this);
};

async function urlToJSON(context, next) {
  if (typeof context.source === "string") {
    const url = context.source;

    let json;

    if (isMocFile(url)) {
      json = getSettingsJSON(url);

      if (!json) {
        throw new Error("Cannot find settings JSON from moc");
      }

      if (isMocFileV3(url)) {
        json.url = urlUtils.resolve(url, "dummy.model3.json");

        const json3 = json;

        json3.FileReferences.Moc = url;

        // construct motion definitions from the plain string array
        if (
          json3.FileReferences.Motions?.[""]?.length &&
          typeof json3.FileReferences.Motions[""][0] === "string"
        ) {
          json3.FileReferences.Motions[""] = json3.FileReferences.Motions[
            ""
          ].map((motionFile) => ({ File: motionFile }));
        }
      } else {
        json.url = urlUtils.resolve(url, "dummy.model.json");

        const json2 = json;

        json2.model = url;

        // construct motion definitions from the plain string array
        if (
          json2.motions?.[""]?.length &&
          typeof json2.motions[""][0] === "string"
        ) {
          json2.motions[""] = json2.motions[""].map((motionFile) => ({
            file: motionFile,
          }));
        }
      }
    } else {
      let jsonText = await fetch(url).then((res) => res.text());

      jsonText = replaceJSONText(jsonText, url);

      // some JSONs are poorly formatted, but can possibly be parsed by JSON5
      json = JSON5.parse(jsonText);

      json.url = url;
    }

    await patchJSON(json, url);

    setSingleMotionAsIdle(json);

    context.source = json;

    console.log(json);

    context.live2dModel.emit("settingsJSONLoaded", json);
  }

  return next();
}

function replaceJSONText(jsonText, url) {
  for (const patch of patches) {
    if (url.includes(encodeURI(patch.search)) && patch.replace) {
      jsonText = patch.replace(jsonText, url);
    }
  }

  return jsonText;
}

async function patchJSON(json, url) {
  for (const patch of patches) {
    if (url.includes(encodeURI(patch.search)) && patch.patch) {
      await patch.patch(json, url);
    }
  }
}

export async function patchInternalModel(internalModel) {
  for (const patch of patches) {
    if (
      internalModel.settings.url.includes(encodeURI(patch.search)) &&
      patch.patchInternalModel
    ) {
      await patch.patchInternalModel(internalModel);
    }
  }
}

const patches = [
  {
    search: "????????????", // ???????????? Horcrux College

    replace(jsonText) {
      // add missing commas
      return jsonText.replace(/mtn"([^,])/gm, 'mtn",$1');
    },

    patch(json) {
      // `textures` is an object with a single value which is the real textures array,
      // like { "textures": { '123': ["texture_00.png"] } }
      if (json.textures && !Array.isArray(json.textures)) {
        const realArray = Object.values(json.textures)[0];

        if (Array.isArray(realArray)) {
          json.textures = realArray
            // some paths are missing the folder prefix
            .map((tex) =>
              tex.startsWith("textures/") ? tex : "textures/" + tex
            );
        }
      }
    },
  },
  {
    search: "????????????", // ???????????? Girls Frontline

    async patch(json, url) {
      extractCubism2IdleMotions(json, ["daiji"]);

      if (!json.name) {
        // set a proper name
        json.name = folderName(url.replace(/(normal|destroy).model.json/, ""));
      }

      // prefix paths of motion files
      if (json.motions?.idle?.length) {
        // only check and fix the first one
        const motion0 = json.motions.idle[0];

        if (motion0.file?.startsWith("daiji")) {
          const fileExists = await ping(urlUtils.resolve(url, motion0.file));

          if (!fileExists) {
            // misplaced motion file
            motion0.file = "motions/" + motion0.file;
          }
        }
      }
    },
  },
  {
    search: "???????????????????????????", // ??????????????????????????? Unknown Bride

    async patch(json, url) {
      // add missing textures
      if (json.FileReferences?.Textures?.length === 0) {
        const tex0Exists = await ping(
          urlUtils.resolve(url, "textures/texture_00.png")
        );

        json.FileReferences.Textures.push(
          // two kinds of texture name
          tex0Exists ? "textures/texture_00.png" : "textures/texture_00 .png"
        );
      }

      // extract idle motions
      extractCubism4IdleMotions(json, ["home", "gacha"]);
    },
  },
  {
    search: "??????", // ??????Nerco TokyoNerco

    async patch(json, url) {
      // some textures are misplaced
      const correctTexture = async (texture) => {
        if (!(await ping(urlUtils.resolve(url, texture)))) {
          return texture.replace("/texture", "/android/texture");
        }

        return texture;
      };

      if (Cubism2ModelSettings.isValidJSON(json)) {
        if (json.textures) {
          json.textures = await Promise.all(json.textures.map(correctTexture));
        }

        if (json.motions) {
          // rename `File` to `file` in each motion
          for (const motionGroup of Object.values(json.motions)) {
            if (motionGroup?.length) {
              for (const motion of motionGroup) {
                motion.file = motion.file ?? motion.File;

                delete motion.File;
              }
            }
          }

          // some idle motions are misplaced in main group
          if (!json.motions.idle?.length && json.motions[""]) {
            json.motions.idle = json.motions[""].filter((motion) =>
              motion.file?.includes("loop")
            );
          }
        }
      } else if (Cubism4ModelSettings.isValidJSON(json)) {
        if (json.FileReferences?.Textures) {
          json.FileReferences.Textures = await Promise.all(
            json.FileReferences.Textures.map(correctTexture)
          );
        }

        if (json.FileReferences?.Motions) {
          if (
            !json.FileReferences.Motions.Idle?.length &&
            json.FileReferences.Motions[""]
          ) {
            json.FileReferences.Motions.Idle = json.FileReferences.Motions[
              ""
            ].filter((motion) => motion.File?.includes("loop"));
          }
        }
      }
    },
  },
  {
    search: "????????????", // ???????????? Destiny Child

    patch(json) {
      if (json.motions?.[""]?.length && !json.motions?.idle?.length) {
        // deep clone all the motions as idle motion
        json.motions.idle = json.motions?.[""].map((motion) => ({ ...motion }));
      }
    },
  },
  {
    search: "????????????", // ???????????? Azur Lane

    patch(json) {
      extractCubism4IdleMotions(json, ["idle"]);
    },
  },
  {
    search: "???????????????", // ??????????????? Girl Cafe Gun

    patch(json) {
      extractCubism4IdleMotions(json, ["stand"]);
    },

    patchInternalModel(internalModel) {
      // convert the case of parameter names
      // e.g. ParamAngleX -> PARAM_ANGLE_X
      for (const prop of Object.keys(internalModel)) {
        if (prop.startsWith("idParam")) {
          internalModel[prop] = snakeCase(internalModel[prop]).toUpperCase();
        }
      }
    },
  },
  {
    search: "princesses", // Sacred Sword Princesses

    patch(json) {
      extractCubism2IdleMotions(json, ["default", "loop"]);
    },
  },
  {
    search: "??????", // ??????2 Honkai Impact 2

    patch(json) {
      removeSoundDefs(json);

      // no empty name
      if (json.name === "") {
        delete json.name;
      }
    },
  },
  {
    search: "????????????", // ???????????? Warship Girls

    patch(json) {
      removeSoundDefs(json);
    },
  },
  {
    search: "????????????", // ???????????? Iron Saga

    patch(json) {
      removeSoundDefs(json);
    },
  },
  {
    search: "????????????", // ???????????? Noah Fantasy

    patch(json) {
      // just... don't name it "model"
      if (json.name === "model") {
        delete json.name;
      }
    },
  },
];

/**
 * Sets a motion as the idle motion if it's the only one in this model.
 */
function setSingleMotionAsIdle(json) {
  const motions = json.FileReferences?.Motions;

  if (motions) {
    if (!motions.Idle?.[0] && motions[""]?.length === 1) {
      // deep clone the array
      motions.Idle = motions[""].map((motion) => ({ ...motion }));
    }
  }
}

/**
 * Extracts non-standard idle motions into the "idle" group.
 *
 * @param json
 * @param keywords Strings in lowercase.
 */
function extractCubism2IdleMotions(json, keywords) {
  if (json.motions) {
    const idleMotions = [];

    for (const [group, motions] of Object.entries(json.motions)) {
      if (group !== "idle" && Array.isArray(motions)) {
        for (const motion of motions) {
          for (const keyword of keywords) {
            if (motion.file && motion.file.toLowerCase().includes(keyword)) {
              idleMotions.push(motion);
            }
          }
        }
      }
    }

    if (idleMotions.length) {
      json.motions.idle = unionBy(json.motions.idle, idleMotions, "file");
    }
  }
}

/**
 * Extracts non-standard idle motions into the "Idle" group.
 *
 * @param json
 * @param keywords Strings in lowercase.
 */
function extractCubism4IdleMotions(json, keywords) {
  if (json.FileReferences?.Motions) {
    const idleMotions = [];

    for (const [group, motions] of Object.entries(
      json.FileReferences.Motions
    )) {
      if (group !== "Idle" && Array.isArray(motions)) {
        for (const motion of motions) {
          for (const keyword of keywords) {
            if (motion.File && motion.File.toLowerCase().includes(keyword)) {
              idleMotions.push(motion);
            }
          }
        }
      }
    }

    if (idleMotions.length) {
      json.FileReferences.Motions.Idle = unionBy(
        json.FileReferences.Motions.Idle,
        idleMotions,
        "File"
      );
    }
  }
}

/**
 * Some models have sound definitions, but the sound files are not appearing in the repository,
 * so it's better to remove them to reduce the amount of errors in console.
 */
function removeSoundDefs(json) {
  if (json.motions) {
    for (const motionGroup of Object.values(json.motions)) {
      if (motionGroup?.length) {
        for (const motion of motionGroup) {
          motion.sound = undefined;
        }
      }
    }
  }
}
