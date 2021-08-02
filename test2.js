const ANDROID_SDK_PATH = process.env.ANDROID_SDK_ROOT;

const AndroidAutomation = require('.');

(async () => {
    const android = new AndroidAutomation({sdkPath: ANDROID_SDK_PATH});


    async function connectToRobot() {
        await android.forceStop('com.groupeseb.aspirobot');
        await android.runApp('com.groupeseb.aspirobot');

        await android.wait(4000);

        //Open status menu
        let statusIcon = (await android.waitForSelector('//node[@resource-id=\'com.groupeseb.aspirobot:id/title\']'))[0];
        // console.log(statusIcon.attr);
        await statusIcon.click(2000);

        let chargeIcon = (await android.waitForSelector('//node[@resource-id=\'com.groupeseb.aspirobot:id/image\']'))[0];

        //console.log(statusIcon.attr);
        // await statusIcon.click();
    }

    async function getRobotStatus(){

        await connectToRobot();

        let statusesIcons = (await android.$('//node[@resource-id=\'com.groupeseb.aspirobot:id/statuses\']//node[@resource-id=\'com.groupeseb.aspirobot:id/title\']'));

        let [statusText, currentMode] = statusesIcons;

        console.log('Robot status', statusText.attr.text, 'Selected mode', currentMode.attr.text);

        return {status: statusText.attr.text, mode: currentMode.attr.text};
    }

    async function getRobotButtons()
    {
        await connectToRobot();

        let controlButtons = (await android.waitForSelector('//node[@class=\'android.widget.ImageButton\']'));

        let [
            startButton, locateButton, chargeButton,
            freeCleanButton, wallButton, expressCleaningButton
        ] = controlButtons;

        // await locateButton.click();
//

        return {startButton, locateButton, chargeButton,
            freeCleanButton, wallButton, expressCleaningButton};
    }


    let statuses = await getRobotStatus();

    console.log(statuses);

    let buttons = await getRobotButtons();

    await buttons.locateButton.click();
    await buttons.chargeButton.click();


    /* //Get temperatures
     let roomTemp = (await android.waitForSelector('//node[@resource-id=\'com.aigostar.smart:id/tv_cutemperature\']'))[0].attr['text'];
     let targetTemp = (await android.waitForSelector('//node[@resource-id=\'com.aigostar.smart:id/tv_targetTemperature\']'))[0].attr['text'];

     console.log('Room temp:', roomTemp, 'Target temp:', targetTemp);
 */

})();

