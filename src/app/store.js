/**
 * @class MX.app.Store
 * @alias store
 */
MX.kindle('jquery', 'klass', 'collection', function(X, $, Klass, Collection) {
    X.app.Store = Klass.define({
        // private
        alias: 'store',
        
        // private
        extend: 'utility',

        // private
        isStore: true,
        
        /**
         * @cfg {Boolean} useWebDatabase true启动web sql database缓存数据，默认true
         */
        useWebDatabase: true,
        
        /**
         * @cfg {String} tableName 数据表名，默认'storepaging'
         * 如果未设置表名，则useWebDatabase会被设置为false
         */
        tableName: 'storepaging',
        
        /**
         * @cfg {Boolean} useCache 当本地数据库有数据时，优先使用本地数据
         */
        useCache: false,
        
        /**
         * @cfg {Number} 缓存过期时间，单位毫秒，默认10 * 60 * 1000（10分钟）
         */
        cacheExpires: 10 * 60 * 1000,
        
        /**
         * @cfg {String} storageKey 数据存储时，data record primary key
         * record的pk值一般有两部分，storageKey+pageNumber，例如：list-1
         * 如果为设定storageKey，那么会默认设置为store.id值
         */
        
        /**
         * @cfg {String} idProperty 赋值给model
         */
        idProperty: 'id',
        
        /**
         * @cfg {Array} fields 赋值给model，参见{Model#fields}的API
         */

        /**
         * @cfg {String} url AJAX请求URL
         */

        /**
         * @cfg {Function} getUrl 动态获取AJAX请求URL
         * 包含参数：
         *  - Object : params 页面hash中包含的参数
         *  - String : type 请求类型，create、read、update、destroy
         *
         * <code>
         *  getUrl: function(params, type) {
         *      return '';
         *  }
         * </code>
         */
        
        /**
         * @cfg {String} requestMethod AJAX请求类型，默认'GET'
         */
        requestMethod: 'GET',

        /**
         * @cfg {String} dataType 服务端响应数据类型，默认'json'
         */
        dataType: 'json',
        
        /**
         * @cfg {Object} baseParams AJAX请求的默认参数
         * 允许设置jquery.ajax(settings)函数的参数settings包含的属性
         */

        /**
         * @cfg {Object} getData 返回一组AJAX请求使用的data参数
         * 包含一个参数：
         *  - Object : params 页面hash中包含的参数
         *
         * <code>
         *  getData: function(params) {
         *      return {
         *          // ...
         *      };
         *  }
         * </code>
         */
        
        /**
         * @cfg {String} dataProperty AJAX接收服务端响应JSON数据的属性名，默认'data'
         */
        dataProperty: 'data',

        /**
         * @cfg {Object} meta 服务端响应数据json属性名映射
         *  设置的数据项包括
         *      String : pageNumberProperty 翻页请求，提交参数名，默认'pageNumber'
         *      String : pageSizeProperty 翻页请求，提交参数名，默认'pageSize'
         *      String : pageStartProperty 翻页请求，提交参数名，默认'pageStart'
         *      String : totalProperty 翻页请求，服务端响应数据，JSON参数名，默认'total'
         *
         *  例如：
         *      meta: {
         *          pageNumberProperty: 'pageNumber',
         *          pageSizeProperty: 'pageSize',
         *          pageStartProperty: 'pageStart',
         *          totalProperty: 'total'
         *      }
         */

        /**
         * @cfg {Number} pageSize 每页记录数，默认20
         */
        pageSize: 20,
        
        /**
         * @cfg {Number} maxPage store翻页的最大页数
         */
        maxPage: Number.MAX_VALUE,

        /**
         * @cfg {Boolean} showPageLoading true显示加载中DOM，默认false
         * 调用$.mobile.showPageLoadingMsg()方法
         */
        showPageLoading: false,

        /**
         * @cfg {Boolean} autoLoad true自动加载model
         * 这个属性提供给pagelet使用，当页面进入时，自动加载model数据
         */

        /**
         * @cfg {String} bindTo 将model绑定到一个page区域
         * 可选参数: 'header' 'footer' 'body'
         * 将model绑定到一个page区域，当model加载数据时，自动渲染对应区域的模版
         */
        
        // private
        init: function() {
            this.baseParams = this.baseParams || {};
            this.storageKey = this.storageKey || this.id;
            this.meta = this.meta || {};
            X.applyIf(this.meta, {
                pageNumberProperty: 'page',
                pageSizeProperty: 'pageSize',
                pageStartProperty: 'pageStart',
                totalProperty: 'total'
            });
            
            this.initTable();
            
            /**
             * @property {Number} currentPage
             * 当前页
             */
            this.currentPage = 1;
            
            /**
             * @property {Number} total
             * 总记录数
             */
            this.total = undefined;
            
            /**
             * @property {Boolean} fetched
             * true表示已从服务器取值
             */
            this.fetched = false;
            
            this.data = new Collection({
                getKey: function(o) {
                    return o.data[o.idProperty];
                }
            });
        },

        // private
        initTable: function() {
            var me = this;
            if (!me.db || !me.tableName || !me.storageKey) {
                me.useWebDatabase = false;
            }
            if (me.useWebDatabase) {
                me.db.transaction(function(t) {
                    t.executeSql('CREATE TABLE IF NOT EXISTS ' + me.tableName + ' (id UNIQUE, value, _last_updated TIMESTAMP)', [], function(t, result) {
                        // 清理过期数据
                        t.executeSql('DELETE FROM ' + me.tableName + ' WHERE _last_updated < ?', [$.now() - me.cacheExpires]);
                        t.executeSql('SELECT * FROM systables WHERE table_name = ?', [me.tableName], function(t, result) {
                            if (result.rows.length == 0) {
                                t.executeSql('INSERT INTO systables VALUES (?)', [me.tableName]);
                            }
                        });
                    });
                }, function(error) {
                    // database error
                });
            }
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event datachanged
                 * 当store值改变时触发
                 * @param {Store} this
                 */
                'datachanged',
                /**
                 * @event beforeload
                 * 当store加载数据之前触发，返回false则中断操作
                 * @param {Store} this
                 */
                'beforeload',
                /**
                 * @event load
                 * 当store加载数据之后触发
                 * @param {Store} this
                 */
                'load',
                /**
                 * @event loadfailed
                 * 当store加载数据失败时触发
                 * @param {Store} this
                 */
                'loadfailed',
                /**
                 * @event loadcomplete
                 * 当store加载数据完成时触发
                 * @param {Store} this
                 */
                'loadcomplete'
            );
        },
        
        /**
         * 加载数据
         */
        load: function(params, /*private*/ force) {
            var maxPage = this.maxPage, pageNumber;
            params = $.extend({}, params, this.getData ? this.getData(this.params) : null);
            pageNumber = params.page || this.currentPage;
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            params.page = pageNumber;
            if (!this.removed && !this.loading && pageNumber <= maxPage && this.fireEvent('beforeload', this, pageNumber) !== false) {
                this.loading = true;
                this.toPage = pageNumber;

                if (this.showPageLoading) {
                    this.showPageLoadingMsg();
                }

                /*
                 * 在网络离线时，强制使用本地缓存，因为，网络离线再使用AJAX请求数据已经没有意义了
                 */
                if (!window.navigator.onLine || (!force && this.useWebDatabase && this.useCache)) {
                    this.loadStorage(params);
                } else {
                    this.fetch(params);
                }
            }
        },

        /**
         * 重新加载数据
         */
        reload: function(params) {
            params = params || {};
            params.page = this.currentPage;
            this.load(params, true);
        },

        // private 强制从服务端取得数据，并更新本地缓存
        fetch: function(params) {
            var meta = this.meta, pageNumber = params.page, options;
            params[meta.pageNumberProperty] = pageNumber;
            params[meta.pageSizeProperty] = this.pageSize;
            params[meta.pageStartProperty] = (pageNumber - 1) * this.pageSize;
            params['_dt'] = $.now(); // 时间戳，防止缓存
            options = $.extend({}, this.baseParams, {
                type: this.requestMethod,
                url: this.getUrl ? this.getUrl(this.params, 'read') : this.url,
                dataType: this.dataType || 'json',
                data: params
            });
            this.cancelFetch();
            this.lastXmlRequest = $.ajax(options)
                                   .done($.proxy(this.onFetchSuccess, this))
                                   .fail($.proxy(this.handleLoadFailed, this))
                                   .always($.proxy(this.handleRequestComplete, this));
        },
        
        // private
        cancelFetch: function() {
            if (this.lastXmlRequest) {
                this.lastXmlRequest.abort();
                this.lastXmlRequest = null;
            }
        },
        
        // private
        onFetchSuccess: function(data, status, xhr) {
            if (!data) { // ajax请求被取消，abort
                return;
            }
            var rs = this.dataProperty ? data[this.dataProperty] : data;
            this.handleLoadSuccess(rs);
            this.updateStorage();
        },
        
        // private
        handleLoadSuccess: function(rs) {
            rs = rs || [];
            this.lastPage = this.currentPage; // 记录上一次翻页的页码
            this.currentPage = this.toPage;
            if (rs.length > 0) {
                var meta = this.meta;
                if (X.isDefined(rs[meta.totalProperty])) {
                    this.total = rs[meta.totalProperty];
                }
                this.data.clear();
                this.appendData(rs);
                this.fireEvent('datachanged', this);
            } else {
                this.data.clear();
                this.fireEvent('datachanged', this);
            }
            this.fireEvent('load', this);
        },
        
        // private
        handleLoadFailed: function() {
            this.data.clear();
            this.fireEvent('loadfailed', this);
        },
        
        // private
        handleRequestComplete: function() {
            this.loading = false;
            this.lastXmlRequest = null;
            if (this.showPageLoading) {
                this.hidePageLoadingMsg();
            }
            this.fireEvent('loadcomplete', this);
        },
        
        // private
        appendData: function(rs) {
            X.each(rs, function(key, value) {
                this.data.add(this.createModel(value));
            }, this);
        },
        
        // private
        createModel: function(value) {
            return X.create('model', {
                useWebDatabase: false,
                idProperty: this.idProperty,
                fields: this.fields,
                values: value,
                listeners: {
                    scope: this,
                    'datachanged': function(model) {
                        this.fireEvent('datachanged', this, model);
                    },
                    'destroy': function(model) {
                        this.data.remove(model);
                        this.fireEvent('datachanged', this, model);
                    }
                }
            });
        },
        
        /**
         * 加载第一页
         */
        first: function() {
            this.load({
                page: 1
            });
        },
        
        /**
         * 加载最后一页
         */
        last: function() {
            if (X.isDefined(this.total)) {
                var pageCount = this.getPageData().pageCount;
                this.load({
                    page: pageCount
                });
            }
        },
        
        /**
         * 加载前一页
         */
        prev: function() {
            this.load({
                page: this.currentPage - 1
            });
        },
        
        /**
         * 加载后一页
         */
        next: function() {
            if (this.currentPage == 1 && this.get().length == 0) {
                // 如果第一页没有加载到数据，则重新load第一页
                this.first();
            } else {
                this.load({
                    page: this.currentPage + 1
                });
            }
        },
        
        /**
         * 增加数据
         * @param {Object} record
         */
        add: function(record) {
            this.appendData(X.toArray(record));
        },
        
        /**
         * 插入一条数据
         * @param {index} index 索引位置，插入在索引位置之后
         * @param {Object} record
         */
        insert: function(index, record) {
            this.data.insert(index, this.createModel(record));
            this.fireEvent('datachanged', this);
        },
        
        /**
         * 移除数据
         * @param {String} id
         */
        remove: function(id) {
            var r = this.data.item(id);
            if (r) {
                r.destroy();
            }
        },
        
        /**
         * 递归
         * @param {Function} fn
         * @param {Object} scope
         */
        each: function(fn, scope) {
            this.data.each(fn, scope || this);
        },
        
        /**
         * 获取store的值
         * @param {String/Boolean} id (optional) model的id
         * @param {Boolean} raw (optional) ture表示获取未包装的原始值
         * @return {String/Object} values
         */
        get: function(id, raw) {
            var rs, model;
            if (X.isBoolean(id)) {
                raw = id;
                id = null;
            }
            if (id) {
                model = this.data.item(id);
                if (model) {
                    rs = model.get(raw); 
                }
            } else {
                rs = [];
                this.each(function(model) {
                    rs.push(model.get(raw));
                });
            }
            return rs;
        },

        /**
         * 获得页面分页信息
         * @returns {Object}
         *  包含：
         *      Number : total
         *      Number : maxPage
         *      Number : currentPage
         *      Number : pageCount
         *      Number : fromRecord
         *      Number : toRecord
         */
        getPageData: function() {
            return {
                total: this.total,
                maxPage: this.maxPage,
                currentPage: this.currentPage,
                pageCount: X.isDefined(this.total) ? Math.ceil(this.total / this.pageSize) : 1,
                fromRecord: ((this.currentPage - 1) * this.pageSize) + 1,
                toRecord: X.isDefined(this.total) ? Math.min(this.currentPage * this.pageSize, this.total) : this.pageSize
            };
        },
        
        /**
         * 将model修改同步到服务端
         */
        sync: function() {
            // TODO
        },

        /**
         * 返回数据存储的主键值
         * @param {String} storageKey 主键前缀
         * @param {String} pageNumber 页码
         * @param {Object} param 页面hash中包含的参数
         * @returns {String} primary key
         */
        getStorageKey: function(storageKey, pageNumber, params) {
            return storageKey + '-' + pageNumber;
        },
        
        // private
        loadStorage: function(params) {
            var me = this, 
                pageNumber = params.page,
                id;
            if (me.useWebDatabase) {
                id = me.getStorageKey(me.storageKey, pageNumber, me.params);
                me.db.transaction(function(t) {
                    t.executeSql('SELECT * FROM ' + me.tableName + ' WHERE id = ?', [id], function(t, result) {
                        if (result.rows.length > 0) {
                            var item = result.rows.item(0);
                            if ((item['_last_updated'] + me.cacheExpires) < $.now()) {
                                // 本地数据过期，刷新数据
                                me.fetch(params);
                            } else {
                                try {
                                    me.handleLoadSuccess(JSON.parse(item['value']));
                                } catch (e) {
                                    me.handleLoadFailed();
                                }
                                me.handleRequestComplete();
                            }
                        } else {
                            me.fetch(params);
                        }
                    });
                }, function(error) {
                    me.handleLoadFailed();
                    me.handleRequestComplete();
                });
            } else {
                me.fetch(params);
            }
        },
        
        // private
        updateStorage: function() {
            var me = this, 
                id;
            if (me.useWebDatabase) {
                id = me.getStorageKey(me.storageKey, me.currentPage, me.params);
                me.db.transaction(function(t) {
                    t.executeSql('SELECT * FROM ' + me.tableName + ' WHERE id = ?', [id], function(t, result) {
                        try {
                            var props = [],
                                value = JSON.stringify(me.get(null, true)),
                                sql;
                            if (result.rows.length > 0) { // 更新数据
                                sql = 'UPDATE ' + me.tableName + ' SET value = ?, _last_updated = ? WHERE id = ?';
                                props.push(value);
                                props.push($.now());
                                props.push(id);
                            } else {
                                sql = 'INSERT INTO ' + me.tableName + ' (id, value, _last_updated) VALUES (?, ?, ?)';
                                props.push(id);
                                props.push(value);
                                props.push($.now());
                            }
                            t.executeSql(sql, props);
                        } catch(e) {
                            // ignore
                        }
                    });
                }, function(error) {
                    // database error
                });
            }
        },

        // private
        showPageLoadingMsg: function() {
            $.mobile.showPageLoadingMsg();
        },

        // private
        hidePageLoadingMsg: function() {
            $.mobile.hidePageLoadingMsg();
        },
        
        // private
        onDestroy: function() {
            this.db = null;
        }
    });
});