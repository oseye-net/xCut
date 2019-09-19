import FreeDrawing from './lib/freeDrawing';
import { Utility } from './lib/utility';

document.getElementById('editor-desc').innerHTML=chrome.i18n.getMessage('editorDesc');
document.getElementById('editor-save').innerHTML=chrome.i18n.getMessage('editorSave');
document.getElementById('editor-copyright').innerHTML=chrome.i18n.getMessage('editorCopyright');
document.getElementById('editor-undo').setAttribute('title',chrome.i18n.getMessage('editorUndo'));
document.getElementById('editor-redo').setAttribute('title',chrome.i18n.getMessage('editorRedo'));

var fileName = (format: string) => {
    return 'xCut-'+formatDate('yyyy-MM-dd-hhmmss', new Date()) + '.' + format;
}

var formatDate = (fmt: string, date: Date) => {
    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

chrome.storage.local.get('imageData', (res) => {
    var imag = new Image();
    imag.src = res.imageData;
    imag.onload = () => {
        var cfd = new FreeDrawing({
            elementId: 'canvas',
            width: imag.width,
            height: imag.height,
        });
        cfd.context.drawImage(imag, 0, 0);
        cfd.storeSnapshot();

        cfd.setLineWidth(2);
        cfd.setStrokeColor([255, 0, 0]);

        document.getElementById('editor-undo').onclick = (el) => {
            if (cfd.snapshots.length > 2) {
                cfd.undo();
            }
        }

        document.getElementById('editor-redo').onclick = () => {
            cfd.redo();
        }

        document.getElementById('editor-save').onclick=()=>{
            chrome.downloads.download({url:cfd.save(),saveAs:true,filename:fileName('png')});
        }

        var colorBtns = document.querySelectorAll('.colorBtn');
        for (var i = 0; i < colorBtns.length; i++) {
            (<HTMLElement>colorBtns[i]).onclick = function (ev) {
                var color = (<HTMLElement>ev.target).getAttribute('color');
                cfd.setStrokeColor(Utility.hex2RGB(color));
            }
        }
    }
})
