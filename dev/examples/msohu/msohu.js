MX.ready('jquery', 'klass', 'localstorage', function(X, $, Klass, LocalStorage) {
    var $body = $('body');
    
    var IndexView = Klass.define({
        alias: 'msohu.indexview',
        extend: 'view',
        bodyCls: 'index-content',
        templates: [{
            id: 'index-body-template',
            renderToBody: true
        }]
    });
    var IndexController = Klass.define({
        alias: 'msohu.indexcontroller',
        extend: 'controller',
        delegates: {
            'click .nav_tool > a': 'showMessage'
        },
        onPageShow: function() {
            var body = this.getBody();
            this.scroll = X.util.iScrollUtil.createScroll('h', body, {
                snap: true,
                momentum: false,
                hScrollbar: false,
                onScrollMove: function() {
                    var w = window.innerWidth,
                        x = this.x,
                        scale = Math.abs(x) / w;
                    body.css('background-position-x', x > 0 ? 0 : - scale * (w / 8));
                },
                onScrollEnd: function() {
                    var winPage = body.find('.winPage');
                    if (this.currPageX % 2 == 1) {
                        winPage.addClass('rotate');
                    } else {
                        winPage.removeClass('rotate');
                    }
                },
                onTouchEnd: function() {
                    body.one('webkitTransitionEnd transitionend', function() {
                        body.removeClass('slip');
                    });
                    body.addClass('slip');
                    body.css('background-position-x', - this.currPageX * (window.innerWidth / 8));
                }
            });
            showFavourite();
            this.mon(this.getCt(), 'touchstart', this.onTouchStart);
        },
        onPageHide: function() {
            this.mun(this.getCt(), 'touchstart', this.onTouchStart);
        },
        showMessage: function(e) {
            e.preventDefault();
            showMessage('这仅仅是一个demo，没有这个功能');
        },
        onTouchStart: function(e) {
            this.mun(this.getCt(), 'touchmove', this.onTouchMove);
            this.mun(this.getCt(), 'touchend', this.onTouchEnd);
            this.mon(this.getCt(), 'touchmove', this.onTouchMove);
            this.mon(this.getCt(), 'touchend', this.onTouchEnd);
            delete this.touchMoveVertical;
            this.touchCoords = {};
            this.touchCoords.startX = e.originalEvent.touches[0].pageX;
            this.touchCoords.startY = e.originalEvent.touches[0].pageY;
            this.touchCoords.timeStamp = e.timeStamp;
        },
        onTouchMove: function(e) {
            if (!this.touchCoords) {
                return;
            }
            this.touchCoords.stopX = e.originalEvent.touches[0].pageX;
            this.touchCoords.stopY = e.originalEvent.touches[0].pageY;
            var offsetX = this.touchCoords.startX - this.touchCoords.stopX,
                offsetY = this.touchCoords.startY - this.touchCoords.stopY,
                absX = Math.abs(offsetX),
                absY = Math.abs(offsetY),
                isPreventDefault;
            if (MX.isDefined(this.touchMoveVertical)) {
                if (offsetY != 0) {
                    e.preventDefault();
                }
            } else {
                if (absY > absX) {
                    this.touchMoveVertical = true;
                    if (offsetX != 0) {
                        e.preventDefault();
                    }
                } else {
                    delete this.touchCoords;
                    return;
                }
            }
        },
        onTouchEnd: function(e) {
            this.mun(this.getCt(), 'touchmove', this.onTouchMove);
            this.mun(this.getCt(), 'touchend', this.onTouchEnd);
            if (!this.touchCoords) {
                return;
            }
            if (this.touchCoords.stopY - this.touchCoords.startY > 100) {
                showFavourite();
            }
        },
        onDestroy: function() {
            this.callParent();
            this.scroll.destroy();
            this.scroll = null;
        }
    });
    
    var favEl, touchCoords, favCount = 0, resetFavCount, idiotMsg = ['姐姐，别玩了，有意思么', '有时间干点正事吧', '你也太无聊了吧'];
    function showFavourite() {
        if (!favEl) {
            favEl = $('<div class="favourite"><img src="favourite.png" /><div class="cnt">长按图片下载</div></div>');
            $body.append(favEl);
        }
        favEl.one('webkitAnimationEnd animationend', function() {
            favEl.removeClass('animated bounceInDown');
            favEl.css('-webkit-transform', 'translateY(0px)');
            $body.on('touchstart', bodyTouchStart);
        });
        favEl.addClass('animated bounceInDown');
        clearTimeout(resetFavCount);
        favCount++;
        if (favCount > 3) {
            showMessage(idiotMsg[Math.floor(Math.random() * idiotMsg.length)]);
            favCount = 1;
        }
    };
    function bodyTouchStart(e) {
        $body.off('touchmove', bodyTouchMove);
        $body.off('touchend', bodyTouchEnd);
        $body.on('touchmove', bodyTouchMove);
        $body.on('touchend', bodyTouchEnd);
        touchCoords = {};
        touchCoords.startX = e.originalEvent.touches[0].pageX;
        touchCoords.startY = e.originalEvent.touches[0].pageY;
        touchCoords.timeStamp = e.timeStamp;
    };
    function bodyTouchMove(e) {
        e.preventDefault();
        touchCoords.stopX = e.originalEvent.touches[0].pageX;
        touchCoords.stopY = e.originalEvent.touches[0].pageY;
        var y = touchCoords.stopY - touchCoords.startY;
        favEl.css('-webkit-transform', 'translateY(' + (y > 0 ? 0 : y) + 'px)');
    };
    function bodyTouchEnd(e) {
        $body.off('touchmove', bodyTouchMove);
        $body.off('touchend', bodyTouchEnd);
        favEl.one('webkitTransitionEnd transitionend', function() {
            favEl.removeClass('favouriteOut');
        });
        favEl.addClass('favouriteOut');
        if ((touchCoords.stopY < touchCoords.startY && (e.timeStamp - touchCoords.timeStamp < 100)) ||
            (touchCoords.stopY - touchCoords.startY < -100)) {
            $body.off('touchstart', bodyTouchStart);
            favEl.css('-webkit-transform', 'translateY(' + -favEl.height() + 'px)');
            resetFavCount = setTimeout(function() {
                favCount = 0;
            }, 2000);
        } else {
            favEl.css('-webkit-transform', 'translateY(0px)');
        }
    };
    
    var msgEl = $('<div class="lay miniPop" style="opacity: 0; top: 278.5px; visibility: hidden;"><div class="cnt"></div></div>');
    $body.append(msgEl);
    var isMsgElShow;
    function showMessage(msg) {
        if (!isMsgElShow) {
            isMsgElShow = true;
            msgEl.find('.cnt').html(msg || '');
            msgEl.css('visibility', 'visible');
            msgEl.one('webkitTransitionEnd transitionend', function() {
                msgElHideTimeout = setTimeout(function() {
                    msgEl.css('visibility', 'hidden').css('opacity', 0);
                    isMsgElShow = false;
                }, 2000);
            });
            msgEl.css('opacity', 1);
        }
    };
    
    LocalStorage.globalPrefix = 'msohu/';
    
    var config = {
        templateVersion: '1.0',
        templateUrl: 'main.tmpl',
        databaseName: 'msohu',
        databaseDescription: 'msohu offline database',
        databaseExpires: 3 * 24 * 60 * 60 * 1000, // 3天后过期
        models: [
            {
                id: "list-model"
                
            }
        ],
        stores: [
            {
                id: "list-store"
                
            }
        ],
        pagelets: [
            {
                id: 'index-pagelet',
                url: 'h',
                view: 'msohu.indexview',
                controller: 'msohu.indexcontroller',
                transition: 'slidefade'
            }
        ],
        welcome: 'h'
    };
    
    var numEl = $('#startUpView div.num'),
        count = 0,
        countDownTimeout;
    function countDown() {
        count += parseInt(Math.random() * 10 + 1);
        count = count > 100 ? 100 : count;
        numEl.html(count + '%');
        if (count < 100) {
            countDownTimeout = setTimeout(countDown, 70);
        }
    };
    countDown();
    X.App.on('pagechange', function() {
        clearTimeout(countDownTimeout);
        numEl.html('100%');
    }, window, {
        single: true
    });
    
    X.App.launch(config);
});