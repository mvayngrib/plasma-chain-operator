const BN = require('./eth.js').utils.BN
const _ = require('lodash')

function addRange (rangeList, start, end, numSize) {
  if (numSize === undefined) {
    // Default to 16
    numSize = 16
  }
  // Find leftRange (a range which ends at the start of our tx) and right_range (a range which starts at the end of our tx)
  let leftRange
  let rightRange
  let insertionPoint = _.sortedIndexBy(rangeList, start, (n) => n.toString(16, numSize))
  // let insertionPoint = _.sortedIndex  (rangeList, start)
  if (insertionPoint > 0 && rangeList[insertionPoint - 1].eq(start.sub(new BN(1)))) {
    leftRange = insertionPoint - 2
  }
  if (insertionPoint < rangeList.length && rangeList[insertionPoint].eq(end.add(new BN(1)))) {
    rightRange = insertionPoint
  }
  // Set the start and end of our new range based on the deleted ranges
  if (leftRange !== undefined) {
    start = rangeList[leftRange]
  }
  if (rightRange !== undefined) {
    end = rangeList[rightRange + 1]
  }
  // Delete the leftRange and rightRange if we found them
  if (leftRange !== undefined && rightRange !== undefined) {
    rangeList.splice(leftRange + 1, 2)
    return
  } else if (leftRange !== undefined) {
    rangeList.splice(leftRange, 2)
    insertionPoint -= 2
  } else if (rightRange !== undefined) {
    rangeList.splice(rightRange, 2)
  }
  rangeList.splice(insertionPoint, 0, start)
  rangeList.splice(insertionPoint + 1, 0, end)
}

function subtractRange (rangeList, start, end) {
  let affectedRange
  let arStart
  let arEnd
  for (let i = 0; i < rangeList.length; i += 2) {
    arStart = rangeList[i]
    arEnd = rangeList[i + 1]
    if (arStart.lte(start) && end.lte(arEnd)) {
      affectedRange = i
      break
    }
  }
  if (affectedRange === undefined) {
    return false
  }
  // Remove the effected range
  rangeList.splice(affectedRange, 2)
  // Create new sub-ranges based on what we deleted
  if (!arStart.eq(start)) {
    // # rangeList += [arStart, start - 1]
    rangeList.splice(affectedRange, 0, arStart)
    rangeList.splice(affectedRange + 1, 0, start.sub(new BN(1)))
    affectedRange += 2
  }
  if (!arEnd.eq(end)) {
    // # rangeList += [end + 1, arEnd]
    rangeList.splice(affectedRange, 0, end.add(new BN(1)))
    rangeList.splice(affectedRange + 1, 0, arEnd)
  }
  return true
}

module.exports = {
  addRange,
  subtractRange
}
