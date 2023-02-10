import { request } from "@umijs/max";
import { API_BASE_JAVA } from "./../constants/apibase";

//
export async function voiceToText(blob) {
  const formData = new FormData();
  formData.append("blob", blob);
  return request(API_BASE_JAVA + "/api/voice/toText", {
    method: "POST",
    responseType: "formData",
    data: formData,
  });
}

// 后端监控试听接口
export async function voiceToTextBack(blob) {
  const formData = new FormData();
  formData.append("blob", blob);
  return request(API_BASE_JAVA + "/api/voice/toTextByBack", {
    method: "POST",
    responseType: "formData",
    data: formData,
  });
}

export async function videoRecord(data) {
  return request(API_BASE_JAVA + "/api/record/record", {
    method: "GET",
    params: data,
  });
}