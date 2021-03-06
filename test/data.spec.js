/* global describe, it */
const Data = require('../src/data.js')
const assert = require('assert')
// const { expect } = require('chai')

describe('#parseData()', () => {
  it('should error when no data is provided', async () => {
    assert(await Data.parseData(''), 'No album data provided')
  })

  it('should error when undefined data is provided', async () => {
    assert(await Data.parseData(undefined), 'No album data provided')
  })

  // it('should error when numbers are provided', async () => {
  //   await expect(async () => Data.parseData(123)).to.throw(Error, 'Issue with screen object')
  // })
})

// function t (x) {
//   throw new Error('Issue with screen object')
// }
