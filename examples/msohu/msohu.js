MX.ready('jquery', 'klass', 'localstorage', 'iscrollutil', 'touchholder', 
function(X, $, Klass, LocalStorage, iScrollUtil, TouchHolder) {
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
        onPageShow: function() {
            var body = this.getBody();
            var w = window.innerWidth;
            body.find('.winBox').width(w * 2);
            body.find('.winBox li').width(w);
            this.scroll = iScrollUtil.createScroll('h', body, {
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
            this.initHolder();
        },
        onPageHide: function() {
            this.destroyHolder();
        },
        initHolder: function() {
            if (!this.holder) {
                this.holder = new TouchHolder({
                    target: this.getCt(),
                    type: 'v',
                    scope: this,
                    handleTouchEnd: this.onTouchEnd
                });
            }
        },
        onTouchEnd: function() {
            if (this.holder.touchCoords.stopY - this.holder.touchCoords.startY > 100) {
                showFavourite();
            }
        },
        destroyHolder: function() {
            if (this.holder) {
                this.holder.destroy();
            }
        },
        onDestroy: function() {
            this.callParent();
            this.scroll.destroy();
            this.scroll = null;
            this.destroyHolder();
        }
    });
    
    
    // 欢迎页 start *********************************************
    var favEl, touchCoords, favCount = 0, resetFavCount, idiotMsg = ['姐姐，别玩了，有意思么', '有时间干点正事吧', '你也太无聊了吧'];
    function showFavourite() {
        if (!favEl) {
            favEl = $('<div class="favourite"><div class="title">MATRIX</div><img src="favourite.jpg" class="img" /><a href="#0" class="download" data-message="true"></a></div>');
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
        if (touchCoords.startY > touchCoords.stopY) {
            favEl.one('webkitTransitionEnd transitionend', function() {
                favEl.removeClass('favouriteOut');
            });
            favEl.addClass('favouriteOut');
        }
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
    // 欢迎页 end *********************************************
    
    
    // 消息提示 start *********************************************
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
    
    $body.delegate('[data-message]', 'click', function(e) {
        e.preventDefault();
        var msg = $(e.target).attr('data-message');
        showMessage(msg != 'true' ? msg : '这仅仅是一个demo，没有这个功能');
    });
    // 消息提示 end *********************************************
    
    
    // 模拟加载进度 start *********************************************
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
    // 模拟加载进度 end *********************************************
    
    
    LocalStorage.globalPrefix = 'msohu/';
    var config = {
        templateVersion: '1.2',
        templateUrl: 'main.tmpl',
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
    X.App.launch(config);
});