const commonUtils = {
  getCurrentDocBody: function () {
    let docHtml = document.documentElement.innerHTML.trim();
    let header =
      '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">' +
      '<html lang="en">';
    let footer = '</html>';
    return commonUtils.Base64.encode(header + docHtml + footer);
  },
  Base64: (function () {
    let _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let encode = function (input) {
      let output = '';
      let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      let i = 0;
      input = utf8Encode(input);
      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }
        output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
      }
      return output;
    };
    // public method for decoding
    let decode = function (input) {
      let output = '';
      let chr1, chr2, chr3;
      let enc1, enc2, enc3, enc4;
      let i = 0;
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
      while (i < input.length) {
        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
      }
      output = utf8Decode(output);
      return output;
    };
    // private method for UTF-8 encoding
    let utf8Encode = function (string) {
      string = string.replace(/\r\n/g, '\n');
      let utftext = '';
      for (let n = 0; n < string.length; n++) {
        let c = string.charCodeAt(n);
        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if (c > 127 && c < 2048) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      return utftext;
    };

    // private method for UTF-8 decoding
    let utf8Decode = function (utftext) {
      let string = '';
      let i = 0;
      let c = (c1 = c2 = 0);
      while (i < utftext.length) {
        c = utftext.charCodeAt(i);
        if (c < 128) {
          string += String.fromCharCode(c);
          i++;
        } else if (c > 191 && c < 224) {
          c2 = utftext.charCodeAt(i + 1);
          string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
      return string;
    };
    return {
      encode,
      decode,
    };
  })(),
};

// 流程节点需要调用的方法 processKey流程key，taskDefKey节点编码
export const formToDataForFlow = (processKey, taskDefKey, btn) => {
  // 做校验 这个地方需要结合表单，代码仅供参考
  const validata = validataForm();
  if (validata) {
    if (validata.proRewardLevel === 5 || validata.exeAuditAwardLevel === 5) {
      validata.exeFinalLevel = 5;
    }
    console.log('res', validata);
    return validata;
  }
  form.validateFields();
  return false;
};

//需要实现一个表单打印方法
export const printForm = () => {};

export default commonUtils;
