class ContentJs {
    private fakeImgId: string = 'fake-image';
    private selection: any;
    private jcrop: any;
    private timeout: any;
    init = () => {
        debugger;
        let fakeImg = document.querySelector('#' + this.fakeImgId);
        if (!fakeImg) {
            this.addFakeImage(() => {
                chrome.runtime.sendMessage({ msg: 'init-ok' }, (res) => {
                    if (res) {
                        this.jCropSetting(() => {
                            this.showJcropHolder(true);
                        });
                    }
                });
            });
        } else {
            chrome.runtime.sendMessage({ msg: 'init-ok' }, (res) => {
                if (res) {
                    this.showJcropHolder(true);
                }
            });
        }
    }

    cancle = () => {
        //this.jcrop.release();
        this.showJcropHolder(false);
        this.selection = null;
    }

    private addFakeImage = (done: Function) => {
        let fakeImage = new Image();
        fakeImage.id = this.fakeImgId;
        fakeImage.src = chrome.runtime.getURL('/assets/images/pixel.png');
        fakeImage.onload = () => {
            document.body.append(fakeImage);
            done();
        }
    }

    private jCropSetting = (done: Function) => {
        var tmpThis = this;
        (<any>$('#' + this.fakeImgId)).Jcrop({
            bgColor: 'none',
            onSelect: (e: any) => {
                this.selection = e;
                this.capture();
            },
            onChange: (e: any) => {
                this.selection = e;
            },
            onRelease: (e: any) => {
                this.selection = null;
            }
        }, function () {
            tmpThis.jcrop = this;
            $('.jcrop-hline, .jcrop-vline').css({
                backgroundImage: `url(${chrome.runtime.getURL('/assets/images/Jcrop.gif')})`
            });
            done && done();
        });
    }

    private showJcropHolder = (actiove: boolean) => {
        $('.jcrop-holder')[actiove ? 'show' : 'hide']();
    }

    private capture = () => {
        if (this.selection) {
            this.showJcropHolder(false);
            if (this.timeout) { clearTimeout(this.timeout); }
            this.timeout = setTimeout(() => {
                var msg = { msg: 'capture', area: this.selection, dpr: devicePixelRatio };
                this.jcrop.release();
                chrome.runtime.sendMessage(msg, (res) => {
                    this.selection = null;
                    //this.save(res.image, 'png', 'file');
                });
            }, 100);
        }
    }


}

export { ContentJs }