<h1 align="center">InvisionRipper</h1>

<p align="center">
<a href="https://travis-ci.org/JohnAkerman/InvisionRipper"><img src="https://travis-ci.org/JohnAkerman/InvisionRipper.svg?branch=master" alt="Travis Build Status"></a> <a href="https://github.com/JohnAkerman/InvisionRipper/blob/master/LICENSE"><img src="https://img.shields.io/github/license/JohnAkerman/InvisionRipper.svg" alt="GitHub license"></a> <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
  <a href="https://snyk.io/test/github/JohnAkerman/InvisionRipper"><img src="https://snyk.io/test/github/JohnAkerman/InvisionRipper/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/JohnAkerman/InvisionRipper" style="max-width:100%;"></a>
</p>

Design extractor tool in Node JS for Invision albums


## Install

```
$ npm i
```

## Usage

After you've installed `invisionripper` you will be able to use the program via the command line. The most basic usage would be to get when the last updated screen by running

```
$ node index.js --url <url> --lastUpdate
Last update was 2 days ago by John on Homepage 2018
```

## Purpose
This tool can help assist your usage of albums by performing a multitude of actions on it. This tool can help you:
- **Extract images.** Save all the screens from an album locally in JPG format
- **Show statistics.** Display useful information the album such as who the authors are or how many comments there are.

## Commands

Name | Alias | Type | Description | Default
--- | :---: | :---: | ---
``--title`` | `-t` | string |  Name given to the top level export folder | N/A
``--images`` | `-i` | string |  Name given to the top level export folder | images
``--report`` | `-r` | string |  The filename of the extracted report file. JSON file extended not needed | report
``--stats`` | `-s` | boolean |  Whether to show detailed statistics about album | false
``--dated`` | `-d` | boolean |  Whether the exported files should be saved in a dated subfolder. Format: YYYY-MM-DD--HH-mm | false
``--lastUpdate`` | N/A | boolean |  Get the last updated screen with stats | N/A
``--silent`` | N/A | boolean |  Whether to show minimal logging in the console | false
