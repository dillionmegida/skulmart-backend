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

// this method is an alternative to skip and limit method in mongoose because
// we are reversing the total documents available
// not only the limited ones from .limit
type SliceAndReverseArgs = {
  arr: any[];
  limit: number;
  currentPage: number;
};
export function sliceAndReverse({
  arr,
  limit,
  currentPage,
}: SliceAndReverseArgs) {
  return arr.reverse().slice(currentPage * limit, limit + currentPage * limit);
}
