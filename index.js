/* global InvScreenViewer */

const puppeteer = require('puppeteer')
const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')
const request = require('request')
const ProgressBar = require('progress')
const Moment = require('moment')
const http = require('http')
const handlebars = require('handlebars')

const argv = require('yargs')
  .usage('Usage: <url> [options]')
  .help('help')
  .alias('help', 'h')
  .option('url', {
    alias: 'u',
    description: 'URL to InvisionApp album',
    type: 'string'
  })
  .option('title', {
    alias: 't',
    default: 'data',
    description: 'Name given to the top level export folder',
    type: 'string'
  })
  .option('images', {
    alias: 'i',
    default: 'images',
    description: 'Folder location to save images',
    type: 'string'
  })
  .option('report', {
    alias: 'r',
    default: 'report',
    description: 'The filename of the extracted report file. JSON file extended not needed',
    type: 'string'
  })
  .option('stats', {
    alias: 's',
    default: false,
    description: 'Whether to show detailed statistics about album',
    type: 'boolean'
  })
  .option('dated', {
    alias: 'd',
    default: false,
    description: 'Whether the exported files should be saved in a dated subfolder. Format: YYYY-MM-DD--HH-mm',
    type: 'boolean'
  })
  .option('lastUpdate', {
    description: 'Get the last updated screen with stats',
    type: 'boolean'
  })
  .option('silent', {
    default: false,
    description: 'Whether to show minimal logging in the console',
    type: 'boolean'
  })
  .option('reportViewer', {
    description: 'Path to report file used to show html',
    type: 'string'
  })
  .example('$0 --stats --export -u <url>').argv

global.argv = argv

const Data = require('./src/data.js')
const Url = require('./src/url.js')

// Load report file
// Parse screen data
// start a local server
// render data into html file to provide brief view
// link to individual files from album
// options - provide report on file or via album
const loadReport = async (path) => {
  let reportData = null

  try {
    reportData = await fs.readJson(path)
    return reportData
  } catch (err) {
    console.error(err)
    return null
  }
}

const reportViewee = async () => {
  if (!argv.reportViewer) return console.error('No report path provided')

  const reportPath = argv.reportViewer
  const reportData = await loadReport(reportPath)

  const markup = await generateReportMarkup(reportData)

  // Initialise server
  let server = http.createServer(function (req, resp) {
    resp.writeHead(200, { 'Content-Type': 'text/html' })
    resp.write('Hello World')
    resp.write(markup)
    resp.end()
  })

  server.listen(3000)
}

const generateReportMarkup = async (data) => {
  const screenStr = '{{#each screenData}}<div class=\'screen\'><h2>{{name}}</h2><h3>v{{version}}</h3></div>{{/each}}'
  const screenTemplate = handlebars.compile(screenStr)
  const screenMarkup = screenTemplate(data)

  return screenMarkup
}

const main = async () => {
  try {
    let browser = null
    let page = null

    if (argv.url) {
      browser = await puppeteer.launch({ timeout: 5000 })
      page = await browser.newPage()
      const url = argv.url
      let result = null

      const urlCheck = await Url.checkUrl(url)
      if (urlCheck !== true) {
        console.log(chalk.red(urlCheck))
        return false
      }

      if (!argv.silent) console.log(chalk.grey(`Loading album: ${url}`))

      try {
        await page.goto(url, { waitUntil: 'networkidle2' })
        await page.waitFor(5000)
        result = await page.evaluate(() => JSON.stringify(InvScreenViewer.store.screens))
      } catch (err) {
        console.log(chalk.red('This album link is no longer valid.'))
        await page.close()
        await browser.close()
        return false
      }

      if (typeof result === 'undefined' || result == null) throw new Error('Could not extract screen data from page')

      const parsedData = await Data.parseData(result)

      if (argv.stats) displayStats(parsedData)
      if (argv.lastUpdate) getLastUpdate(parsedData)
      if (argv.images) exportImages(parsedData)
      if (argv.report) exportReport(parsedData)
    }

    if (argv.reportViewer) {
      console.log('running')
      reportViewee()
    }

    if (!argv.stats &&
    !argv.images &&
    !argv.report &&
    !argv.lastUpdate &&
    !argv.reportViewer) {
      console.log(chalk.yellow('No command provided, exiting'))
    }

    if (argv.url) {
      await page.close()
      await browser.close()
    }
  } catch (err) {
    console.log('InvisionRipper', err)
  }
}
main()

