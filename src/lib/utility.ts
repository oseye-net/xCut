class Utility {
    static doLastError=()=>{
        var res:boolean=true;
        if(chrome.runtime.lastError){
            res=false;
            chrome.browserAction.setPopup({popup:'popup.html'});
        }
        return res;
    }

    static hex2RGB(color: string) {
        // 16进制颜色值的正则
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        // 把颜色值变成小写
        color = color.toLowerCase();
        if (reg.test(color)) {
          // 如果只有三位的值，需变成六位，如：#fff => #ffffff
          if (color.length === 4) {
            var colorNew = "#";
            for (var i = 1; i < 4; i += 1) {
              colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
            }
            color = colorNew;
          }
          // 处理六位的颜色值，转为RGB
          var colorChange = [];
          for (var i = 1; i < 7; i += 2) {
            colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
          }
          return colorChange;
    
        } else {
          throw new Error('color is unvalid');
        }
      }
}
export { Utility }