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
         */
        tableName: 'storepaging',
        
        /**
         * @cfg {Boolean} useCache 当网络离线或本地数据库有数据时，优先使用本地数据
         */
        useCache: false,
        
        /**
         * @cfg {Number} 缓存过期时间，单位毫秒，默认60 * 60 * 1000（1小时）
         */
        cacheExpires: 60 * 60 * 1000,
        
        /**
         * @cfg {String} storageKey 数据存储时，data record primary key
         * record的pk值一般有两部分，storageKey+pageNumber，例如：list-1
         * 如果为设定storageKey，那么会默认设置为Store.alias值
         */
        
        /**
         * @cfg {String} idProperty 赋值给model
         */
        idProperty: 'id',
        
        /**
         * @cfg {Array} fields 赋值给model
         */

        /**
         * @cfg {String} url AJAX请求API
         */
        
        /**
         * @cfg {String} requestMethod AJAX请求类型，默认'GET'
         */
        requestMethod: 'GET',

        /**
         * @cfg {String} dataType 默认'json'
         */
        dataType: 'json',
        
        /**
         * @cfg {Object} baseParams AJAX请求提交给服务端的默认参数
         */
        
        /**
         * @cfg {String} dataProperty AJAX接收服务端响应JSON数据的属性名，默认'data'
         */
        dataProperty: 'data',

        /**
         * @cfg {Object} meta 服务端响应数据json属性名映射
         * 
         *      {String} pageNumberProperty 翻页请求，提交参数名，默认'pageNumber'
         *      pageNumberProperty: 'pageNumber',
         * 
         *      {String} pageSizeProperty 翻页请求，提交参数名，默认'pageSize'
         *      pageSizeProperty: 'pageSize',
         * 
         *      {String} pageStartProperty 翻页请求，提交参数名，默认'pageStart'
         *      pageStartProperty: 'pageStart',
         * 
         *      {String} totalProperty 翻页请求，服务端响应数据，JSON参数名，默认'total'
         *      totalProperty: 'total',
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
         * @cfg {Boolean} showPageLoading true显示$.mobile.showPageLoadingMsg，默认false
         */
        showPageLoading: false,
        
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
             * @property {Number} currentPage 当前页
             */
            this.currentPage = 1;
            
            /**
             * @property {Number} total 总记录数
             */
            this.total = undefined;
            
            /**
             * @property fetched
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
                 */
                'datachanged',
                /**
                 * @event beforeload
                 */
                'beforeload',
                /**
                 * @event load
                 */
                'load',
                /**
                 * @event loadfailed
                 */
                'loadfailed',
                /**
                 * @event loadcomplete
                 */
                'loadcomplete'
            );
        },
        
        /**
         * 加载数据
         */
        load: function(params) {
            var maxPage = this.maxPage, pageNumber;
            params = params || {};
            params.data = params.data || {};
            pageNumber = params.data.page || this.currentPage;
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            params.data.page = pageNumber;
            if (!this.removed && !this.loading && pageNumber <= maxPage && this.fireEvent('beforeload', this, pageNumber) !== false) {
                this.loading = true;
                this.toPage = pageNumber;
                if (this.showPageLoading) {
                    this.showPageLoadingMsg();
                }
                if (this.useWebDatabase && this.useCache) {
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
            var pageNumber;
            params = params || {};
            params.data = params.data || {};
            pageNumber = params.data.page || this.currentPage;
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            params.data.page = pageNumber;
            if (!this.removed && !this.loading && this.fireEvent('beforeload', this, pageNumber) !== false) {
                this.loading = true;
                this.toPage = pageNumber;
                if (this.showPageLoading) {
                    this.showPageLoadingMsg();
                }
                this.fetch(params);
            }
        },
        
        // private 强制从服务端取得数据，并更新本地缓存
        fetch: function(params) {
            var meta = this.meta, pageNumber = params.data.page;
            params.data[meta.pageNumberProperty] = pageNumber;
            params.data[meta.pageSizeProperty] = this.pageSize;
            params.data[meta.pageStartProperty] = (pageNumber - 1) * this.pageSize;
            params.data['_dt'] = $.now(); // 时间戳，防止缓存
            params.data = $.extend({}, this.baseParams, params.data);
            params = $.extend(this.getOptions ? this.getOptions(this.params) : {}, {
                type: this.requestMethod,
                url: this.getUrl ? this.getUrl(this.params) : this.url
            }, params, {
                dataType: this.dataType || 'json'
            });
            this.cancelFetch();
            this.lastXmlRequest = $.ajax(params)
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
         * 获取第一页
         */
        first: function() {
            this.load({
                data: {
                    page: 1
                }
            });
        },
        
        /**
         * 获取最后一页
         */
        last: function() {
            if (X.isDefined(this.total)) {
                var pageCount = this.getPageData().pageCount;
                this.load({
                    data: {
                        page: pageCount
                    }
                });
            }
        },
        
        /**
         * 获取前一页
         */
        prev: function() {
            this.load({
                data: {
                    page: this.currentPage - 1
                }
            });
        },
        
        /**
         * 获取后一页
         */
        next: function() {
            if (this.currentPage == 1 && this.get().length == 0) {
                // 如果第一页没有加载到数据，则重新load第一页
                this.first();
            } else {
                this.load({
                    data: {
                        page: this.currentPage + 1
                    }
                });
            }
        },
        
        /**
         * 增加数据
         */
        add: function(record) {
            this.appendData(X.toArray(record));
        },
        
        /**
         * 插入一条数据
         */
        insert: function(index, record) {
            this.data.insert(index, this.createModel(record));
            this.fireEvent('datachanged', this);
        },
        
        /**
         * 移除数据
         */
        remove: function(id) {
            var r = this.data.item(id);
            if (r) {
                r.destroy();
            }
        },
        
        /**
         * 递归
         */
        each: function(fn, scope) {
            this.data.each(fn, scope || this);
        },
        
        /**
         * 获取store数据
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

        // private
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
        
        // private
        getStorageKey: function(pageNumber) {
            return this.storageKey + '-' + pageNumber;
        },
        
        // private
        loadStorage: function(params) {
            var me = this, 
                pageNumber = params.data.page,
                id;
            if (me.useWebDatabase) {
                id = me.getStorageKey(pageNumber);
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
                id = me.getStorageKey(me.currentPage);
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