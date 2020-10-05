const commaNumber = (number) => {
  const strNumber = number.toString();
  const len = strNumber.length;
  if (len < 4) {
    return parseInt(strNumber);
  }
  const strArr = strNumber.split("");
  const newArr = [];

  // this counts how many iterations
  let counter = 1;
  // the array has to start in reverse order because we can only determine the commas from the back
  for (let i = strArr.length - 1; i >= 0; i--) {
    // if iterations are divisible by three and the index is not 0, push the number and a comma to the array
    // if the index not been 0 is not checked, there would be a preceeding comma
    if (counter % 3 === 0 && i !== 0) {
      newArr.push(strArr[i]);
      newArr.push(",");
    } else {
      newArr.push(strArr[i]);
    }
    counter++;
  }
  // return the array in reverse order and joint to form a string
  return newArr.reverse().join("");
};

module.exports = commaNumber;
