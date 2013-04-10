/*
 * 手机搜狐WebApp是一个基于Matrix框架构建的Single Page Web Application，完整的展现了Matrix框架在WebApp领域的使用技巧。
 *
 * Example中的功能完全仿照ZAKER for iPhone开发，为了达到最佳展示效果，请使用iOS Safari，并将页面添加到你的桌面，然后从桌面打开进入。
 *
 * 由于例子中的数据访问存在跨域安全问题，所以本例托管在搜狐的服务器上，访问地址如下：
 * http://h5.m.sohu.com/matrix/v4/examples/msohu/index.html
 */
MX.ready('jquery', 'klass', 'localstorage', 'iscrollutil', 'touchholder', 'dateformat', function(X, $, Klass, LocalStorage, iScrollUtil, TouchHolder, DateFormat) {
    var $window = $(window), $body = $('body'),
        isShowFavourite = false,
        channels = [
            {
                name: '聚焦头条',
                en: 'TOP STORIES',
                bgColor: '#2ca7ea',
                titleColor: '#009ad6',
                list: '2'
            },
            {
                name: '社会新闻',
                en: 'CHINA NEWS',
                bgColor: '#1d953f',
                titleColor: '#007d65',
                list: '53'
            },
            {
                name: '财经频道',
                en: 'FINANCE',
                bgColor: '#c7a252',
                titleColor: '#dec674',
                list: '5'
            },
            {
                name: '娱乐频道',
                en: 'SHINE',
                bgColor: '#585eaa',
                titleColor: '#494e8f',
                list: '4'
            },
            {
                name: '体育频道',
                en: 'SPORTS',
                bgColor: '#853f04',
                titleColor: '#a7573b',
                list: '3'
            },
            {
                name: '科技频道',
                en: 'TECHNOLOGY',
                bgColor: '#dea32c',
                titleColor: '#c88400',
                list: '7'
            },
            {
                name: '女人频道',
                en: 'WOMAN',
                bgColor: '#f05b72',
                titleColor: '#ef5b9c',
                list: '326'
            },
            {
                name: '汽车频道',
                en: 'AUTOS',
                bgColor: '#5f5d46',
                titleColor: '#6e6b41',
                list: '1592'
            },
            {
                name: '星座频道',
                en: 'ASTROLOGY',
                bgColor: '#c63c26',
                titleColor: '#ef4136',
                list: '9'
            },
            {
                name: '笑话频道',
                en: 'JOKE',
                bgColor: '#b4532a',
                titleColor: '#f36c21',
                list: '1393'
            }
        ],
        channelTimes = {};

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
                initShowTimeout = setTimeout(function() {
                    hideFavourite(true);
                }, 2000);
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
            template: {
                id: 'channel-header-template',
                getData: function(params) {
                    return channels[params.id];
                }
            }
        },
        footerCfg: {
            cls: 'footer',
            template: {
                id: 'channel-footer-template',
                getData: function(params) {
                    var times = channelTimes[params.id] || {};
                    return {
                        page: params.page,
                        pageLeft: ((parseInt(params.page) - 1) * 9.55) + 'px',
                        sTime: times.st ? calcTime(times.st) : '1分钟前',
                        eTime: times.et ? calcTime(times.et) : '1天前'
                    };
                }
            }
        },
        bodyCfg: {
            cls: 'container',
            template: {
                id: 'channel-body-template',
                getData: function(params, data) {
                    var focusTop = true, showFocus = true, arr = [];
                    if (data.data) {
                        if (data.data[0] && data.data[0]['cover_image_url']) {
                            focusTop = true;
                        } else if (data.data[2] && data.data[2]['cover_image_url']) {
                            focusTop = false;
                        } else {
                            showFocus = false;
                        }
                        X.each(data.data, function(i, val) {
                            if (val.id.length != 6) {
                                arr.push(val);
                            }
                        });
                        data.data = arr;
                    }
                    return $.extend({
                        bgColor: channels[params.id].bgColor,
                        focusTop: focusTop,
                        showFocus: showFocus
                    }, data);
                }
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
        initEvents: function() {
            this.mon(this.getStore('channel-store'), 'load', this.onStoreLoad);
        },
        onStoreLoad: function(store) {
            var footer = this.view.footer, rs = store.get(true),
                s_time = footer.find('.s_time'),
                cid = this.getParams().id,
                times = channelTimes[cid] || {},
                st, et;
            if (rs.length > 0) {
                st = DateFormat.parse(rs[0]['create_time'], 'Y-m-d H:i:s').getTime();
                et = DateFormat.parse(rs[rs.length - 1]['create_time'], 'Y-m-d H:i:s').getTime();
                if (!times.st || st > times.st) {
                    times.st = st;
                } else {
                    st = times.st;
                }
                if (!times.et || et < times.et) {
                    times.et = et;
                } else {
                    et = times.et;
                }
                $(s_time[0]).html(calcTime(st));
                $(s_time[1]).html(calcTime(et));
                channelTimes[cid] = times;
            }
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
        onPageHide: function() {
            this.destroyHolder();
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
        getTransition: function(to, from) {
            if (/^c\/.*/i.test(from) && /^c\/.*/i.test(to)) {
                return 'slidefade';
            }
        },
        back: function(e) {
            e && e.preventDefault();
            X.App.go('h');
        },
        refresh: function(e) {
            e && e.preventDefault();
            this.getStore('channel-store').reload();
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
            cls: 'detail_title',
            template: 'article-header-template'
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
        extend: 'controller',
        delegates: {
            'click .btn_back': 'back',
            'click .btn_refresh': 'refresh'
        },
        initEvents: function() {
            this.mon(this.getModel('article-model'), 'load', this.onModelLoad);
        },
        onModelLoad: function(model) {
            var rs = model.get();
            this.getHeader().find('.i_title').html(rs['title']);
            this.getHeader().find('p').html(rs['media'] + ' ' + rs['create_time']);
        },
        onPageCreate: function() {
            var colors = ['#2ca7ea', '#1d953f', '#c7a252', '#585eaa', '#853f04', '#dea32c', '#f05b72', '#5f5d46', '#c63c26', '#b4532a'];
            this.getHeader().css('background-color', colors[Math.floor(Math.random() * colors.length)]);
        },
        back: function(e) {
            e && e.preventDefault();
            X.App.back();
        },
        refresh: function(e) {
            e && e.preventDefault();
            this.getModel('article-model').reload();
        },
        getTransition: function(to, from) {
            return 'slideup';
        }
    });

    // 欢迎页 start *********************************************
    var favEl, touchCoords, favCount = 0, resetFavCount, initShowTimeout;
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

    function hideFavourite(animated) {
        if (initShowTimeout) {
            clearTimeout(initShowTimeout);
            initShowTimeout = null;
        }
        if (favEl) {
            favEl.removeClass('animated bounceInDown');
            if (animated) {
                favEl.one('webkitTransitionEnd transitionend', function() {
                    favEl.removeClass('favouriteOut');
                });
                favEl.addClass('favouriteOut');
            }
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
    var isMsgElShow, msgElHideTimeout,
        msgEl = $('<div class="lay miniPop" style="opacity: 0; top: 278.5px; visibility: hidden;"><div class="cnt"></div></div>');
    $body.append(msgEl);
    function showMessage(msg) {
        if (!isMsgElShow) {
            clearTimeout(msgElHideTimeout);
            isMsgElShow = true;
            msgEl.find('.cnt').html(msg || '');
            msgEl.css({
                'visibility': 'visible',
                'top': ($window.scrollTop() + window.innerHeight / 2 + msgEl.height() / 2) + 'px'
            });
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


    function calcTime(val) {
        var seconds, minutes, hours, days, months, time;
        time = X.isString(val) ? DateFormat.parse(val, 'Y-m-d H:i:s').getTime() : val;
        seconds = parseInt((Date.now() - time) / 1000, 10);
        if (seconds > 0) {
            minutes = parseInt(seconds / 60, 10);
            hours = parseInt(minutes / 60, 10);
            days = parseInt(hours / 24, 10);
            months = parseInt(days / 30, 10);
        }
        if (months >= 1) return months + "月前";
        if (days >= 1) return days + "天前";
        if (hours >= 1) return hours + "小时前";
        if (minutes >= 1) return minutes + "分钟前";
        if (seconds >= 1) return seconds + '秒钟前';
        return '1秒钟前';
    }

    LocalStorage.globalPrefix = 'msohu/';

    var config = {
        templateVersion: '1.6',
        templateUrl: 'main.tmpl',
        databaseName: 'msohu_db',
        databaseDescription: 'msohu offline database',
        models: [
            {
                id: 'article-model',
                tableName: 'articles',
                fields: ['id', 'title', 'content', 'media', {
                    name: 'create_time',
                    renderer: calcTime
                }],
                useCache: true,
                getUrl: function(params) {
                    return '/wcms/news/' + params.id + '/';
                },
                showPageLoading: true
            }
        ],
        stores: [
            {
                id: 'channel-store',
                url: '/wcms/news/',
                useCache: true,
                fields: ['id', 'title', 'cover_image_url', 'comment_count', {
                    name: 'create_time',
                    renderer: calcTime
                }],
                pageSize: 6,
                meta: {
                    pageSizeProperty: 'page_size'
                },
                showPageLoading: true
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
                stores: {
                    id: 'channel-store',
                    autoLoad: true,
                    bindTo: 'body',
                    getOptions: function(params) {
                        return {
                            data: {
                                'page': params.page,
                                'channel_id': channels[params.id].list,
                                'roll': 1
                            }
                        };
                    }
                },
                cls: 'winContent',
                transition: {
                    in: 'slideup',
                    out: {
                        effect: 'slideup',
                        reverse: true
                    }
                }
            },
            {
                id: 'atricle-pagelet',
                url: 'n/:id',
                view: 'msohu.articleview',
                controller: 'msohu.articlecontroller',
                models: {
                    id: 'article-model',
                    autoLoad: true,
                    bindTo: 'body',
                    getOptions: function(params) {
                        return {
                            data: {
                                'page': 1,
                                'page_size': 1800,
                                'rest': '0'
                            }
                        };
                    }
                },
                cls: 'winContent',
                transition: {
                    in: 'slideup',
                    out: {
                        effect: 'slideup',
                        reverse: true
                    }
                }
            }
        ],
        welcome: 'h'
    };
    X.App.launch(config);
});