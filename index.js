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

    /**
     * Keys codes
     * @type {{KEYCODE_ALT_RIGHT: string, KEYCODE_SYM: string, KEYCODE_AT: string, KEYCODE_DPAD_UP: string, KEYCODE_MINUS: string, KEYCODE_ENVELOPE: string, KEYCODE_COMMA: string, KEYCODE_DPAD_DOWN: string, KEYCODE_EQUALS: string, KEYCODE_Y: string, KEYCODE_DPAD_LEFT: string, KEYCODE_Z: string, KEYCODE_W: string, KEYCODE_X: string, KEYCODE_U: string, KEYCODE_UNKNOWN: string, KEYCODE_V: string, KEYCODE_S: string, KEYCODE_T: string, KEYCODE_SHIFT_LEFT: string, TAG_LAST_KEYCODE: string, KEYCODE_VOLUME_UP: string, KEYCODE_LEFT_BRACKET: string, KEYCODE_PLUS: string, KEYCODE_BACKSLASH: string, KEYCODE_CLEAR: string, KEYCODE_ENDCALL: string, KEYCODE_GRAVE: string, KEYCODE_HEADSETHOOK: string, KEYCODE_POWER: string, KEYCODE_POUND: string, KEYCODE_DPAD_CENTER: string, KEYCODE_NUM: string, KEYCODE_EXPLORER: string, KEYCODE_SLASH: string, KEYCODE_BACK: string, KEYCODE_1: string, KEYCODE_2: string, KEYCODE_SHIFT_RIGHT: string, KEYCODE_SEMICOLON: string, KEYCODE_0: string, KEYCODE_DEL: string, KEYCODE_CALL: string, KEYCODE_NOTIFICATION: string, KEYCODE_VOLUME_DOWN: string, KEYCODE_RIGHT_BRACKET: string, KEYCODE_SPACE: string, KEYCODE_I: string, KEYCODE_STAR: string, KEYCODE_J: string, KEYCODE_G: string, KEYCODE_PERIOD: string, KEYCODE_H: string, KEYCODE_E: string, KEYCODE_F: string, KEYCODE_C: string, KEYCODE_D: string, KEYCODE_Q: string, KEYCODE_R: string, KEYCODE_O: string, KEYCODE_P: string, KEYCODE_M: string, KEYCODE_ENTER: string, KEYCODE_N: string, KEYCODE_K: string, KEYCODE_L: string, KEYCODE_SOFT_RIGHT: string, KEYCODE_9: string, KEYCODE_APOSTROPHE: string, KEYCODE_MENU: string, KEYCODE_TAB: string, KEYCODE_7: string, KEYCODE_FOCUS: string, KEYCODE_HOME: string, KEYCODE_8: string, KEYCODE_ALT_LEFT: string, KEYCODE_5: string, KEYCODE_6: string, KEYCODE_CAMERA: string, KEYCODE_3: string, KEYCODE_SEARCH: string, KEYCODE_4: string, KEYCODE_A: string, KEYCODE_B: string, KEYCODE_DPAD_RIGHT: string}}
     */
    KEY_CODE = aaUtils.KEY_CODES;

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

    /**
     * Write text to form
     * @param {string} text
     * @returns {Promise<void>}
     */
    async writeText(text) {

        let tapResult = await exec(`${this.adb} shell input text '${JSON.stringify(text)}'`);
    }

    /**
     * Send key event
     * @param {string|number} keyCode Key code from KEY_CODES
     * @returns {Promise<void>}
     */
    async key(keyCode) {

        let tapResult = await exec(`${this.adb} shell input keyevent ${keyCode}`);
    }

    /**
     * Wait for selector available
     * @param {string} selector
     * @returns {Promise<SelectorResult[]>}
     */
    async waitForSelector(selector) {
        let selectorResult;
        while (true) {
            selectorResult = await this.$(selector);

            if(selectorResult.length !== 0) {
                return selectorResult;
            }

            await aaUtils.wait();
        }
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