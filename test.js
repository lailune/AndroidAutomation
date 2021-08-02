const ANDROID_SDK_PATH = process.env.ANDROID_SDK_ROOT;

const AndroidAutomation = require('.');

(async () => {
    const android = new AndroidAutomation({sdkPath: ANDROID_SDK_PATH});


    await android.forceStop('com.aigostar.smart');
    await android.runApp('com.aigostar.smart');

    //Press login by google button
    let loginButton = (await android.waitForSelector('//node[@resource-id=\'com.aigostar.smart:id/iv_login_google\']'))[0];
    await loginButton.click();

    //Select first account
    let accountButton = (await android.waitForSelector('//node[@resource-id=\'com.google.android.gms:id/container\']'))[0]
    await accountButton.click();

    //Select cooler after login
    let coolerButton = (await android.waitForSelector('//node[@resource-id=\'com.aigostar.smart:id/tv_tuya_home_list_name\']'))[0];
    await coolerButton.click(2000);

    //Conditioner off state
    if((await android.$('//node[@resource-id=\'com.aigostar.smart:id/tv_cutemperature\']')).length === 0) {

        console.log((await android.$('//node[@resource-id=\'com.aigostar.smart:id/tv_cutemperature\']')));

        //Switch on conditioner
        let onbutton = (await android.waitForSelector('//node[@resource-id=\'com.aigostar.smart:id/tool_switch\']'))[0];
        await android.donwloadScreenshot('./test.png');
       // console.log('ONBTN', onbutton)

       await onbutton.click();
    }

    //Get temperatures
    let roomTemp = (await android.waitForSelector('//node[@resource-id=\'com.aigostar.smart:id/tv_cutemperature\']'))[0].attr['text'];
    let targetTemp = (await android.waitForSelector('//node[@resource-id=\'com.aigostar.smart:id/tv_targetTemperature\']'))[0].attr['text'];

    console.log('Room temp:', roomTemp, 'Target temp:', targetTemp);

    /* let inputText = (await android.$('//node[@resource-id=\'com.google.android.googlequicksearchbox:id/hint_text_alignment\']'))[0];
     await inputText.click();

     await android.writeText('"Hello world!"' );

     await android.key(android.KEY_CODE.KEYCODE_ENTER);*/


    //console.log(await android.getUIX());
})();

