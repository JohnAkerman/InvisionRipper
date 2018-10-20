const puppeteer = require('puppeteer');

(async() => {

    try {
        const browser = await puppeteer.launch( { timeout: 5000 });
        const page = await browser.newPage();

        const url  = 'https://projects.invisionapp.com/share/57IICR3YUGP#/';

        console.log('Loading page...');

        await page.goto(url, { waitUntil: 'networkidle2'});

        const result = await page.evaluate(
            () => JSON.stringify(InvScreenViewer.store.screens)
        );

        if (typeof result === "undefined" || result == null)
            throw "Could not extract screen data from page";

        const parsedData = await parseData(result);

        console.log(parsedData.stats);

        await page.close();
        await browser.close();

    } catch (e) {
        console.log("Ripper Error", e);
    }
})();


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
        mobileCount: 0
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

        // Store global stats
        stats.count++;

        if (stats.authors.indexOf(item.updatedByUserName) === 0)
            stats.authors.push(item.updatedByUserName);

        stats.commentCount += item.commentCount;
        stats.lastUpdates.push(item.updatedAt);
        stats.imgUrls.push(item.imageUrl);
        stats.archivedCount += (item.isArchived ? 1 : 0);
        stats.mobileCount += (item.config.isMobile ? 1 : 0);

        screenData.push(obj);
    });

    return {
        stats,
        screenData
    };
}
