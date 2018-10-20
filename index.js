const puppeteer = require('puppeteer');
const chalk = require('chalk');

const argv = require('yargs')
    .usage('Usage: <url> [options]')
    .help('h')
    .option('url', {
        alias: 'u',
        default: 'https://projects.invisionapp.com/share/57IICR3YUGP',
        description: 'URL to InvisionApp album',
        type: 'string'
    })
    .option('format', {
        default: 'png',
        choices: ['jpeg', 'png'],
        description: 'File format to save screenshots',
    })
    .option('output', {
		alias: 'o',
		default: 'screenshots',
		description: 'Folder location to save screenshots',
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
    .example('$0 -stats true -o ETX -u https://projects.invisionapp.com/share/57IICR3YUGP')
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

        const result = await page.evaluate(
            () => JSON.stringify(InvScreenViewer.store.screens)
        );

        if (typeof result === "undefined" || result == null)
            throw "Could not extract screen data from page";

        const parsedData = await parseData(result);

        if (argv.stats)
            displayStats(parsedData.stats, parsedData.screenData);

        // if (argv.images)
        //     exportImages(parsedData);

        await page.close();
        await browser.close();

    } catch (e) {
        console.log("Ripper Error:", e);
        return false;
    }
})();

const exportImages = async (data) => {

};


const parseData = async (screens) => {

    screens = JSON.parse(screens);

    if (typeof screens !== "object")
        throw "Issue with screen object";

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

        if (stats.authors.indexOf(item.updatedByUserName) === -1)
            stats.authors.push(item.updatedByUserName);

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
    console.log(chalk.grey('Stats'));
    console.log(chalk.grey('====='));
    console.log(chalk.grey(`${stats.count} Screens`));
    console.log(chalk.grey(`${stats.mobileCount} Mobile`));
    console.log(chalk.grey(`${stats.commentCount} Comments`));
    console.log(chalk.grey(`${stats.archivedCount} Archived`));
    console.log(chalk.grey(`${stats.versionCount} Versions`));
    console.log(chalk.grey(`Authors: ${stats.authors.join()}`));
    console.log(chalk.grey(`Last Update: ${screenData[0].updatedFriendly} - ${screenData[0].name}`));
};
