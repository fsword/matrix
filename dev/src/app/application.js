/**
 * @class MX.app.Application
 */
MX.kindle('jquery', 'klass', 'localstorage', 'pagelet', function(X, $, Klass, LocalStorage, Pagelet) {
    "use strict";
    
    var $window = $(window),
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
         */
        
        /**
         * @cfg {String} templateUrl 模版更新URL
         */
        
        /**
         * @cfg {Boolean} useWebDatabase true启动Web SQL Database缓存，全局配置参数，影响model、store调用db接口
         */
        useWebDatabase: true,
        
        /**
         * @cfg {Number} databaseSize 数据库大小，默认50M
         */
        databaseSize: 50 * 1024 * 1024,
        
        /**
         * @cfg {String} databaseName 数据库名称，默认'matrix_data'
         */
        databaseName: 'matrix_database',
        
        /**
         * @cfg {String} databaseVersion 数据库版本，默认'1.0'
         */
        databaseVersion: '1.0',
        
        /**
         * @cfg {String} databaseDescription 数据库描述
         */
        databaseDescription: 'offline database',
        
        /**
         * @cfg {Number} databaseExpires 数据过期时间，单位ms，默认 3 * 24 * 60 * 60 * 1000，3天后过期
         */
        databaseExpires: 3 * 24 * 60 * 60 * 1000,
        
        /**
         * @cfg {String} startUpSelector 启动画面selector
         */
        startUpSelector: 'div#startUpView',
        
        /**
         * @cfg {Number} pageletCacheSize pagelet缓存大小，默认为30
         */
        pageletCacheSize: 30,
        
        // private
        init: function() {
            this.models = {};
            this.stores = {};
            this.pagelets = {};
            
            // pagelet缓存池
            this.pageletCaches = this.pageletCaches || [];
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event beforelaunch
                 */
                'beforelaunch',
                /**
                 * @event launch
                 */
                'launch',
                /**
                 * @event pagebeforechange
                 */
                'pagebeforechange',
                /**
                 * @event pagechange
                 */
                'pagechange',
                /**
                 * @event pageafterchange
                 */
                'pageafterchange',
                /**
                 * @event pagechangefailed
                 */
                'pagechangefailed'
            );
            
            // 监听hashchange，当hash发生改变时，切换Pagelet
            this.mon(window, 'hashchange', this.onHashChange);
        },
        
        /**
         * 运行WebApp
         * @param {Object} config
         */
        launch: function(config) {
            config = config || {};
            this.setConfig(config);
            
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
                    
                    if ($.now() - dt > 200) {
                        this._launch(config);
                    } else {
                        X.defer(this._launch, 200, this, [config]);
                    }
                }).fail(function() {
                    // TODO 加载模版失败
                });
            } else {
                this.createTemplateElement(templates);
                
                // iScroll加载需要延迟200毫秒，防止iScroll加载失败
                X.defer(this._launch, 200, this, [config]);
            }
        },
        
        // private
        _launch: function(config) {
            if (!this.isLaunched && this.beforeLaunch() !== false && this.fireEvent('beforelaunch', this) !== false) {
                this.isLaunched = true;
                
                this.startUpView = $(this.startUpSelector);
                if (this.startUpView.length == 0) {
                    this.startUpView = null;
                } else {
                    /*
                     * 初始化启动画面状态，jquery mobile changePage()会使用到
                     */
                    this.startUpView.page();
                    this.startUpView.css('min-height', window.innerHeight + 'px');
                }
            
                // 初始化jquery mobile配置
                // start ---------------------------------------------------
                $.extend($.mobile, {
                    firstPage: this.startUpView || $(''),
                    activePage: this.startUpView,
                    pageContainer: this.pageContainer
                });
                $window.trigger('pagecontainercreate');
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
        
        // private
        beforeLaunch: X.emptyFn,
        
        // private
        onLaunch: X.emptyFn,
        
        // private
        createTemplateElement: function(templates) {
            this.templateCt = $(document.createElement('div'));
            this.templateCt.attr('id', 'mx-app-templates').hide();
            this.templateCt.html(templates);
            $('body').append(this.templateCt);
        },
        
        // private
        setConfig: function(config) {
            config = $.extend({}, config);
            delete config.models;
            delete config.stores;
            delete config.pagelets;
            $.extend(this, config);
            
            this.pageContainer = $('body');
            
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
                    } catch(e) {
                        // 在iOS下提示增加数据库容量时，如果选择“取消”，那么会抛异常“无权限访问数据库”
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
                                date,
                                expires;
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
                                    var rows = result.rows,
                                        i, len,
                                        tableName;
                                    for (i = 0, len = rows.length; i < len; i++) {
                                        tableName = rows.item(i)['table_name'];
                                        t.executeSql('DELETE FROM ' + tableName + ' WHERE _last_updated < ?', [expires]);
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
                
                var props = $.extend({}, models, { id: null }),
                    id = models.id;
                props.useWebDatabase = this.useWebDatabase ? props.useWebDatabase : false;
                props.db = this.db;
                this.models[id] = props;
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
                
                var props = $.extend({}, stores, { id: null }),
                    id = stores.id;
                props.useWebDatabase = this.useWebDatabase ? props.useWebDatabase : false;
                props.db = this.db;
                this.stores[id] = props;
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
        
        // private
        getHash: function() {
            var match = location.href.match(matchHashRe);
            return match ? match[1].replace(hashStripperRe, '') : '';
        },
        
        // private
        // 使用hash匹配pagelet
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
         * 创建pagelet，系统维持一个pagelet缓冲池，缓冲池仅包含非单例的pagelet，
         * 单例pagelet始终存在，不包括在缓冲池中
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
                    /*
                     * pagelet缓存池最大数量不超过pageletCacheSize，超出长度的pagelet进行销毁
                     */
                    for (i = 0; i < len; i++) {
                        p = this.pageletCacheSize[i];
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
        
        // private
        preparePageletConfig: function(config) {
            var models, model,
                stores, store;
            if (config.models) {
                models = config.models;
                config.models = {};
                X.each(X.toArray(models), function(i, id) {
                    model = this.models[id];
                    config.models[id] = X.create(model.cls || 'model', $.extend({}, model));
                }, this);
            }
            if (config.stores) {
                stores = config.stores;
                config.stores = {};
                X.each(X.toArray(stores), function(i, id) {
                    store = this.stores[id];
                    config.stores[id] = X.create(store.cls || 'store', $.extend({}, store));
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
        
        /**
         * 转向到hash
         * @param {String} hash
         */
        go: function(hash) {
            window.location.hash = '#/' + hash;
        },
        
        /**
         * 回退
         * @param {String} (optional) defaultHash 当访问路径历史没有上一页时，默认跳转hash
         */
        back: function(defaultHash) {
            $.mobile.back();
        },
        
        // private
        onHashChange: function() {
            var hash = this.getHash(),
                pagelet = this.matchPagelet(hash);
            if (pagelet) {
                pagelet = this.createPagelet(pagelet, hash);
                this.changePage(pagelet);
            }
        },
        
        // private
        changePage: function(pagelet) {
            if (this.fireEvent('beforepagechange', this, pagelet) !== false) {
                var lp = this.lastPagelet,
                    np = this.nextPagelet = pagelet;
                
                np.render(this.pageContainer);
                np.el.css('min-height', window.innerHeight + 'px');
                
                $.mobile.changePage(np.el, {
                    transition: this.startUpView ? 'fade' : np.transition,
                    fromHashChange: true
                });
            }
        },
        
        // private
        onPageChange: function() {
            this.fireEvent('pagechange', this, this.nextPagelet, this.lastPagelet);
            this.afterChangePage();
        },
        
        // private
        onPageChangeFailed: function() {
            this.fireEvent('pagechangefailed', this, this.nextPagelet, this.lastPagelet);
        },
        
        // private
        afterChangePage: function() {
            if (this.startUpView) {
                this.startUpView.remove();
                this.startUpView = null;
            }
            
            this.lastPagelet = this.nextPagelet;
            this.nextPagelet = null;
            this.fireEvent('pageafterchange', this, this.lastPagelet);
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
     * Application类的单例对象。在大多数应用场景中，不需要单独对Application实例化，直接使用X.App单例对象既可。
     */
    X.App = new X.app.Application();
});

// 初始化jquery mobile配置
if ($ && $.mobile) {
    $('html').addClass( "ui-mobile" );
    
    window.scrollTo( 0, 1 );
    
    $.extend($.mobile, {
        autoInitializePage: false,
        pushStateEnabled: false,
        hashListeningEnabled: false,
        
        // if defaultHomeScroll hasn't been set yet, see if scrollTop is 1
        // it should be 1 in most browsers, but android treats 1 as 0 (for hiding addr bar)
        // so if it's 1, use 0 from now on
        defaultHomeScroll: ( !$.support.scrollTop || $(window).scrollTop() === 1 ) ? 0 : 1
    });
}