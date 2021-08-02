/**
 * AndroidAutomataion
 * Simple nodejs library for Andorid automation
 *
 * Requires uiautomator and Android SDK
 *
 * @author: Andrei Nedobylskii (admin@twister-vl.ru)
 */

const utils = require('util');
const exec = utils.promisify(require('child_process').exec);
const fs = require('fs');

const xpath = require('xpath')
    , dom = require('xmldom').DOMParser

const aaUtils = require('./utils');

class AndroidAutomation {
    constructor(options) {
        options = {...options, sdkPath: process.env.ANDROID_SDK_ROOT, tempPath: '.'}
        this.sdkPath = options.sdkPath;
        this.adb = `${this.sdkPath}/platform-tools/adb`;
        this.tempPath = options.tempPath;
    }

    /**
     * Download screenshot
     * @param {string}  path
     * @returns {Promise<string>}
     */
    async donwloadScreenshot(path = this.tempPath + '/screenshot.png') {
        let screenResult = await exec(`${this.adb} shell screencap -p /data/local/tmp/app.png`);
        //console.log(screenResult);

        let downloadScreenResult = await exec(`${this.adb} pull /data/local/tmp/app.png ${path}`);
        //console.log(downloadScreenResult);

        return path;
    }

    /**
     * Download UIX to specefied path
     * @param {string} path
     * @returns {Promise<string>}
     */
    async downloadUIX(path = this.tempPath + '/currentUI.uix') {
        let screenResult = await exec(`${this.adb} shell uiautomator dump /data/local/tmp/app.uix`);
        //console.log(screenResult);

        let downloadScreenResult = await exec(`${this.adb} pull /data/local/tmp/app.uix ${path}`);

        return path;
    }

    /**
     * Get UIX XML
     * @returns {Promise<string>}
     */
    async getUIX() {
        let uixPath = await this.downloadUIX();
        return fs.readFileSync(uixPath).toString();
    }

    /**
     * XPath selector to UI elements
     * @param {string} selector
     * @returns {Promise<*[SelectorResult]>}
     */
    async $(selector) {
        let uixString = await this.getUIX();
        let doc = new dom().parseFromString(uixString);

        // console.log(doc);

        let nodes = xpath.select(selector, doc);

        // console.log(nodes);

        let selectorResults = [];

        for (let selectorResult of nodes) {
            selectorResults.push(new SelectorResult(this, selectorResult))
        }

        /*if(selectorResults.length === 1){
            selectorResults = selectorResults[0];

            //selectorResults[0] = selectorResults[0];
        }*/

        return selectorResults;
    }

    /**
     * Click (tap) on screen
     * @param {number} x
     * @param {number} y
     * @returns {Promise<void>}
     */
    async tapTouch(x, y) {
        let tapResult = await exec(`${this.adb} shell input tap ${x} ${y}`);
    }
}

/**
 * Element selector result
 */
class SelectorResult {
    constructor(androidAutomation, selectorResult) {
        this.androidAutomation = androidAutomation;
        this.selectorResult = selectorResult;

        //Element attributes
        this.attributes = {};

        for (let i = 0; i < this.selectorResult.attributes.length; i++) {
            let attribute = this.selectorResult.attributes[i];
            this.attributes[attribute.name] = attribute.value;
        }

        //Short version for attributes
        this.attr = this.attributes;

        //Parsed element boundaries
        this.bounds = aaUtils.parseBounds(this.attr['bounds']);
    }

    /**
     * Click on element
     * @returns {Promise<void>}
     */
    async click(timeout = 0) {
        let x = Math.round((this.bounds[0][0] + this.bounds[1][0]) / 2);
        let y = Math.round((this.bounds[0][1] + this.bounds[1][1]) / 2);

        await this.androidAutomation.tapTouch(x, y);

        if(timeout > 0) {
            await aaUtils.wait(500);
        }
    }


}

module.exports = AndroidAutomation;