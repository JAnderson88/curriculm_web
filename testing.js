function sortInPlace(array, newArray){
  if (array.length === 0){
    return []
  }
  if(newArray === undefined){
    newArray = []
  }
  if (array.length === 1){
    return newArray.concat(array[0])
  }
  if(array[0] > array[1]){
    newArray.unshift(array[1])
    var index = 0
    while(newArray[index] > newArray[index + 1]){
      newArray = (index === 0 && newArray.length ===2) ? [newArray[1]].concat(newArray[0]) : 
          (index === 0 && newArray.length >= 2) ? [newArray[1]].concat(newArray[0]).concat(newArray.slice(2)) :
          newArray.slice(0, index).concat(newArray[index+1]).concat(newArray[index]).concat(newArray.slice(index+2))
      index++
    }
    return sortInPlace([array[0]].concat(array.slice(2)), newArray)
  }
  if(array[0] <= array[1]){
    newArray.unshift(array[0])
    var index = 0
    while(newArray[index] > newArray[index + 1]){
      if(index === 0){
        if(newArray.length === 2){
          newArray = [newArray[1]].concat(newArray[0])
        } else {
          newArray = [newArray[1]].concat(newArray[0]).concat(newArray.slice(2))
        }
      } else {
        newArray = newArray.slice(0, index).concat(newArray[index+1]).concat(newArray[index]).concat(newArray.slice(index+2))
      }
      index++
      newArray = (index === 0 && newArray.length === 2) ? newArray = [newArray[1]].concat(newArray[0]) :
        (index === 0 && newArray.length !==2) ?  [newArray[1]].concat(newArray[0]).concat(newArray.slice(2)) :
        newArray.slice(0, index).concat(newArray[index+1]).concat(newArray[index]).concat(newArray.slice(index+2))
      return sortInPlace(array.slice(1), newArray)
    }
  }
}

function insertionSort(arr){
  var result = [];
  var currIndex = 0;
  while(currIndex < arr.length){
    if(result.length === 0){
      result.push(arr[currIndex]);
      currIndex++;
      continue;
    }
    for(var i=0; i<result.length; i++){
      if(result[i] <= arr[currIndex]){
        result.splice(i, 0, arr[currIndex]);
        currIndex++;
        break;
      }
    }
  }
  return result;
}

// console.log(sortInPlace([5,1,4,2,3]))
// console.log('This is, a test'.split(","));

const obj = {
  prop1: "Test"
}

console.log(obj["x"]);