const exportImages = async ({ screenData }) => {
  let start = new Moment()
  let downloadCount = 0
  let downloadTotal = screenData.length

  let progressBar = new ProgressBar(chalk.yellow('Downloading') + ' [:bar] :percent', {
    complete: chalk.green('='),
    incomplete: chalk.grey(' '),
    total: downloadTotal
  })

  let screens = screenData

  const downloadQueue = screens.map(async screen => {
    const imageData = await downloadFile(screen.url)
    await saveFile(imageData, screen.name)
    progressBar.tick()
    downloadCount++
  })

  await Promise.all(downloadQueue)

  let finished = new Moment()
  let duration = Moment.duration(finished.diff(start))

  if (!argv.silent) console.log(`\n${chalk.grey('Downloaded')} ${chalk.blue(downloadCount)} ${chalk.grey('screens in ' + duration.humanize())}`)
}

const downloadFile = async (url) => {
  return new Promise((resolve, reject) => {
    request({
      url,
      'encoding': null
    }, (err, res, body) => {
      if (res && (res.statusCode === 200 || res.statusCode === 201) && body) {
        resolve(body)
      } else {
        reject(err)
      }
    })
  })
}

const saveFile = async (data, filename) => {
  let datedFolder = await displayDate()
  let folderName = 'data'

  if (argv.title) folderName += '/' + argv.title
  if (argv.dated) folderName += '/' + datedFolder

  await fs.ensureDir(folderName)
  await fs.outputFile(folderName + '/' + path.basename(filename) + '.jpg', data, 'binary', (err) => {
    if (err) throw new Error('File Save Error: ' + err)
  })
}

const displayDate = async () => {
  return Moment().format('YYYY-MM-DD--HH-mm')
}

const displayStats = async ({ stats, screenData }) => {
  console.log('')
  console.log(chalk.grey('Stats'))
  console.log(chalk.grey('-----'))
  console.log(chalk.grey(`${stats.count} Screens`))
  console.log(chalk.grey(`${stats.commentCount} Comments`))
  console.log(chalk.grey(`${stats.archivedCount} Archived`))
  console.log(chalk.grey(`${stats.versionCount} Versions`))
  console.log(chalk.grey(`Authors: ${stats.authors.join()}`))
  console.log(chalk.grey(`Last updated ${Moment(screenData[0].updated).fromNow()} - ${screenData[0].name}`))
  console.log('')
}

const getLastUpdate = async ({ screenData }) => {
  console.log(chalk.grey(`Last update was ${Moment(screenData[0].updated).fromNow()} by ${screenData[0].updatedby} on ${screenData[0].name}`))
}

const exportReport = async ({ stats, screenData }) => {
  if (!argv.report) return

  let datedFolder = await displayDate()
  let folderName = 'data'

  if (argv.title) folderName += '/' + argv.title
  if (argv.dated) folderName += '/' + datedFolder

  // Clean unwanted items from save data
  delete stats.lastUpdates
  delete stats.imgUrls

  for (var screen of screenData) {
    delete screen.url
    delete screen.createdFriendly
    delete screen.updatedFriendly
  }

  try {
    await fs.ensureDir(folderName)
    await fs.writeJson(`${folderName}/${argv.report}.json`, {
      stats,
      screenData
    })

    if (!argv.silent) console.log(chalk.green(`Report data saved to ${folderName}/${argv.report}.json`))
  } catch (err) {
    console.error(err)
  }
}
