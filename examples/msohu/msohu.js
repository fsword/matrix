/*
 * 手机搜狐WebApp Example是一个基于AJAX的Single Page Web Application，基于Matrix框架构建。
 *
 * Example中的系统功能完全仿照Zaker for iPhone开发，为了达到最佳展示效果，请使用iphone safari打开，并将页面添加到你的桌面，然后从桌面打开进入。
 */
MX.ready('jquery', 'klass', 'localstorage', 'iscrollutil', 'touchholder', function(X, $, Klass, LocalStorage, iScrollUtil, TouchHolder) {
    var $body = $('body'),
        isShowFavourite = false,
        channels = [
            {
                name: '聚焦头条',
                en: 'TOP STORIES',
                bgColor: '#2ca7ea',
                titleColor: '#009ad6'
            },
            {
                name: '社会新闻',
                en: 'CHINA NEWS',
                bgColor: '#1d953f',
                titleColor: '#007d65'
            },
            {
                name: '财经频道',
                en: 'FINANCE',
                bgColor: '#c7a252',
                titleColor: '#dec674'
            },
            {
                name: '娱乐频道',
                en: 'SHINE',
                bgColor: '#585eaa',
                titleColor: '#494e8f'
            },
            {
                name: '体育频道',
                en: 'SPORTS',
                bgColor: '#853f04',
                titleColor: '#a7573b'
            },
            {
                name: '科技频道',
                en: 'TECHNOLOGY',
                bgColor: '#dea32c',
                titleColor: '#c88400'
            },
            {
                name: '女人频道',
                en: 'WOMAN',
                bgColor: '#f05b72',
                titleColor: '#ef5b9c'
            },
            {
                name: '汽车频道',
                en: 'AUTOS',
                bgColor: '#5f5d46',
                titleColor: '#6e6b41'
            },
            {
                name: '星座频道',
                en: 'ASTROLOGY',
                bgColor: '#c63c26',
                titleColor: '#ef4136'
            },
            {
                name: '笑话频道',
                en: 'JOKE',
                bgColor: '#b4532a',
                titleColor: '#f36c21'
            }
        ];

    Klass.define({
        alias: 'msohu.indexview',
        extend: 'view',
        bodyCfg: {
            cls: 'index-content',
            template: 'index-body-template'
        }
    });
    Klass.define({
        alias: 'msohu.indexcontroller',
        extend: 'controller',
        onPageCreate: function() {
            var body = this.getBody();
            var w = window.innerWidth;
            body.find('.winBox').width(w * 2);
            body.find('.winBox li').width(w);
            this.scroll = iScrollUtil.createScroll('h', body, {
                snap: true,
                momentum: false,
                hScrollbar: false,
                onScrollMove: function() {
                    var w = window.innerWidth, x = this.x, scale = Math.abs(x) / w;
                    body.css('background-position-x', x > 0 ? 0 : -scale * (w / 8));
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
                    body.css('background-position-x', -this.currPageX * (window.innerWidth / 8));
                }
            });
        },
        onPageShow: function() {
            this.scroll.refresh();
            if (!isShowFavourite) {
                isShowFavourite = true;
                showFavourite();
            }
            if (!this.holder) {
                this.holder = new TouchHolder({
                    target: this.getCt(),
                    type: 'v',
                    scope: this,
                    handleTouchEnd: this.onTouchEnd
                });
            }
        },
        beforePageHide: function() {
            hideFavourite();
        },
        onPageHide: function() {
            this.destroyHolder();
        },
        onTouchEnd: function() {
            if (this.holder.touchCoords.stopY - this.holder.touchCoords.startY > 100) {
                showFavourite();
            }
        },
        destroyHolder: function() {
            if (this.holder) {
                this.holder.destroy();
                this.holder = null;
            }
        },
        onDestroy: function() {
            this.callParent();
            this.scroll.destroy();
            this.scroll = null;
            this.destroyHolder();
        }
    });
    X.App.on('pagechange', function() {
        isShowFavourite = true;
    }, window, {
        single: true
    });

    Klass.define({
        alias: 'msohu.channelview',
        extend: 'view',
        headerCfg: {
            cls: 'header',
            template: 'channel-header-template',
            getData: function(params) {
                return channels[params.id];
            }
        },
        footerCfg: {
            cls: 'footer',
            template: 'channel-footer-template',
            getData: function(params) {
                return {
                    page: params.page,
                    pageLeft: ((parseInt(params.page) - 1) * 9.55) + 'px'
                };
            }
        },
        bodyCfg: {
            cls: 'container',
            template: 'channel-body-template',
            getData: function(params) {
                return {
                    bgColor: channels[params.id].bgColor,
                    showHot: params.page < 4,
                    randomTop: !Math.floor(Math.random() * 2)
                };
            }
        }
    });
    Klass.define({
        alias: 'msohu.channelcontroller',
        extend: 'controller',
        delegates: {
            'click .btn_back': 'back',
            'click .btn_refresh': 'refresh'
        },
        beforePageShow: function() {
            var params = this.getParams(), view = this.view;
            view.footer.find('.active').css('left', ((parseInt(params.page) - 1) * 9.55) + 'px');
            view.footer.find('.active .ico_block').html(params.page);
        },
        onPageShow: function() {
            if (!this.hHolder) {
                this.hHolder = new TouchHolder({
                    target: this.getCt(),
                    type: 'h',
                    scope: this,
                    handleTouchEnd: this.onHorizontalTouchEnd
                });
            }
            if (!this.vHolder) {
                this.vHolder = new TouchHolder({
                    target: this.getCt(),
                    type: 'v',
                    scope: this,
                    handleTouchEnd: this.onVerticalTouchEnd
                });
            }
        },
        onHorizontalTouchEnd: function() {
            var params = this.getParams();
            if (this.hHolder.touchCoords.stopX - this.hHolder.touchCoords.startX > 100 && params.page > 1) {
                X.App.go('c/' + params.id + '/' + (parseInt(params.page) - 1), {
                    reverse: true
                });
            } else if (this.hHolder.touchCoords.startX - this.hHolder.touchCoords.stopX > 100 && params.page < 10) {
                X.App.go('c/' + params.id + '/' + (parseInt(params.page) + 1));
            }
        },
        onVerticalTouchEnd: function() {
            if (this.vHolder.touchCoords.stopY - this.vHolder.touchCoords.startY > 100) {
                this.back();
            }
        },
        onPageHide: function() {
            this.destroyHolder();
        },
        getTransition: function(to, from) {
            if (/^c\/.*/i.test(from) && /^c\/.*/i.test(to)) {
                return 'slide';
            }
        },
        back: function(e) {
            e && e.preventDefault();
            X.App.go('h');
        },
        refresh: function(e) {
            e && e.preventDefault();
            // TODO
        },
        destroyHolder: function() {
            if (this.hHolder) {
                this.hHolder.destroy();
                this.hHolder = null;
            }
            if (this.vHolder) {
                this.vHolder.destroy();
                this.vHolder = null;
            }
        },
        onDestroy: function() {
            this.callParent();
            this.destroyHolder();
        }
    });

    Klass.define({
        alias: 'msohu.articleview',
        extend: 'view',
        headerCfg: {
            cls: 'banner',
            template: 'article-header-template',
            getData: function(params) {
                return channels[params.id];
            }
        },
        footerCfg: {
            cls: 'footer',
            template: 'article-footer-template',
            fixed: true
        },
        bodyCfg: {
            cls: 'container',
            template: 'article-body-template'
        }
    });
    Klass.define({
        alias: 'msohu.articlecontroller',
        extend: 'controller'
    });

    // 欢迎页 start *********************************************
    var favEl, touchCoords, favCount = 0, resetFavCount;
    var idiotMsg = ['姐姐，别玩了，有意思么', '有时间干点正事吧', '你也太无聊了吧'];

    function showFavourite() {
        if (!favEl) {
            favEl = $('<div class="favourite"><div class="title">MATRIX</div><img src="images/favourite.jpg" class="img" /><a href="#0" class="download" data-message="true"></a></div>');
            $body.append(favEl);
        }
        favEl.height(window.innerHeight);
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
    }

    function hideFavourite() {
        if (favEl) {
            favEl.removeClass('animated bounceInDown');
            favEl.css('-webkit-transform', 'translateY(' + -favEl.height() + 'px)');
            $body.off('touchstart', bodyTouchStart);
            $body.off('touchmove', bodyTouchMove);
            $body.off('touchend', bodyTouchEnd);
        }
    }

    function bodyTouchStart(e) {
        $body.off('touchmove', bodyTouchMove);
        $body.off('touchend', bodyTouchEnd);
        $body.on('touchmove', bodyTouchMove);
        $body.on('touchend', bodyTouchEnd);
        touchCoords = {};
        touchCoords.startX = e.originalEvent.touches[0].pageX;
        touchCoords.startY = e.originalEvent.touches[0].pageY;
        touchCoords.timeStamp = e.timeStamp;
    }

    function bodyTouchMove(e) {
        e.preventDefault();
        touchCoords.stopX = e.originalEvent.touches[0].pageX;
        touchCoords.stopY = e.originalEvent.touches[0].pageY;
        var y = touchCoords.stopY - touchCoords.startY;
        favEl.css('-webkit-transform', 'translateY(' + (y > 0 ? 0 : y) + 'px)');
    }

    function bodyTouchEnd(e) {
        $body.off('touchmove', bodyTouchMove);
        $body.off('touchend', bodyTouchEnd);
        if (touchCoords.startY > touchCoords.stopY) {
            favEl.one('webkitTransitionEnd transitionend', function() {
                favEl.removeClass('favouriteOut');
            });
            favEl.addClass('favouriteOut');
        }
        if ((touchCoords.stopY < touchCoords.startY && (e.timeStamp - touchCoords.timeStamp < 100)) || (touchCoords.stopY - touchCoords.startY < -100)) {
            $body.off('touchstart', bodyTouchStart);
            favEl.css('-webkit-transform', 'translateY(' + -favEl.height() + 'px)');
            resetFavCount = setTimeout(function() {
                favCount = 0;
            }, 2000);
        } else {
            favEl.css('-webkit-transform', 'translateY(0px)');
        }
    }

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
    }

    $body.delegate('[data-message]', 'click', function(e) {
        e.preventDefault();
        var msg = $(e.currentTarget).attr('data-message');
        showMessage(msg != 'true' ? msg : '这仅仅是一个demo，没有这个功能');
    });
    // 消息提示 end *********************************************

    LocalStorage.globalPrefix = 'msohu/';
    var config = {
        templateVersion: '1.1',
        templateUrl: 'main.tmpl',
        databaseName: 'msohu_db',
        databaseDescription: 'msohu offline database',
        models: [
            {
                id: 'article-model'

            }
        ],
        stores: [
            {
                id: 'channel-store'

            }
        ],
        pagelets: [
            {
                id: 'index-pagelet',
                url: 'h',
                view: 'msohu.indexview',
                controller: 'msohu.indexcontroller',
                transition: 'fade',
                singleton: true
            },
            {
                id: 'channel-pagelet',
                url: 'c/:id/:page',
                view: 'msohu.channelview',
                controller: 'msohu.channelcontroller',
                stores: 'channel-store',
                cls: 'winContent',
                transition: {
                    in: 'pop',
                    out: 'slidedown'
                }
            },
            {
                id: 'atricle-pagelet',
                url: 'n/:id',
                view: 'msohu.articleview',
                controller: 'msohu.articlecontroller',
                model: 'article-model',
                cls: 'winContent',
                transition: {
                    in: 'pop',
                    out: 'slidedown'
                }
            }
        ],
        welcome: 'h'
    };
    X.App.launch(config);
});