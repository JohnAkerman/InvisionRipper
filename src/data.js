const parseData = async (screens) => {
  if (typeof screens === 'undefined' || screens === '' || screens === null) {
    return 'No URL provided'
  }

  screens = JSON.parse(screens)

  if (typeof screens !== 'object') throw new Error('Issue with screen object')

  // if (!argv.silent) console.log(chalk.grey(`Album found, parsing data`))

  var screenData = []
  var stats = {
    count: 0,
    authors: [],
    commentCount: 0,
    lastUpdates: [],
    imgUrls: [],
    archivedCount: 0,
    mobileCount: 0,
    versionCount: 0
  }

  screens.forEach(function (item) {
    var obj = {
      'id': item.id,
      'name': item.name,
      'url': item.imageUrl,
      'clientFilename': item.clientFilename,
      'version': item.imageVersion,
      'created': item.createdAt,
      'createdFriendly': new Date(item.createdAt).toGMTString(),
      'updated': item.updatedAt,
      'updatedFriendly': new Date(item.updatedAt).toGMTString(),
      'updatedby': item.updatedByUserName,
      'height': item.height,
      'width': item.width,
      'isMobile': item.config.isMobile,
      'isArchived': item.isArchived
    }

    screenData.push(obj)

    // Store global stats
    stats.count++

    if (stats.authors.indexOf(item.updatedByUserName) === -1) stats.authors.push(item.updatedByUserName)

    stats.commentCount += item.commentCount
    stats.lastUpdates.push(item.updatedAt)
    stats.imgUrls.push(item.imageUrl)
    stats.archivedCount += (item.isArchived ? 1 : 0)
    stats.mobileCount += (item.config.isMobile ? 1 : 0)
    stats.versionCount += item.imageVersion
  })

  screenData.sort((a, b) => {
    return new Date(b.updated) - new Date(a.updated)
  })

  return {
    stats,
    screenData
  }
}

module.exports = {
  parseData
}
