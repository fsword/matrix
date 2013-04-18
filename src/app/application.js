/**
 * @class MX.app.Application
 * @alias application
 *
 * Appliaction主程序类，整合WebApp中使用的各种资源（model、store、view、controller），管理页面视图
 *
 * Matrix框架适合于开发Single Page Web Application
 * Appliaction的Pagelet视图是基于模版渲染，不支持由外部加载页面内容作为页面视图的功能（类似jQuery mobile Navigation）
 * 仅支持基于hash pagelet页面切换
 *
 * 当hash发生改变时，App加载hash对应的pagelet，然后，pagelet使用view绑定的template渲染试图
 *
 * 当App启动时，页面会自动跳转到welcome pagelet，例如：
 *  welcome的hash为'h'，那么页面的url会被重置为'http://localhost/mx/examples/helloworld/index.html#/h'
 *
 * 此时，有三种方式可以实现页面跳转：
 *  1、直接更改url中的hash值
 *  2、将页面<a>标签的href定义为hash，如：<a href="#/h">首页</a>
 *  3、使用X.App.go('h')函数实现页面跳转，不需要带前缀'#/'
 *
 * Matrix框架的Appliaction集成了jquery mobile的changePage功能，实现页面切换的过渡动画效果
 *
 * Appliaction代理了changePage过程中的页面事件，并由App和Controller对外提供接口支持
 * Appliaction提供的页面事件：
 *  - pagebeforechange
 *  - pagechange
 *  - pageafterchange
 *  - pagechangefailed
 * 可以使用如下方式监听：
 * <code>
 *  X.App.on('pagechange', function() {
 *      // ...
 *  })
 * </code>
 *
 * Controller提供的页面事件：
 *  - pagecreate
 *  - pagebeforeshow
 *  - pageshow
 *  - pagebeforehide
 *  - pagehide
 *
 * Controller除了提供事件之外，还提供由子类实现的抽象方法
 *  - onPageCreate() 当页面创建DOM时触发
 *  - beforePageShow() 当进入页面之前触发
 *  - onPageShow() 当进入页面时触发
 *  - beforePageHide() 当离开页面之前触发
 *  - onPageHide() 当离开页面时触发
 *
 * 在编写业务代码时，可以充分利用Matrix框架Application、Controller提供的页面事件、方法的支持，实现业务逻辑
 */
