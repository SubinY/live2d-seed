function uuid() {
  let s = [];
  let hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  // eslint-disable-next-line
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  // eslint-disable-next-line
  s[8] = s[13] = s[18] = s[23] = "-";

  let uuid = s.join("");
  return uuid;
}

function sleep(time = 500) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function crossCombineArray(arrGather) {
  if (!arrGather?.[0]) throw new Error("arrGather not empty!");
  const arrsLengh = arrGather?.length || 1;
  const arrItemLengh = arrGather[0]?.length || 1;
  const newArr = [];
  const getArrItem = (arr, index, arrResult = []) => {
    if (arr[index] !== undefined) {
      arrResult.push(arr[index]);
    }
  };

  for (let i = 0; i < arrItemLengh; ++i) {
    for (let j = 0; j < arrsLengh; ++j) {
      getArrItem(arrGather[j], i, newArr);
    }
  }
  return newArr;
}

module.exports = { uuid, sleep, crossCombineArray };
