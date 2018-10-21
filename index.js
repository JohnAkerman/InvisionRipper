const puppeteer = require('puppeteer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const request = require('request');
const ProgressBar = require('progress');
const moment = require('moment');

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
        description: 'Project title used as a top level export folder',
        type: 'string'
    })
    .option('images', {
		alias: 'i',
		default: 'images',
		description: 'Folder location to save images',
        type: 'string'
	})
    .option('stats', {
        alias: 's',
        default: false,
        description: 'Whether to show detailed statistics about album',
        type: 'boolean'
    })
    .option('export', {
        alias: 'e',
        default: false,
        description: 'Whether to export and download images',
        type: 'boolean'
    })
    .example('$0 --stats --export -u <url>')
    .argv;

(async() => {

    try {
        const browser = await puppeteer.launch( { timeout: 5000 });
        const page = await browser.newPage();

        const url  = argv.url;

        if (typeof url === "undefined" || url === null || url === "")
            throw 'No URL of album provided';

        console.log(chalk.grey(`Loading album: ${url}`));
        await page.goto(url, { waitUntil: 'networkidle2'});

        const result = await page.evaluate( () => JSON.stringify(InvScreenViewer.store.screens));

        if (typeof result === "undefined" || result == null)
            throw "Could not extract screen data from page";

        console.log(chalk.grey(`Parsing album data`));

        const parsedData = await parseData(result);

        if (argv.stats)
            displayStats(parsedData.stats, parsedData.screenData);

        if (argv.export)
            exportImages(parsedData);

        if (!argv.stats && !argv.export) {
            console.log(chalk.yellow('No command provided, exiting'));
        }

        await page.close();
        await browser.close();

    } catch (e) {
        console.log("Ripper Error:", e);
        return false;
    }
})();

const exportImages = async (data) => {
    let start = new moment();

    let downloadCount = 0;
    let downloadTotal = data.screenData.length;

    let progressBar = new ProgressBar(chalk.yellow('Downloading') + ' [:bar] :percent', {
        complete: chalk.green('='),
        incomplete: chalk.grey(' '),
        total: downloadTotal
    });

    let screens = data.screenData;

    const downloadQueue = screens.map(async screen => {
        const imageData = await downloadFile(screen.url);
        await saveFile(imageData, screen.name);
        progressBar.tick();
        downloadCount++;
    });

    await Promise.all(downloadQueue);

    let finished = new moment();
    let duration = moment.duration(finished.diff(start));

    console.log(`\n${chalk.grey('Downloaded')} ${chalk.blue(downloadCount)} ${chalk.grey('screens in ' + duration.humanize())}`);
};

const downloadFile = async (url) => {

    return new Promise( (resolve, reject) => {
        request({ url, 'encoding': null }, (err, res, body) => {
            if (res.statusCode === 200 || res.statusCode === 201 && body) {
                resolve(body);
            } else {
                reject(err);
            }
        });
    });
};

const saveFile = async (data, filename) => {
    let datedFolder = await displayDate();
    let folderName = argv.images

    if (argv.title) folderName += '/' + argv.title;

    folderName += '/' + datedFolder;

    await fs.ensureDir(folderName)
    await fs.outputFile(folderName + '/' + path.basename(filename) + '.jpg', data, 'binary', (err) => {
        if (err) throw "File Save Error: " + err;
    });
};

const displayDate = async () => {
    return moment().format('YYYY-MM-DD--HH-mm');
}

const parseData = async (screens) => {
    screens = JSON.parse(screens);

    if (typeof screens !== "object") throw "Issue with screen object";

    var screenData = [];
    var stats = {
        count: 0,
        authors: [],
        commentCount: 0,
        projectIds: [],
        lastUpdates: [],
        imgUrls: [],
        archivedCount: 0,
        mobileCount: 0,
        versionCount: 0,
        versionDates: []
    }

    screens.forEach(function(item) {
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
        };

        screenData.push(obj);

        // Store global stats
        stats.count++;

        if (stats.authors.indexOf(item.updatedByUserName) === -1) stats.authors.push(item.updatedByUserName);

        stats.commentCount += item.commentCount;
        stats.lastUpdates.push(item.updatedAt);
        stats.imgUrls.push(item.imageUrl);
        stats.archivedCount += (item.isArchived ? 1 : 0);
        stats.mobileCount += (item.config.isMobile ? 1 : 0);
        stats.versionCount += item.imageVersion;
    });

    screenData.sort((a, b) => {
        return new Date(b.updated) - new Date(a.updated);
    });

    return {
        stats,
        screenData
    };
};

const displayStats = async (stats, screenData) => {
    console.log('');
    console.log(chalk.grey('Stats'));
    console.log(chalk.grey('-----'));
    console.log(chalk.grey(`${stats.count} Screens`));
    console.log(chalk.grey(`${stats.mobileCount} Mobile`));
    console.log(chalk.grey(`${stats.commentCount} Comments`));
    console.log(chalk.grey(`${stats.archivedCount} Archived`));
    console.log(chalk.grey(`${stats.versionCount} Versions`));
    console.log(chalk.grey(`Authors: ${stats.authors.join()}`));
    console.log(chalk.grey(`Last updated ${moment(screenData[0].updated).fromNow()} - ${screenData[0].name}`));
    console.log('');
};
