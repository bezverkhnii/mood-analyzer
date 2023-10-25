export const pickTwoMoods = (moodArr: string[]) => {
  let res = [];
  while (res.length < 2) {
    let mood = moodArr[Math.floor(Math.random() * moodArr.length)];
    moodArr = moodArr.filter((it) => it != mood);
    res.push(mood);
  }

  return res;
};
