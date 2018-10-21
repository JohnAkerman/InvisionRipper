<h1 align="center">InvisionRipper</h1>

<p align="center">
  <a href="https://github.com/JohnAkerman/InvisionRipper/blob/master/LICENSE"><img src="https://img.shields.io/github/license/JohnAkerman/InvisionRipper.svg" alt="GitHub license"></a> <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
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
