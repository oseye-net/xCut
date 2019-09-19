import { Utility } from './utility';
class BackGroundJs {
    justPopup: boolean;


    doit = () => {
        chrome.tabs.onCreated.addListener(this.checkTabStatus);
        chrome.tabs.onUpdated.addListener(this.checkTabStatus);
        chrome.tabs.onActivated.addListener(this.checkTabStatus);

        chrome.browserAction.onClicked.addListener((tab) => {
            if (!this.justPopup) {
                chrome.browserAction.getBadgeText({ tabId: tab.id }, (text) => {
                    text = text.toLowerCase().trim();
                    if (text.length == 0) {
                        this.inject(tab);
                    } else {
                        this.cance(tab);
                    }
                })
            }
        });

        chrome.runtime.onMessage.addListener((req, sender, res) => {
            this.doMessage(req, sender, res);
            return true;
        });
    }

    cance = (tab) => {
        chrome.browserAction.setBadgeText({ text: '' });
        chrome.tabs.sendMessage(tab.id, { msg: 'cancle' });
    }

    doMessage = (req, sender, res) => {
        if (req.msg === 'init-ok') {
            chrome.tabs.insertCSS(sender.tab.id, { file: 'vendor/jquery.Jcrop.min.css', runAt: 'document_start' }, () => {
                chrome.tabs.insertCSS(sender.tab.id, { file: 'assets/css/content.css', runAt: 'document_start' }, () => {
                    chrome.tabs.executeScript(sender.tab.id, { file: 'vendor/jquery.min.js', runAt: 'document_start' }, () => {
                        chrome.tabs.executeScript(sender.tab.id, { file: 'vendor/jquery.Jcrop.min.js', runAt: 'document_start' }, () => {
                            res({ msg: 'inject-ok' });
                        });
                    });
                });
            });

        }
        else if (req.msg === 'capture') {
            chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png', quality: 100 }, (image) => {
                // image is base64
                this.crop(image, req.area, req.dpr, 1, 'png', (cropped) => {
                    chrome.storage.local.set({ 'imageData': cropped }, () => {
                        chrome.tabs.create({ url: 'editor.html' });
                    });

                    res({ msg: 'image', image: cropped })
                    chrome.browserAction.setBadgeText({ text: '' });
                })
            })
        }
        //return true
    }


    inject(tab: chrome.tabs.Tab) {
        chrome.tabs.executeScript(tab.id, { file: 'content.js', runAt: 'document_start' }, () => {
            //if (Utility.doLastError()) {
            chrome.tabs.sendMessage(tab.id, { msg: 'init' });
            chrome.browserAction.setBadgeText({ text: 'ON' });
            //}
        });
    }

    checkTabStatus() {
        chrome.browserAction.setBadgeText({ text: '' });
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0 && /http(s?):\/\//.test(tabs[0].url.toLowerCase()) && !tabs[0].url.toLowerCase().startsWith("https://chrome.google.com")) {
                this.justPopup = false;
                chrome.browserAction.setPopup({ popup: '' });
            } else {
                this.justPopup = true;
                chrome.browserAction.setPopup({ popup: 'alter.html' });
            }
        })
    }

    crop = (image: string, area: any, dpr: any, preserve: any, format: string, done: Function) => {
        var top = area.y * dpr
        var left = area.x * dpr
        var width = area.w * dpr
        var height = area.h * dpr
        var w = (dpr !== 1 && preserve) ? width : area.w
        var h = (dpr !== 1 && preserve) ? height : area.h

        var canvas = null
        if (!canvas) {
            canvas = document.createElement('canvas')
            document.body.appendChild(canvas)
        }
        canvas.width = w
        canvas.height = h

        var img = new Image()
        img.src = image
        img.onload = () => {
            var context = canvas.getContext('2d')
            context.drawImage(img,
                left, top,
                width, height,
                0, 0,
                w, h
            )

            var cropped = canvas.toDataURL(`image/${format}`)
            done(cropped)
        }
    }
}
export { BackGroundJs }