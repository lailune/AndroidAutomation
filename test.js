const ANDROID_SDK_PATH = process.env.ANDROID_SDK_ROOT;

const AndroidAutomation = require('.');

(async () => {
    const android = new AndroidAutomation({sdkPath: ANDROID_SDK_PATH});



    let coolerButton = (await android.$('//node[@resource-id=\'com.aigostar.smart:id/tv_tuya_home_list_name\']'))[0];

    console.log(coolerButton);

    await coolerButton.click();

    let onbutton = (await android.$('//node[@resource-id=\'com.aigostar.smart:id/tool_switch\']'))[0];
    await android.donwloadScreenshot('./test.png');
    console.log('ONBTN', onbutton)

    await onbutton.click();

    //console.log(await android.getUIX());
})();

