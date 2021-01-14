export const shuffleArray = (arr: any[]) => {
  for (let i = arr.length - 1; i >= 0; i--) {
    let randomIndex = Math.floor(Math.random() * (i + 1));
    let itemAtIndex = arr[randomIndex];

    arr[randomIndex] = arr[i];
    arr[i] = itemAtIndex;
  }
  return arr;
};

export function getRandom(arr: any[]) {
  const randomNumber = Math.floor(Math.random() * arr.length);
  return arr[randomNumber];
}
