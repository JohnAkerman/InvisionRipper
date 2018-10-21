/* global describe, it */
const Url = require('../src/url.js')
const assert = require('assert')

describe('#checkUrl()', () => {
  it('should detect when an empty url is provided', async () => {
    assert(Url.checkUrl(''), 'No URL provided')
  })

  it('should detect when undefined is provided', async () => {
    assert(Url.checkUrl(undefined), 'No URL provided')
  })

  it('should detect when null is provided', async () => {
    assert(Url.checkUrl(null), 'No URL provided')
  })

  it('should be a valid share url', async () => {
    assert(Url.checkUrl('https://in.invisionapp.com/share/X28MGQD4Y'), true)
  })

  it('should be a valid invision url', async () => {
    assert(Url.checkUrl('https://invis.io/NQ8979O8R'), true)
  })

  it('should be an invalid url', async () => {
    assert(Url.checkUrl('https://www.google.com'), true)
  })
})
