// Example Links
// https://invis.io/NQ8979O8R
// https://projects.invisionapp.com/share/2B7ZYDVZ
// https://in.invisionapp.com/share/X28MGQD4Y

const checkUrl = async (url) => {
  if (typeof url === 'undefined' || url === null || url === '' || typeof url !== 'string') {
    return 'No URL provided'
  }

  if (url.indexOf('projects.invisionapp.com/share/') === -1 &&
  url.indexOf('invis.io/') === -1 &&
  url.indexOf('in.invisionapp.com/share/') === -1) {
    return 'URL not recognised, only invision links are supported'
  }

  return true
}

module.exports = {
  checkUrl
}
