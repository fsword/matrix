/*
 * 手机搜狐WebApp是一个基于Matrix框架构建的Single Page Web Application，完整的展现了Matrix框架在WebApp领域的使用技巧。
 *
 * DEMO中的功能完全模拟ZAKER for iPhone开发，由于页面是按照iPhone4S全屏高度设计，为了达到最佳展示效果，请使用iOS Safari打开，
 * 并将页面添加到你的桌面，然后从桌面打开进入。
 *
 * 由于例子中的数据访问存在跨域安全问题，所以本例托管在搜狐的服务器上，访问地址如下：
 * http://h5.m.sohu.com/matrix/v4/examples/msohu/index.html
 */
MX.ready('jquery', 'arttemplate', 'klass', 'localstorage', 'iscrollutil', 'touchholder', 'dateformat', function(X, $, artTemplate, Klass, LocalStorage, iScrollUtil, TouchHolder, DateFormat) {
    /*
     * 本例包含三个页面：主页、新闻列表页、新闻正文页
     *
     * 其中，主页Pagelet为单例页面，三个页面的Pagelet配置的代码在最末尾
     */

    // 模版输出HTML标签
    artTemplate.isEscape = false;

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

    /* IndeView 主页视图 */
    Klass.define({
        alias: 'msohu.indexview',
        extend: 'view',
        bodyCfg: {
            cls: 'index-content', // 为body element设置css
            template: 'index-body-template' // 为body绑定一个模版
        },
        onRender: function() {
            this.body.css('min-height', window.innerHeight + 'px');
        }
    });

    /* IndeView 主页控制器 */
    Klass.define({
        alias: 'msohu.indexcontroller',
        extend: 'controller',
        onPageCreate: function() { // Controller扩展方法，当创建页面DOM时被调用
            var body = this.getBody();
            this.resetBodyWidth();
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
        onPageShow: function() { // Controller扩展方法，当进入页面时被调用
            this.scroll.refresh();

            // 第一次进入主页时，自动展示Favourite画面
            if (!isShowFavourite) {
                isShowFavourite = true;
                showFavourite();
                initShowTimeout = setTimeout(function() {
                    hideFavourite(true);
                }, 3000);
            }

            if (!this.holder) {
                this.holder = new TouchHolder({
                    target: this.getCt(),
                    type: 'v',
                    swept: 'down',
                    scope: this,
                    handleTouchEnd: this.onTouchEnd
                });
            }

            this.getBody().css('min-height', window.innerHeight + 'px');
        },
        beforePageHide: function() { // Controller扩展方法，当离开页面之前被调用
            hideFavourite();
        },
        onPageHide: function() { // Controller扩展方法，当离开页面时被调用
            this.destroyHolder();
        },
        onTouchEnd: function() {
            // 手指向下滑动时，弹出Favourite欢迎画面
            if (this.holder.touchCoords.stopY - this.holder.touchCoords.startY > 100) {
                showFavourite();
            }
        },
        onOrientationChange: function() { // Controller扩展方法，当设备方向改变时被调用
            this.resetBodyWidth();
        },
        resetBodyWidth: function() {
            var body = this.getBody();
            var w = window.innerWidth;
            body.find('.winBox').width(w * 2);
            body.find('.winBox li').width(w);
        },
        destroyHolder: function() {
            if (this.holder) {
                this.holder.destroy();
                this.holder = null;
            }
        },
        onDestroy: function() { // Controller扩展方法，当页面销毁时被调用
            // Controller的子类必须要调用this.callParent()方法，如果不调用，Controller在销毁时会产生异常
            // callParent是执行当前方法的父类方法的函数
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

    /* ChannelView 新闻列表视图 */
    Klass.define({
        alias: 'msohu.channelview',
        extend: 'view',
        headerCfg: {
            cls: 'header',
            template: { // 为header绑定一个模版
                id: 'channel-header-template',
                getData: function(params, data) { // 第一个参数params为hash中包含的参数，第二个参数data为当前模版渲染的参数
                    return channels[params.id]; // 返回重新包装的模版渲染参数data
                }
            }
        },
        footerCfg: {
            cls: 'footer',
            template: {
                id: 'channel-footer-template',
                getData: function(params, data) {
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
                            if (val.id.toString().length == 9) {
                                arr.push(val);
                            }
                        });
                        data.data = arr;
                    }
                    return $.extend({ // 返回重新包装的模版渲染参数data
                        bgColor: channels[params.id].bgColor,
                        focusTop: focusTop,
                        showFocus: showFocus
                    }, data);
                }
            }
        }
    });

    /* ChannelController 新闻列表控制器 */
    Klass.define({
        alias: 'msohu.channelcontroller',
        extend: 'controller',
        delegates: { // 定义页面事件监听，以及回调函数
            'click .btn_back': 'back',
            'click .btn_refresh': 'refresh'
        },
        initEvents: function() { // Controller扩展方法，当Controller初始化时被调用
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
        beforePageShow: function() { // Controller扩展方法，当进入页面之前被调用
            var params = this.getParams(), view = this.view;
            view.footer.find('.active').css('left', ((parseInt(params.page) - 1) * 9.55) + 'px');
            view.footer.find('.active .ico_block').html(params.page);
        },
        onPageShow: function() { // Controller扩展方法，当进入页面时被调用
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
                    swept: 'down',
                    scope: this,
                    handleTouchEnd: this.onVerticalTouchEnd
                });
            }
        },
        onPageHide: function() { // Controller扩展方法，当离开页面时被调用
            this.destroyHolder();
        },
        onHorizontalTouchEnd: function() {
            // 手指左右滑动时，切换上一页、下一页
            var params = this.getParams();
            if (this.hHolder.touchCoords.stopX - this.hHolder.touchCoords.startX > 100) {
                if (params.page > 1) {
                    X.App.go('c/' + params.id + '/' + (parseInt(params.page) - 1), {
                        reverse: true
                    });
                } else {
                    showMessage('看清楚，现在就是第一页');
                }
            } else if (this.hHolder.touchCoords.startX - this.hHolder.touchCoords.stopX > 100) {
                if (params.page < 10) {
                    X.App.go('c/' + params.id + '/' + (parseInt(params.page) + 1));
                } else {
                    showMessage('没有下一页，别滑了');
                }
            }
        },
        onVerticalTouchEnd: function() {
            // 手指向下滑动时，返回主页
            if (this.vHolder.touchCoords.stopY - this.vHolder.touchCoords.startY > 100) {
                this.back();
            }
        },
        onOrientationChange: function() { // Controller扩展方法，当设备方向改变时被调用
            favEl.height(window.innerHeight);
        },
        getTransition: function(to, from) { // 第一个参数to是将要去的页面hash，第二个参数from是当前要离开页面的hash
            // 动态重载页面切换效果，除了在Pagelet的Config中配置静态的transition效果之外，
            // 还可以重写getTransition()方法，动态返回过渡动画效果，
            // 如果返回null或undefined，那么，则使用PageletConfig中配置的静态transition效果
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
        onDestroy: function() { // Controller扩展方法，当页面销毁时被调用
            // Controller的子类必须要调用this.callParent()方法，如果不调用，Controller在销毁时会产生异常
            // callParent是执行当前方法的父类方法的函数
            this.callParent();
            this.destroyHolder();
        }
    });

    /* ArticleView 新闻正文视图 */
    Klass.define({
        alias: 'msohu.articleview',
        extend: 'view',
        headerCfg: {
            cls: 'detail_title',
            template: 'article-header-template'
        },
        footerCfg: {
            cls: 'detail_footer',
            template: 'article-footer-template',
            fixed: true // 设置footer为fixed定位
        },
        bodyCfg: {
            cls: 'container',
            template: 'article-body-template'
        }
    });

    /* ArticleController 新闻正文控制器 */
    Klass.define({
        alias: 'msohu.articlecontroller',
        extend: 'controller',
        delegates: { // 定义页面事件监听，以及回调函数
            'click .btn_back': 'back',
            'click .btn_refresh': 'refresh'
        },
        initEvents: function() { // Controller扩展方法，当Controller初始化时被调用
            this.mon(this.getModel('article-model'), 'load', this.onModelLoad);
        },
        onModelLoad: function(model) {
            var rs = model.get();
            this.getHeader().find('.i_title').html(rs['title']);
            this.getHeader().find('p').html(rs['media'] + ' ' + rs['create_time']);
        },
        onPageCreate: function() { // Controller扩展方法，当创建页面DOM时被调用
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
        getTransition: function(to, from) { // 第一个参数to是将要去的页面hash，第二个参数from是当前要离开页面的hash
            // 动态重载页面切换效果，除了在Pagelet的Config中配置静态的transition效果之外，
            // 还可以重写getTransition()方法，动态返回过渡动画效果，
            // 如果返回null或undefined，那么，则使用PageletConfig中配置的静态transition效果
            return 'slideup';
        }
    });

    // Favourite欢迎画面 start *********************************************
    var favEl, touchCoords, favCount = 0, resetFavCount, initShowTimeout;
    var idiotMsg = ['姐姐，别玩了，有意思么', '有时间干点正事吧', '你也太无聊了吧'];
    function showFavourite() {
        if (!favEl) {
            favEl = $('<div class="favourite"><div class="title">MATRIX<span>Based on the <a href="https://github.com/mxjs/matrix" target="_blank">Matrix</a> Framework</span></div><a href="#0" class="download" data-message="true"></a></div>');
            $body.append(favEl);
        }
        favEl.height($('#mx-app-page-index-pagelet').height());
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
        if (initShowTimeout) {
            clearTimeout(initShowTimeout);
            initShowTimeout = null;
        }
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
    // Favourite欢迎画面 end *********************************************

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

    // 格式化时间函数
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

    // 为localStorage存储的key设置一个全局前缀
    LocalStorage.globalPrefix = 'msohu/';

    var config = {
        /* 定义页面模版 */
        templateVersion: '1.9',
        templateUrl: 'main.tmpl',

        /* 定义Web SQL Database，使用浏览器DB缓存新闻列表、正文数据 */
        databaseName: 'msohu_db',
        databaseDescription: 'msohu offline database',

        /* 新闻正文Model */
        models: [
            {
                id: 'article-model',
                getUrl: function(params, type) { // Model设置AJAX请求的URL有两种方式，可以直接设置url属性，也可以设置getUrl函数，动态获得URL
                    return '/wcms/news/' + params.id + '/';
                },
                tableName: 'articles', // Model中使用缓存必须要设置tableName属性
                useCache: true,
                fields: ['id', 'title', 'content', 'media', {
                    name: 'create_time',
                    renderer: calcTime // 渲染函数，在controller获取model的值时，能得到格式化之后的值
                }],
                showPageLoading: true // Model加载数据时，显示$.mobile.showPageLoadingMsg()
            }
        ],

        /* 新闻正文Store */
        stores: [
            {
                id: 'channel-store',
                url: '/wcms/news/',
                useCache: true,
                fields: ['id', 'title', 'cover_image_url', 'comment_count', {
                    name: 'create_time',
                    renderer: calcTime // 渲染函数，在controller获取store的值时，能得到格式化之后的值
                }],
                pageSize: 6, // 定义每页数量
                meta: {
                    pageSizeProperty: 'page_size' // 重载AJAX请求提交'pageSize'参数的名称
                },
                showPageLoading: true
            }
        ],

        /* 定义页面 */
        pagelets: [
            // 主页Pagelet
            {
                id: 'index-pagelet',
                url: 'h', // 定义访问页面的hash
                view: 'msohu.indexview', // 关联View
                controller: 'msohu.indexcontroller', // 关联Controller
                transition: 'fade', // 切入页面时使用的过渡动画效果
                singleton: true // 声明为单例Pagelet
            },

            // 新闻列表Pagelet
            {
                id: 'channel-pagelet',
                url: 'c/:id/:page', // 定义hash，c/:id/:page可以匹配动态hash路径，如'c/0/1'，在controller中可以使用getParams()方法获得hash中包含的参数
                view: 'msohu.channelview',
                controller: 'msohu.channelcontroller',
                stores: { // 关联Store，如果有多个Store，stores属性可以设置为['channel-store', { id: 'store1' }, 'store2']
                    id: 'channel-store',
                    autoLoad: true, // 进入页面时，自动加载Store
                    bindTo: 'body', // 将Store绑定给View的body模版，数据加载完成，自动渲染body
                    getData: function(params) { // params参数为hash中包含的参数
                        return { // 返回一组AJAX请求使用的data参数
                            'page': params.page,
                            'channel_id': channels[params.id].list,
                            'roll': 1
                        };
                    },
                    getStorageKey: function(storageKey, pageNumber, params) {
                        return storageKey + '-' + params.id + '-' + pageNumber;
                    }
                },
                cls: 'winContent', // 为pagelet容器设置css
                transition: {
                    show: 'slideup', // 定义切入页面的动画效果
                    hide: { // 定义切出页面的动画效果
                        effect: 'slideup',
                        reverse: true
                    }
                }
            },

            // 新闻正文Pagelet
            {
                id: 'atricle-pagelet',
                url: 'n/:id',
                view: 'msohu.articleview',
                controller: 'msohu.articlecontroller',
                models: {
                    id: 'article-model',
                    autoLoad: true,
                    bindTo: 'body',
                    getData: function(params) {
                        return {
                            'page': 1,
                            'page_size': 1800,
                            'rest': '0'
                        };
                    }
                },
                cls: 'winContent',
                transition: {
                    show: 'slideup',
                    hide: {
                        effect: 'slideup',
                        reverse: true
                    }
                }
            }
        ],

        // 默认欢迎页，初始页面
        welcome: 'h'
    };

    // 启动WebApp
    X.App.launch(config);
});