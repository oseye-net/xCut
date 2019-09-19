import { ContentJs } from './lib/contentJs';

var contentJs = new ContentJs();
chrome.runtime.onMessage.addListener(function (req, sender, res) {
    //debugger;
    if (req.msg=== 'init') {
        contentJs.init();
    }else if(req.msg==='cancle'){
        contentJs.cancle();
    }
    return true;
});