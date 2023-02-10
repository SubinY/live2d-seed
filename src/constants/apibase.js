
const CURRENT_PROTOCOL = `${window.location.protocol}//`;

export const apiBaseJAVADev = `${CURRENT_PROTOCOL}127.0.0.1:9999`;

export const apiBaseJAVAProd = `${CURRENT_PROTOCOL}101.33.228.57:9999`;

const mapping = {
  '192.168.31.75': apiBaseJAVADev,
  '101.33.228.57': apiBaseJAVAProd
}

export const API_BASE_JAVA = mapping[window.location.hostname] || apiBaseJAVADev;