MX.kindle('jquery', 'klass', 'localstorage', 'pagelet', function(X, $, Klass, LocalStorage, Pagelet) {
    var $window = $(window),
        $body = $('body'),
        location = window.location,
        matchHashRe = /#(.*)$/, // 匹配url中的hash部分
        hashStripperRe = /^[#\/]/, // 移除hash碎片中的"#/"标识符
        namedParamRe = /:\w+/g, // 匹配hash中的parameter
        splatParamRe = /\*\w+/g, // 匹配hash一段url字符串
        escapeRe = /[-[\]{}()+?.,\\^$|#\s]/g; // 过滤hash中的特殊字符

    X.app.Application = Klass.define({
        // private
        alias: 'application',

        // private
        extend: 'utility',

        /**
         * @cfg {String} templateVersion 模版库版本号
         * 当App初始化时，如果本地版本号与服务端版本号不同，则会自动更新模版文件
         * 并将最新的版本号存储在localStorage中，等待下一次启动App时调用
         */
        templateVersion: '1.0',

        /**
         * @cfg {String} templateUrl 更新模版请求的URL
         * 模版文件以String类型存储的localStorage中
         */

        /**
         * @cfg {Boolean} useWebDatabase true启动Web SQL Database缓存
         * 全局配置参数，当useWebDatabase设置为false时，会那么App中所有使用Cache的model、store都会被影响
         */
        useWebDatabase: true,

        /**
         * @cfg {Number} databaseSize 数据库大小，默认50M
         */
        databaseSize: 50 * 1024 * 1024,

        /**
         * @cfg {String} databaseName 数据库名称，默认undefined
         * 如果数据库名称未设置，则useWebDatabase会被设置为false
         */

        /**
         * @cfg {String} databaseVersion 数据库版本，默认'1.0'
         */
        databaseVersion: '1.0',

        /**
         * @cfg {String} databaseDescription 数据库描述
         */

        /**
         * @cfg {Number} databaseExpires 数据过期时间，单位ms，默认 3 * 24 * 60 * 60 * 1000，3天后过期
         */
        databaseExpires: 3 * 24 * 60 * 60 * 1000,

        /**
         * @cfg {Number} pageletCacheSize pagelet缓存大小，默认为30
         * 最小不能小于3，如果设置一个小于3的值，会被重置为3
         */
        pageletCacheSize: 30,

        /**
         * @cfg {String} startUpSelector 启动画面selector
         * 在App初次加载页面时，画面由启动页过渡到第一个页面
         */
        startUpSelector: 'div#startUpView',

        /**
         * @cfg {String} cls 添加到body元素上的扩展CSS样式
         */

        // private
        init: function() {
            this.models = {};
            this.stores = {};
            this.pagelets = {};

            // pagelet缓存池
            this.pageletCaches = this.pageletCaches || [];

            // 页面访问历史管理器，记录页面访问路径，X.App.back()方法使用history找回访问路径的上一个页面的hash
            this.history = new $.mobile.History();
        },

        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event beforelaunch
                 * 当App启动之前调用，返回false则终止App启动
                 * @param {App} app 当前App实例对象
                 */
                'beforelaunch',
                /**
                 * @event launch
                 * 当App启动完成时调用
                 * @param {App} app 当前App实例对象
                 */
                'launch',
                /**
                 * @event pagebeforechange
                 * 当页面切换之前调用，返回false则终止页面切换
                 * @param {Pagelet} nextPagelet 进入的pagelet
                 * @param {Pagelet} prevPagelet 离开的pagelet
                 */
                'pagebeforechange',
                /**
                 * @event pagechange
                 * 当页面切换时调用
                 * @param {Pagelet} nextPagelet 进入的pagelet
                 * @param {Pagelet} prevPagelet 离开的pagelet
                 */
                'pagechange',
                /**
                 * @event pageafterchange
                 * 当页面切换之后调用
                 * @param {Pagelet} nextPagelet 进入的pagelet
                 * @param {Pagelet} prevPagelet 离开的pagelet
                 */
                'pageafterchange',
                /**
                 * @event pagechangefailed
                 * 当页面切换失败调用
                 * @param {Pagelet} nextPagelet 进入的pagelet
                 * @param {Pagelet} prevPagelet 离开的pagelet
                 */
                'pagechangefailed'
            );

            /*
             * 监听hashchange，当hash发生改变时，切换Pagelet
             *
             * Matrix框架的Appliaction页面导航策略，是通过监听hash变化，实现页面之间的切换，
             *
             * 如页面hash由'#/h'变为'#/c/0/1'时，
             * hash ‘h’ 对应的pagelet，切换到hash 'c/0/1' 对应的Pagelet
             */
            this.mon(window, 'hashchange', this.onHashChange);

            this.mon(window, 'orientationchange', this.onOrientationChange);
        },

        /**
         * 启动WebApp，App由此开始，只有在执行launch之后，App才能正常工作
         * @param {Object} config 配置参数
         */
        launch: function(config) {
            config = config || {};
            this.setConfig(config);

            // 加载模版文件
            var templates = LocalStorage.get('mx-app/templates'),
                lastTemplateVersion = LocalStorage.get('mx-app/template-version'),
                dt = $.now();
            if ((lastTemplateVersion != this.templateVersion || !templates) && this.templateUrl) {
                $.ajax({
                    url: this.templateUrl,
                    type: 'GET',
                    dataType: 'text',
                    context: this
                }).done(function(response) {
                    LocalStorage.set('mx-app/template-version', this.templateVersion);
                    LocalStorage.set('mx-app/templates', response);
                    this.createTemplateElement(response);
                    dt = $.now() - dt;
                    if (dt > 200) {
                        this._launch(config);
                    } else {
                        X.defer(this._launch, dt, this, [config]);
                    }
                }).fail(function() {
                    // TODO 加载模版失败
                });
            } else {
                this.createTemplateElement(templates);

                // App延迟200毫秒启动，有一些第三方组件（如iScroll）初始化比较慢，防止这一类第三方组件加载失败
                X.defer(this._launch, 200, this, [config]);
            }
        },

        // private
        _launch: function(config) {
            if (!this.isLaunched && this.beforeLaunch() !== false && this.fireEvent('beforelaunch', this) !== false) {
                this.isLaunched = true;

                if (this.cls) {
                    this.pageContainer.addClass(this.cls);
                }

                this.startUpView = $(this.startUpSelector);
                if (this.startUpView.length == 0) {
                    this.startUpView = null;
                } else {
                    // 初始化启动画面的jquery mobile element的page扩展特性，在执行第一次由启动视图切换到首视图时会使用到
                    this.startUpView.page();
                    this.startUpView.css('min-height', window.innerHeight + 'px');
                }

                // 初始化jquery mobile配置 start-----------------------------
                $.extend($.mobile, {
                    // 第一个视图
                    firstPage: this.startUpView || $(''),

                    // 当前活动那个视图
                    activePage: this.startUpView,

                    // 页面容器
                    pageContainer: this.pageContainer
                });

                // 触发页面容器创建事件
                $window.trigger('pagecontainercreate');

                // 监听页面切换事件，jquery mobile的changePage事件由App全权代理，
                // 所有需要业务功能中需要监听的页面事件，都可以在pagelet controller中获得
                this.mon(this.pageContainer, {
                    'pagechange': this.onPageChange,
                    'pagechangefailed': this.onPageChangeFailed
                });
                // end -----------------------------------------------------

                this.initDatabase();

                this.addModel(config.models);
                this.addStore(config.stores);
                this.addPagelet(config.pagelets);

                this.onLaunch();
                this.fireEvent('launch', this);

                var hash = this.getHash(),
                    pagelet = this.matchPagelet(hash);
                if (pagelet) {
                    pagelet = this.createPagelet(pagelet, hash);
                    this.changePage(pagelet);
                } else {
                    this.go(this.welcome);
                }
            }
        },

        // private 子类扩展方法
        beforeLaunch: X.emptyFn,

        // private 子类扩展方法
        onLaunch: X.emptyFn,

        // private
        createTemplateElement: function(templates) {
            this.templateCt = $(document.createElement('div'));
            this.templateCt.attr('id', 'mx-app-templates').hide();
            this.templateCt.html(templates);
            $body.append(this.templateCt);
        },

        // private
        setConfig: function(config) {
            config = $.extend({}, config);
            delete config.models;
            delete config.stores;
            delete config.pagelets;
            $.extend(this, config);

            this.pageContainer = $body; // pagelet容器

            if (this.useWebDatabase) {
                // 没有设置数据库名称，则禁用web sql database
                this.useWebDatabase = !!this.databaseName;
            }
            this.welcome = this.welcome || '';
        },

        // private
        initDatabase: function() {
            var me = this, isErr = false;
            if (me.useWebDatabase) {
                if (window.openDatabase) {
                    try {
                        me.db = window.openDatabase(me.databaseName, me.databaseVersion, me.databaseDescription, me.databaseSize, function(db) {
                            // ignore
                        });
                    } catch (e) {
                        // 在iOS下提示增加数据库容量时，如果选择“取消”，那么会抛异常“无权限访问数据库”
                        // 还有，在部分低版本（2.3及以下）Android系统下，也会出现无database权限的异常
                        isErr = true;
                    }
                } else {
                    // web sql database not supported
                    isErr = true;
                }
                if (!me.db) {
                    // 创建database失败，无法访问浏览器database对象
                    isErr = true;
                } else {
                    me.db.transaction(function(t) {
                        // 创建系统表systables，保存表名称
                        t.executeSql('CREATE TABLE IF NOT EXISTS systables (table_name)', [], function(t, result) {
                            var lastClear = LocalStorage.get('mx-app/database-last-cleaned'),
                                isToday = false,
                                now = new Date(),
                                date, expires;
                            if (lastClear) {
                                date = new Date();
                                date.setTime(lastClear);
                                isToday = now.getFullYear() == date.getFullYear() && now.getMonth() == date.getMonth() && now.getDate() == date.getDate();
                            }
                            if (X.isDefined(me.databaseExpires) && me.databaseExpires > 0 && !isToday) {
                                // 清理过期的数据
                                now = now.getTime();
                                expires = now - me.databaseExpires;
                                t.executeSql('SELECT table_name FROM systables', [], function(t, result) {
                                    var rows = result.rows, i, len, tableName;
                                    for (i = 0, len = rows.length; i < len; i++) {
                                        tableName = rows.item(i)['table_name'];
                                        t.executeSql('DELETE FROM ' + tableName + ' WHERE _last_updated < ?', [expires
                                        ]);
                                    }
                                });
                                LocalStorage.set('mx-app/database-last-cleaned', now);
                            }
                        });
                        // 创建系统表syscolumns，保存每个表的字段名
                        t.executeSql('CREATE TABLE IF NOT EXISTS syscolumns (table_name, column_name)', []);
                    }, function(error) {
                        // 发生错误禁用database
                        isErr = true;
                    });
                }

                // 不论任何原因，在初始化数据库时出现异常，则禁用web sql database
                me.useWebDatabase = !isErr;
            }
        },

        // private
        addModel: function(models) {
            if (models) {
                if (X.isArray(models)) {
                    X.each(models, function(i, model) {
                        this.addModel(model);
                    }, this);
                    return;
                }

                var props = $.extend({}, models);
                props.useWebDatabase = this.useWebDatabase ? props.useWebDatabase : false;
                props.db = this.db;
                this.models[models.id] = props;
            }
        },

        // private
        addStore: function(stores) {
            if (stores) {
                if (X.isArray(stores)) {
                    X.each(stores, function(i, store) {
                        this.addStore(store);
                    }, this);
                    return;
                }

                var props = $.extend({}, stores);
                props.useWebDatabase = this.useWebDatabase ? props.useWebDatabase : false;
                props.db = this.db;
                this.stores[stores.id] = props;
            }
        },

        // private
        addPagelet: function(pagelets) {
            if (pagelets) {
                if (X.isArray(pagelets)) {
                    X.each(pagelets, function(i, pagelet) {
                        this.addPagelet(pagelet);
                    }, this);
                    return;
                }

                var props = $.extend({}, pagelets);

                /*
                 * For example, a route of "search/:query/p:page" will match a fragment of #/search/obama/p2,
                 * passing "obama" and "2" to the action. A route of "file/*path" will match #file/nested/folder/file.txt,
                 * passing "nested/folder/file.txt" to the action.
                 */
                props.urlRe = new RegExp('^' + props.url.replace(escapeRe, '\\$&').replace(namedParamRe, '([^\/]+)').replace(splatParamRe, '(.*?)') + '$');

                this.pagelets[props.id] = props;
            }
        },

        /*
         * 获取当前URL种的hash值，例如：
         *
         * http://localhost/mx/examples/helloworld/index.html#/h
         *
         * 得到的值是 'h'
         */
        getHash: function() {
            var match = location.href.match(matchHashRe);
            return match ? match[1].replace(hashStripperRe, '') : '';
        },

        // private 使用hash匹配pagelet配置参数
        matchPagelet: function(hash) {
            var pagelet;
            X.each(this.pagelets, function(i, p) {
                if (p.urlRe && p.urlRe.test(hash)) {
                    pagelet = p;
                    return false;
                }
            });
            return pagelet;
        },

        /*
         * @private
         * 创建pagelet，系统维持一个pagelet缓冲池，缓冲池仅包含非单例的pagelet，单例pagelet始终存在，不包括在缓冲池中
         * 缓存池的数量上限不超过pageletCacheSize，超出长度的最初创建的pagelet实例将被销毁
         */
        createPagelet: function(config, hash) {
            var pagelet, p, i, len;

            config.hash = hash;

            if (config.singleton) {
                if (!config.instance) {
                    config.instance = new Pagelet(this.preparePageletConfig($.extend({}, config)));
                }
                pagelet = config.instance;
            } else if (config.noCache) {
                pagelet = new Pagelet(this.preparePageletConfig($.extend({}, config, { id: null })));
            } else {
                for (len = this.pageletCaches.length, i = len - 1; i >= 0; i--) {
                    p = this.pageletCaches[i];
                    if (p.isDestroyed || p.destroying) {
                        this.pageletCaches.splice(i, 1);
                        i--;
                        continue;
                    } else if (p.hash == hash) {
                        this.pageletCaches.splice(i, 1);
                        pagelet = p;
                        break;
                    }
                }
                if (!pagelet) {
                    pagelet = new Pagelet(this.preparePageletConfig($.extend({}, config, { id: null })));
                }
                this.pageletCaches.push(pagelet);
                len = this.pageletCaches.length;
                if (len > this.pageletCacheSize && len > 3) {
                    // 销毁超出缓存池长度的pagelet实例
                    for (i = 0; i < len; i++) {
                        p = this.pageletCaches[i];
                        if (pagelet != p) {
                            this.pageletCaches.splice(i, 1);
                            p.destroy();
                            break;
                        }
                    }
                }
            }

            return pagelet;
        },

        /*
         * @private
         * 为实例化pagelet时，准备config配置参数，将pagelet所关联的model、store实例化，并将实例对象设置到config中
         */
        preparePageletConfig: function(config) {
            var models, model, stores, store, id;
            if (config.models) {
                models = config.models;
                config.models = {};
                X.each(X.toArray(models), function(i, cfg) {
                    if (X.isString(id)) {
                        cfg = {
                            id: cfg
                        };
                    }
                    id = cfg.id;
                    model = this.models[id];
                    cfg = $.extend({}, cfg, model);
                    config.models[id] = X.create(model.cls || 'model', cfg);
                }, this);
            }
            if (config.stores) {
                stores = config.stores;
                config.stores = {};
                X.each(X.toArray(stores), function(i, cfg) {
                    if (X.isString(cfg)) {
                        cfg = {
                            id: cfg
                        };
                    }
                    id = cfg.id;
                    store = this.stores[id];
                    cfg = $.extend({}, cfg, store);
                    config.stores[id] = X.create(store.cls || 'store', cfg);
                }, this);
            }
            return config;
        },

        // private
        getPagelet: function(hash) {
            var p, i, len;
            for (len = this.pageletCaches.length, i = len - 1; i >= 0; i--) {
                p = this.pageletCaches[i];
                if (p.isDestroyed || p.destroying) {
                    this.pageletCaches.splice(i, 1);
                    i--;
                    continue;
                } else if (p.hash == hash) {
                    return p;
                }
            }
            return null;
        },

        // private
        existPagelet: function(hash) {
            return !!this.getPagelet(hash);
        },

        // private
        destroyPagelet: function(pagelet) {
            if (pagelet && !pagelet.singleton && pagelet.noCache === true) {
                pagelet.destroy();
            }
        },

        /**
         * 指定一个hash，跳转到页面
         *
         * @param {String} hash 跳转页面的hash，不包含'#/'前缀
         * 例如，要跳转到页面'http://localhost/mx/examples/helloworld/index.html#/h'
         * <code>
         *  X.App.go(‘h’); // 参数只需要输入'h'就可以了
         * </code>
         * @param {Object} options (optional) 页面跳转需要的参数
         * 由于App的页面跳转内部实现使用的是$.mobile.changePage方法，所以，这个参数与changePage()函数中的options参数是一样配置
         */
        go: function(hash, options) {
            if (!this.isPageChanging) {
                this.lastHash = hash;
                this.pageChangeOptions = $.extend({}, options);
                location.hash = '#/' + hash;
            }
        },

        /**
         * 回退到上一页面，当没有上一页的历史时，默认跳转到起始欢迎页
         */
        back: function() {
            var prev = this.history.getPrev(),
                welcome = this.welcome;
            this.history.direct({
                url: prev ? prev.url : '',
                back: function() {
                    location.hash = prev.hash;
                },
                missing: function() {
                    location.hash = '#/' + welcome;
                }
            });
        },

        // private
        onHashChange: function() {
            var hash = this.getHash(),
                pagelet;

            /*
             * 为防止页面跳转参数pageChangeOptions被错误应用，如：
             *
             * 调用 X.App.go('h', { reverse: true }); 会设置pageChangeOptions
             *
             * 同时，App触发了另一次hash更改为 'w'
             *
             * 此时，hash 'w' 的hashchange事件回调被先触发，那么，取到pageChangeOptions其实是对应hash ‘h’的参数
             *
             * 所以，验证hash的有效性，防止pageChangeOptions被应用在异常的hash上
             */
            if (this.lastHash && this.lastHash != hash) {
                this.pageChangeOptions = null;
            }

            if (!this.isPageChanging && (pagelet = this.matchPagelet(hash))) {
                pagelet = this.createPagelet(pagelet, hash);
                this.changePage(pagelet);
            } else {
                this.pageChangeOptions = null;
            }
        },

        // private
        changePage: function(pagelet) {
            var path = $.mobile.path, url, lp = this.lastPagelet, np, transition, transtionOptions;
            window.scrollTo(0, 1);
            url = path.getLocation();
            this.history.add(url, {
                url: url,
                hash: pagelet.hash
            });

            if (!this.isPageChanging && this.fireEvent('beforepagechange', this, pagelet, lp) !== false) {
                this.isPageChanging = true;
                this.pageChangeOptions = this.pageChangeOptions || {};

                np = this.nextPagelet = pagelet;

                np.render(this.pageContainer);
                np.el.css('min-height', window.innerHeight + 'px');

                transtionOptions = $.extend({}, this.pageChangeOptions, {
                    fromHashChange: true
                });

                /*
                 * 页面切换的过渡动画效果transition，基本规则如下：
                 *  1、优先使用进入页面的getTransition()动态返回效果
                 *  2、其次使用离开页面的transtion.out效果
                 *  3、再次使用进入页面的transtion.in效果
                 *  4、最末使用进入页面的transtion.out效果
                 */
                if (this.startUpView) {
                    transition = 'fade';
                }
                if (!transition && np.controller.getTransition) {
                    transition = np.controller.getTransition(np.hash, lp ? lp.hash : '');
                }
                if (!transition && lp) {
                    transition = lp.transition.hide.effect;
                    transtionOptions.reverse = lp.transition.hide.reverse;
                }
                if (!transition) {
                    transition = np.transition.show.effect || np.transition.hide.effect || 'fade';
                    transtionOptions.reverse = np.transition.show.reverse;
                }
                transtionOptions.transition = transition;

                /*
                 * 在页面切换之前，需要将页面的body的滚动条重置到顶部，否则，jquery mobile changePage函数在处理slideDown的动画效果时，
                 * 如果页面body的scrollTop在底部，会导致动画过度效果异常，页面会弹跳卡顿，动画无法正常执行
                 */
                $body.scrollTop(0);

                $.mobile.changePage(np.el, transtionOptions);
            }
        },

        // private
        onPageChange: function() {
            // 在页面切换完成之后，将body滚动到顶部，防止页面滚动条错位
            $body.scrollTop(0);
            this.fireEvent('pagechange', this, this.nextPagelet, this.lastPagelet);
            this.afterChangePage();
        },

        // private
        onPageChangeFailed: function() {
            // TODO 处理页面切换失败的情况
            this.fireEvent('pagechangefailed', this, this.nextPagelet, this.lastPagelet);
        },

        // private
        afterChangePage: function() {
            if (this.startUpView) {
                this.startUpView.remove();
                this.startUpView = null;
            }

            this.destroyPagelet(this.lastPagelet);
            this.lastPagelet = this.nextPagelet;
            this.nextPagelet = null;
            this.isPageChanging = false;
            this.pageChangeOptions = null;
            this.lastHash = null;

            this.fireEvent('pageafterchange', this, this.lastPagelet);
        },

        // private
        onOrientationChange: function(e) {
            var lp = this.lastPagelet;
            if (lp) {
                lp.el.css('min-height', window.innerHeight + 'px');
                lp.onOrientationChange();
            }
        },

        // private
        onDestroy: function() {
            X.each(this.pageletCaches, function(i, pagelet) {
                pagelet.destroy();
            }, this);
            this.pageletCaches = null;
            this.pageContainer = null;
        }
    });

    /**
     * @class MX.App
     * @singleton
     *
     * Application类的单例对象。在大多数应用场景中，不需要单独对Application实例化，直接使用X.App单例对象既可
     *
     * <code>
     *  // 启动WebApp之后，页面视图才能正常访问
     *  X.App.launch({
     *
     *      // 传入App所需要的配置参数
     *
     *  });
     * </code>
     */
    X.App = new X.app.Application();

    /*
     * Matrix框架的Appliaction，摒弃了jQuery mobile的初始化机制，而且，不能兼容包含jquery mobile core init模块的库，
     * Appliaction重新定义了，jquery mobile的初始化过程，抛弃了Navigation对window.history的时间'pushState'以及'hashchange'事件的处理，
     * 框架自身定义了一套完整的页面导航机制
     *
     * 在引入jquery mobile的js库时，一定要使用定制下载的代码，这部分代码不能包括core init模块，
     * jquery mobile定制下载地址：http://jquerymobile.com/download-builder/
     *
     * Matrix框架默认包含两个定制的jquery mobile的js文件，jquery.mobile-1.3.0.js和jquery.mobile-1.3.0-lite.js
     *
     * jquery.mobile-1.3.0.js包含除core init模块之外的所有jqmobile代码
     *
     * jquery.mobile-1.3.0-lite.js则只包含以下模块的代码：
     *  - Core，除init之外的部分
     *  - Events
     *  - Navigation
     *  - Transitions
     *  - Utilities，仅包含以下部分
     *      - match media polyfill
     *      - zoom handling
     *      - ios orientation change fix
     *  - Widgets
     *      - toolbars fixed
     *      - toolbars fixed workarounds
     *      - loading message
     */
    $('html').addClass("ui-mobile");
    window.scrollTo(0, 1);
    $.extend($.mobile, {
        // 禁用jquery mobile自动初始化页面配置
        autoInitializePage: false,

        // 禁用jquery mobile Navigation监听window.history的pushState事件
        pushStateEnabled: false,

        // 禁用jquery mobile Navigation监听hashchange事件
        hashListeningEnabled: false,

        // if defaultHomeScroll hasn't been set yet, see if scrollTop is 1
        // it should be 1 in most browsers, but android treats 1 as 0 (for hiding addr bar)
        // so if it's 1, use 0 from now on
        //defaultHomeScroll: (!$.support.scrollTop || $(window).scrollTop() === 1) ? 0 : 1

        // 以上是jquery mobile对defaultHomeScroll属性的默认实现
        // 初始化时定义为0，防止页面视图切换时滚回顶部出现抖动
        defaultHomeScroll: 0
    });
});