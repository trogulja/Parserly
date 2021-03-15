const dayMath = (d, dOff) => {
  const date = new Date(
    Number(d.toString().slice(0, 4)),
    Number(d.toString().slice(4, 6)) - 1,
    Number(d.toString().slice(6, 8))
  );
  date.setDate(date.getDate() + dOff);
  return Number(
    `${date.getFullYear()}${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}${
      date.getDate() < 10 ? '0' : ''
    }${date.getDate()}`
  );
};

const calcInspectTime = (n) => {
  let j;
  if (n < 0) {
    j = 0;
  } else if (n <= 8) {
    // 0 - 8 = remap 2 - 30
    let in_min = 0;
    let in_max = 8;
    let out_min = 2;
    let out_max = 30;
    j = ((n - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
    j = j + 10;
    if (j > 30) j = 30;
  } else {
    n += 10;
    if (n > 300) n = 300;
    // 9 - 90 = remap 30 - 90
    if (n < 90) {
      let in_min = 9;
      let in_max = 90;
      let out_min = 45;
      let out_max = 90;
      j = ((n - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
      j = j + 80;
    } else {
      // 90 - 300 = remap 90 - 120
      let in_min = 90;
      let in_max = 300;
      let out_min = 90;
      let out_max = 120;
      j = ((n - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
      j = j + 80;
    }
  }
  return j;
};

module.exports = { dayMath, calcInspectTime };
