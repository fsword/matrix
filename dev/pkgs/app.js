/**
 * @class MX.app.Template
 * @alias template
 */
MX.kindle('jquery', 'arttemplate', 'klass', function(X, $, artTemplate, Klass) {
    X.app.Template = Klass.define({
        // private
        alias: 'template',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {String} container 模版渲染的容器
         */
        
        /**
         * @cfg {String} target 获取模版的Selector
         */
        
        /**
         * @cfg {String} template 模版HTML String
         */
        
        // private
        init: function() {
            if (!this.template) {
                this.template = artTemplate($(this.target || ('#' + this.id)).html());
            } else if (X.isString(this.template)) {
                this.template = artTemplate(this.template);
            }
            if (this.store) {
                this.bindStore(this.store, true);
                delete this.store;
            }
        },
        
        /**
         * 获得应用模版生成的HTML代码片段
         */
        applyTemplate: function(data) {
            if (this.template) {
                return this.template(data || {});
            }
            return '';
        },
        
        /**
         * 渲染模版
         */
        render: function(container, data) {
            if (X.isObject(container)) {
                data = container;
                container = null;
            }
            container = container || this.container;

            // getData()与this.params这两个接口是从View中调用
            // 在View.render()中会设置
            data = this.getData(this.params, data || {});

            container.html(this.applyTemplate(data));
        },

        // private
        getData: function(params, data) {
            return data;
        },

        /**
         * 绑定store
         */
        bindStore: function(store, /*private*/initial) {
            if (initial !== true) {
                this.unbindStore();
            }
            if (store) {
                this.store = store;
                // TODO 是否应当绑定datachanged事件？实时响应数据更改，刷新页面
                this.mon(this.store, 'load', this.onStoreLoad);
            }
        },

        /**
         * 移除绑定store
         */
        unbindStore: function() {
            if (this.store) {
                this.mun(this.store, 'load', this.onStoreLoad);
                this.store = null;
            }
        },

        // private
        onStoreLoad: function() {
            var data, store = this.store;
            if (store.isModel) {
                data = store.get();
            } else {
                data = {};
                data[store.dataProperty] = store.get();
            }
            this.render(data);
        },

        // private
        onDestroy: function() {
            this.unbindStore();
        }
    });
});
/**
 * @class MX.app.Model
 * @alias model
 */
MX.kindle('klass', 'dateformat', function(X, Klass, DateFormat) {
    X.app.Model = Klass.define({
        // private
        alias: 'model',
        
        // private
        extend: 'utility',

        // private
        isModel: true,
        
        /**
         * @cfg {Boolean} useWebDatabase true启动web sql database缓存数据，默认true
         */
        useWebDatabase: true,
        
        /**
         * @cfg {String} tableName 数据表名
         */
        
        /**
         * @cfg {Boolean} useCache 当网络离线或本地数据库有数据时，优先使用本地数据
         */
        useCache: false,
        
        /**
         * @cfg {Number} cacheExpires 缓存过期时间，单位毫秒，默认60 * 60 * 1000（1小时）
         */
        cacheExpires: 60 * 60 * 1000,
        
        /**
         * @cfg {Array} fields 开启useCache时，必须设置fields字段
         */

        /**
         * @cfg {String} url AJAX请求API
         */
        
        /**
         * @cfg {String/Object} restful AJAX请求API
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
         * @cfg {String} idProperty model的id属性名，默认'id'
         */
        idProperty: 'id',
        
        /**
         * @cfg {String} dataProperty AJAX接收服务端响应JSON数据的属性名，默认'data'
         */
        dataProperty: 'data',
        
        /**
         * @cfg {Object} values 初始值
         */

        /**
         * @cfg {Boolean} showPageLoading true显示$.mobile.showPageLoadingMsg，默认false
         */
        showPageLoading: false,
        
        // private
        init: function() {
            this.baseParams = this.baseParams || {};
            
            this.initRestful();
            this.initFields();
            this.initTable();
            
            /**
             * @property dirty
             * true表示model的值被修改
             */
            this.dirty = false;
            
            /**
             * @property fetched
             * true表示已从服务器取值
             */
            this.fetched = false;
            
            /**
             * @property removed
             * true表示当前model数据已删除
             */
            this.removed = false;
            
            this.modified = {}; // model被修改的值
            this.data = {};
            
            if (this.values) {
                this.set(this.values);
                delete this.values;
            }
        },
        
        // private
        initRestful: function() {
            var actions = {
                create: 'create',
                read: 'read',
                update: 'update',
                destroy: 'destroy'
            }, rest, rests;
            
            this.restful = this.restful || this.url || {};
            
            if (X.isString(this.restful)) {
                this.restful = {
                    create: this.restful,
                    read: this.restful,
                    update: this.restful,
                    destroy: this.restful
                };
            }
            
            rests = {};
            X.each(actions, function(i, action) {
                rest = this.restful[action];
                if (X.isString(rest)) {
                    rest = {
                        url: rest,
                        type: this.requestMethod
                    };
                } else {
                    rest = $.extend({
                        type: this.requestMethod
                    }, rest)
                }
                rests[action] = rest;
            }, this);
            
            this.restful = rests;
        },
        
        // private
        initFields: function() {
            if (this.fields) {
                var fields = {};
                X.each(this.fields, function(i, field) {
                    if (X.isString(field)) {
                        field = {
                            name: field
                        };
                    }
                    fields[field.name] = field;
                }, this);
                if (!fields[this.idProperty]) {
                    fields[this.idProperty] = {
                        name: this.idProperty
                    };
                }
                this.fields = fields;
            }
        },
        
        // private
        initTable: function() {
            var me = this;
            if (!me.fields || !me.db || !me.tableName) {
                me.useWebDatabase = false;
            }
            if (me.useWebDatabase) {
                var name, fields = me.fields,
                    columnName = [],
                    columns = [];
                    
                columns.push(me.idProperty + ' UNIQUE');
                for (name in fields) {
                    if (name != me.idProperty) {
                        columns.push(name);
                        columnName.push(name);
                    }
                }
                columns.push('_last_updated TIMESTAMP');
                
                columns = columns.join(', ');
                columnName = columnName.join(',');
                
                me.db.transaction(function(t) {
                    t.executeSql('CREATE TABLE IF NOT EXISTS ' + me.tableName + ' (' + columns + ')', [], function(t, result) {
                        // 清理过期数据
                        t.executeSql('DELETE FROM ' + me.tableName + ' WHERE _last_updated < ?', [$.now() - me.cacheExpires]);
                        t.executeSql('SELECT * FROM systables WHERE table_name = ?', [me.tableName], function(t, result) {
                            if (result.rows.length == 0) {
                                t.executeSql('INSERT INTO systables VALUES (?)', [me.tableName]);
                            }
                        });
                        t.executeSql('SELECT column_name FROM syscolumns WHERE table_name = ?', [me.tableName], function(t, result) {
                            var resetTable = true;
                            if (result.rows.length == 0) {
                                t.executeSql('INSERT INTO syscolumns VALUES (?, ?)', [me.tableName, columnName]);
                            } else if (result.rows.item(0)['column_name'] != columnName) { // 更新表字段
                                t.executeSql('UPDATE syscolumns SET column_name = ? WHERE table_name = ?', [columnName, me.tableName]);
                            } else {
                                resetTable = false;
                            }
                            if (resetTable) {
                                t.executeSql('DROP TABLE ' + me.tableName, []);
                                t.executeSql('CREATE TABLE IF NOT EXISTS ' + me.tableName + ' (' + columns + ')', []);
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
                 * @event idchanged
                 */
                'idchanged',
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
         * 给model赋值，触发datachanged事件
         */
        set: function(name, value) {
            var data = this.data,
                modified = this.modified,
                currentValue, key, isDirty,
                idChanged, oldId, newId,
                changed = {},
                currValues = {},
                values, fields;
            
            if (X.isString(name)) {
                values = {};
                values[name] = value;
            } else {
                values = name;
            }
            
            fields = this.fields || values;
            
            for (name in fields) {
                if (values.hasOwnProperty(name)) {
                    value = X.isDefined(values[name]) ? values[name] : '';
                    currentValue = data[name];
                    
                    if (modified[name] === value) {
                        data[name] = value;
                        changed[name] = value;
                        currValues[name] = currentValue;
                        delete modified[name];
                        isDirty = false;
                        for (key in modified) {
                            this.dirty = true;
                            isDirty = true;
                        }
                        if (!isDirty) {
                            this.dirty = false;
                        }
                    } else if (currentValue !== value) {
                        data[name] = value;
                        changed[name] = value;
                        currValues[name] = currentValue;
                        if (!X.isDefined(modified[name])) {
                            modified[name] = currentValue;
                            this.dirty = true;
                        }
                    }
                    if (name == this.idProperty && currentValue !== value) {
                        idChanged = true;
                        oldId = currentValue;
                        newId = value;
                    }
                }
            }
            
            if (idChanged) {
                this.fireEvent('idchanged', this, newId, oldId);
            }
            this.fireEvent('datachanged', this, changed, currValues);
        },
        
        /**
         * 获取数据
         */
        get: function(name, raw) {
            var data = this.data,
                fields = this.fields,
                rs;
            if (X.isBoolean(name)) {
                raw = name;
                name = null;
            }
            if (raw === true || !fields) {
                rs = name ? data[name] : $.extend({}, data);
            } else {
                if (name) {
                    rs = this.renderData(fields[name], data[name]);
                } else {
                    rs = {};
                    for (name in fields) {
                        rs[name] = this.renderData(fields[name], data[name]);
                    }
                }
            }
            return rs;
        },
        
        // private
        renderData: function(field, value) {
            if (field) {
                var dateFormat = 'Y-m-d H:i:s',
                    renderer = field.renderer,
                    type = field.type,
                    dt;
                try {
                    if (renderer && X.isFunction(renderer)) {
                        value = renderer.call(this, value);
                    } else {
                        if (type == 'number') {
                            value = parseInt(value);
                        } else if (type == 'float') {
                            value = parseFloat(value);
                        } else if (type == 'date') {
                            value = DateFormat.parse(value, field.format || dateFormat);
                        } else if (type == 'timestampToDateString') {
                            dt = new Date();
                            dt.setTime(value);
                            value = DateFormat.format(dt, field.format || dateFormat);
                        } else if (type == 'string') {
                            value = '' + value;
                        }
                    }
                } catch (e) {
                }
            }
            return value;
        },
        
        /**
         * 加载数据
         */
        load: function(params) {
            if (!this.removed && !this.loading && this.fireEvent('beforeload', this) !== false) {
                this.loading = true;
                params = params || {};
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
            if (!this.removed && !this.loading && this.fireEvent('beforeload', this) !== false) {
                this.loading = true;
                if (this.showPageLoading) {
                    this.showPageLoadingMsg();
                }
                this.fetch(params);
            }
        },
        
        // private 强制从服务端取得数据，并更新本地缓存
        fetch: function(params) {
            var options;
            params = params || {};
            params['_dt'] = $.now(); // 时间戳，防止缓存
            params = $.extend({}, params, this.getFetchData(), this.getData ? this.getData(this.params) : null);
            options = $.extend({}, this.baseParams, {
                type: this.requestMethod,
                url: this.getUrl ? this.getUrl(this.params) : this.restful.read,
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
        getFetchData: function() {
            var params = {};
            params[this.idProperty] = this.get(this.idProperty, true);
            return params;
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
            data = this.dataProperty ? data[this.dataProperty] : data;
            this.handleLoadSuccess(data);
            this.updateStorage();
        },
        
        // private
        handleLoadSuccess: function(data) {
            this.fetched = true;
            this.set(data || {});
            this.modified = {};
            this.dirty = false;
            this.fireEvent('load', this);
        },
        
        // private
        handleLoadFailed: function() {
            for (var name in this.data) {
                if (this.data.hasOwnProperty(name) && name != this.idProperty) {
                    this.data[name] = '';
                }
            }
            this.modified = {};
            this.dirty = false;
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
        
        /**
         * 与服务端同步数据，将本地修改的数据提交给服务端
         */
        sync: function() {
            // TODO model同步
        },
        
        /**
         * 移除model对象，同时将服务端数据移除
         */
        remove: function(params) {
            // TODO model移除
        },
        
        // private
        getStorageKey: function() {
            return this.get(this.idProperty, true);
        },
        
        // private
        loadStorage: function(params) {
            var me = this, 
                id = me.getStorageKey();
            if (me.useWebDatabase && id) {
                me.db.transaction(function(t) {
                    t.executeSql('SELECT * FROM ' + me.tableName + ' WHERE ' + me.idProperty + ' = ?', [id], function(t, result) {
                        if (result.rows.length > 0) {
                            var name, rs = {}, item = result.rows.item(0);
                            if ((item['_last_updated'] + me.cacheExpires) < $.now()) {
                                // 本地数据过期，从服务端重新加载
                                me.fetch(params);
                            } else {
                                try {
                                    for (name in me.fields) {
                                        if (me.fields.hasOwnProperty(name)) {
                                            rs[name] = JSON.parse(item[name]);
                                        }
                                    }
                                    me.handleLoadSuccess(rs);
                                } catch(e) {
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
                id = me.getStorageKey();
            if (me.useWebDatabase && id) {
                me.db.transaction(function(t) {
                    t.executeSql('SELECT * FROM ' + me.tableName + ' WHERE ' + me.idProperty + ' = ?', [id], function(t, result) {
                        var name, field, fields = me.fields,
                            data = me.data,
                            sql,
                            columns = [],
                            values = [],
                            props = [];
                        if (result.rows.length > 0) { // 更新数据
                            for (name in fields) {
                                if (name != me.idProperty) {
                                    columns.push(name + ' = ?');
                                    props.push(JSON.stringify(data[name]));
                                }
                            }
                            columns.push('_last_updated = ?');
                            props.push($.now());
                            props.push(id);
                            sql = 'UPDATE ' + me.tableName + ' SET ' + columns.join(', ') + ' WHERE ' + me.idProperty + ' = ?';
                        } else {
                            columns.push(me.idProperty);
                            values.push('?');
                            props.push(id);
                            for (name in fields) {
                                if (name != me.idProperty) {
                                    columns.push(name);
                                    values.push('?');
                                    props.push(JSON.stringify(data[name]));
                                }
                            }
                            columns.push('_last_updated');
                            values.push('?');
                            props.push($.now());
                            sql = 'INSERT INTO ' + me.tableName + ' (' + columns.join(', ') + ') VALUES (' + values.join(', ') + ')';
                        }
                        
                        t.executeSql(sql, props);
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
            pageNumber = params.page || this.currentPage;
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            params.page = pageNumber;
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
            pageNumber = params.page || this.currentPage;
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            params.page = pageNumber;
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
            var meta = this.meta, pageNumber = params.page, options;
            params[meta.pageNumberProperty] = pageNumber;
            params[meta.pageSizeProperty] = this.pageSize;
            params[meta.pageStartProperty] = (pageNumber - 1) * this.pageSize;
            params['_dt'] = $.now(); // 时间戳，防止缓存
            params = $.extend({}, params, this.getData ? this.getData(this.params) : null);
            options = $.extend({}, this.baseParams, {
                type: this.requestMethod,
                url: this.getUrl ? this.getUrl(this.params) : this.url,
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
         * 获取第一页
         */
        first: function() {
            this.load({
                page: 1
            });
        },
        
        /**
         * 获取最后一页
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
         * 获取前一页
         */
        prev: function() {
            this.load({
                page: this.currentPage - 1
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
                    page: this.currentPage + 1
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
                pageNumber = params.page,
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
/**
 * @class MX.app.View
 * @alias view
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    X.app.View = Klass.define({
        // private
        alias: 'view',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {String} headerCfg
         * String : cls 添加到header元素上的扩展CSS样式
         * String : template 模版
         */
        
        /**
         * @cfg {String} footerCfg
         * String : cls 添加到footer元素上的扩展CSS样式
         * String : template 模版
         */
        
        /**
         * @cfg {String} bodyCfg
         * String : cls 添加到body元素上的扩展CSS样式
         * String : template 模版
         */
        
        // private
        init: function() {
            this.initTemplate();
        },
        
        // private
        initTemplate: function() {
            var templates = this.templates;
            this.templates = [];
            if (templates) {
                if (!X.isArray(templates)) {
                    templates = [templates];
                }
                X.each(templates, function(i, config) {
                    this.addTemplate($.extend({}, config));
                }, this);
            }
            if (this.headerCfg && this.headerCfg.template) {
                this.headerTmpl = this.addTemplate(X.isString(this.headerCfg.template) ? { id: this.headerCfg.template } : $.extend({}, this.headerCfg.template));
            }
            if (this.footerCfg && this.footerCfg.template) {
                this.footerTmpl = this.addTemplate(X.isString(this.footerCfg.template) ? { id: this.footerCfg.template } : $.extend({}, this.footerCfg.template));
            }
            if (this.bodyCfg && this.bodyCfg.template) {
                this.bodyTmpl = this.addTemplate(X.isString(this.bodyCfg.template) ? { id: this.bodyCfg.template } : $.extend({}, this.bodyCfg.template));
            }
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event beforerender
                 */
                'beforerender',
                /**
                 * @event render
                 */
                'render'
            );
        },
        
        // private
        render: function(container) {
            if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
                this.rendered = true;

                this.container = container = $(container);

                if (this.headerCfg) {
                    this.header = $(document.createElement('div'));
                    this.header.attr('id', 'mx-app-page-header-' + this.id)
                               .attr('data-' + $.mobile.ns + 'role', 'header');
                    if (this.headerCfg.fixed) {
                        this.header.attr('data-' + $.mobile.ns + 'position', 'fixed');
                    }
                    if (this.headerCfg.cls) {
                        this.header.addClass(this.headerCfg.cls);
                    }
                    if (this.headerTmpl) {
                        this.headerTmpl.container = this.header;
                        !this.headerTmpl.store && this.headerTmpl.render();
                    }
                    container.append(this.header);
                }

                var bodyCfg = this.bodyCfg || {};
                this.body = $(document.createElement('div'));
                this.body.attr('id', 'mx-app-page-body-' + this.id)
                         .attr('data-' + $.mobile.ns + 'role', 'content');
                if (bodyCfg.fixed) {
                    this.body.attr('data-' + $.mobile.ns + 'position', 'fixed');
                }
                if (bodyCfg.cls) {
                    this.body.addClass(bodyCfg.cls);
                }
                if (this.bodyTmpl) {
                    this.bodyTmpl.container = this.body;
                    !this.bodyTmpl.store && this.bodyTmpl.render();
                }
                container.append(this.body);

                if (this.footerCfg) {
                    this.footer = $(document.createElement('div'));
                    this.footer.attr('id', 'mx-app-page-footer-' + this.id)
                               .attr('data-' + $.mobile.ns + 'role', 'footer');

                    if (this.footerCfg.fixed) {
                        this.footer.attr('data-' + $.mobile.ns + 'position', 'fixed');
                    }
                    if (this.footerCfg.cls) {
                        this.footer.addClass(this.footerCfg.cls);
                    }
                    if (this.footerTmpl) {
                        this.footerTmpl.container = this.footer;
                        !this.footerTmpl.store && this.footerTmpl.render();
                    }
                    container.append(this.footer);
                }
                
                this.onRender(container);
                this.fireEvent('render', this, container);
            }
        },
        
        // private
        onRender: X.emptyFn,

        // private
        addTemplate: function(config) {
            config = config || {};
            config.params = this.params;
            var tmpl = X.create('template', config);
            this.templates[tmpl.id] = tmpl;
            return tmpl;
        },
        
        /**
         * 获取模版
         * @param {String} id
         * @return {Object} template
         */
        getTemplate: function(id) {
            return this.templates[id];
        },
        
        // private
        onDestroy: function() {
            if (this.header) {
                this.header.remove();
                this.header = null;
            }
            if (this.footer) {
                this.footer.remove();
                this.footer = null;
            }
            if (this.body) {
                this.body.remove();
                this.body = null;
            }
            this.container = null;

            X.each(this.templates, function(i, tmpl) {
                tmpl.destroy();
            });
            this.templates = null;
        }
    });
});
/**
 * @class MX.app.Controller
 * @alias controller
 */
MX.kindle('klass', function(X, Klass) {
    X.app.Controller = Klass.define({
        // private
        alias: 'controller',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Object} delegates 委托事件
         */
        
        // private
        init: function() {
            this.relayMethod(this.view, 'getTemplate', 'getComponent');
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event pagecreate
                 */
                'pagecreate',
                /**
                 * @event pagebeforeshow
                 */
                'pagebeforeshow',
                /**
                 * @event pageshow
                 */
                'pageshow',
                /**
                 * @event pagebeforehide
                 */
                'pagebeforehide',
                /**
                 * @event pagehide
                 */
                'pagehide'
            );
        },
        
        /**
         * 绑定委托事件
         * 
         * delegateEvent(root, eventName)
         *  {
         *      scope: scope,
         *      'click ul > li': callbackFn
         *  }
         * 
         * delegateEvent(root, eventName, selector, callbackFn)
         * 
         * delegateEvent(root, eventName, selector, callbackFn, scope)
         * 
         */
        delegateEvent: function(root, eventName, selector, callbackFn, scope) {
            var len = arguments.length;
            
            if (X.isObject(eventName)) {
                var p, eName, index, selector, fn;
                scope = eventName.scope || this;
                delete eventName.scope;
                for (p in eventName) {
                    index = p.indexOf(' ');
                    selector = p.substring(index + 1);
                    eName = p.substring(0, index);
                    fn = eventName[p];
                    fn = X.isString(fn) ? this[fn] : fn;
                    this.delegateEvent(root, eName, selector, fn, scope);
                }
                return;
            }
            
            this.mon(root, eventName, selector, callbackFn, scope);
        },

        // private
        onViewRender: function() {
            if (this.delegates) {
                this.delegateEvent(this.view.container, this.delegates);
                delete this.delegates;
            }
            this.onPageCreate();
            this.fireEvent('pagecreate', this);
        },

        // private
        onPageCreate: X.emptyFn,
        
        // private
        beforePageShow: X.emptyFn,
        
        // private
        onPageShow: X.emptyFn,
        
        // private
        beforePageHide: X.emptyFn,
        
        // private
        onPageHide: X.emptyFn,
        
        /**
         * 获取Model
         * @param {String} modelId
         */
        getModel: function(id) {
            return this.models[id];
        },
        
        /**
         * 获取Store
         * @param {String} storeId
         */
        getStore: function(id) {
            return this.stores[id];
        },
        
        /**
         * 获取header element
         */
        getHeader: function() {
            return this.view.header;
        },
        
        /**
         * 获取footer element
         */
        getFooter: function() {
            return this.view.footer;
        },
        
        /**
         * 获取body element
         */
        getBody: function() {
            return this.view.body;
        },
        
        /**
         * 获取container element
         */
        getContainer: function() {
            return this.view.container;
        },
        
        /**
         * 获取container element
         */
        getCt: function() {
            return this.getContainer();
        },

        /**
         * 获取hash中包含的参数
         */
        getParams: function() {
             return this.params;
        },
        
        // private
        onDestroy: function() {
            this.view = null;
            this.models = this.stores = null;
        }
    });
});
/**
 * @class MX.app.Pagelet
 * @alias pagelet
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    var paramNameRe = /(:|\*)\w+/g; // 匹配URL中的参数名
    
    X.app.Pagelet = Klass.define({
        // private
        alias: 'pagelet',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Boolean} singleton true单例，默认false
         */
        singleton: false,
        
        /**
         * @cfg {Boolean} noCache true缓存pagelet实例，false当退出页面时立即销毁pagelet，默认false
         */
        noCache: false,
        
        /**
         * @cfg {String} hash pagelet绑定的hash
         */
        
        /**
         * @cfg {String/View} view 绑定View
         */
        
        /**
         * @cfg {String/Controller} controller 绑定Controller
         */
        
        /**
         * @cfg {Array/Model} models 绑定model，允许绑定多个model
         */
        
        /**
         * @cfg {Array/Store} stores 绑定store，允许绑定多个store
         */
        
        /**
         * @cfg {String} cls 添加到el元素上的扩展CSS样式
         */
        
        // private
        init: function() {
            // 匹配URL中包含的参数名
            this.urlParamNames = this.url.match(paramNameRe);
            
            // 解析URL中包含的参数值
            this.parseParams();

            // 这里必须严格按照这个初始化顺序
            this.initTransition();
            this.initView();
            this.initModels();
            this.initStores();
            this.initController();
        },

        // private
        initTransition: function() {
            this.transition = this.transition || '';
            if (X.isString(this.transition)) {
                this.transition = {
                    in: this.transition,
                    out: ''
                }
            }
            if (X.isString(this.transition.in)) {
                this.transition.in = {
                    effect: this.transition.in
                }
            }
            if (X.isString(this.transition.out)) {
                this.transition.out = {
                    effect: this.transition.out
                }
            }
        },

        // private
        initModels: function() {
            this.models = this.models || {};
            X.each(this.models, function(i, model) {
                model.params = this.params;
                if (model.bindTo === 'header' && this.view.headerTmpl) {
                    this.view.headerTmpl.bindStore(model);
                } else if (model.bindTo === 'footer' && this.view.footerTmpl) {
                    this.view.footerTmpl.bindStore(model);
                } else if (model.bindTo === 'body' && this.view.bodyTmpl) {
                    this.view.bodyTmpl.bindStore(model);
                }
            }, this);
        },

        // private
        initStores: function() {
            this.stores = this.stores || {};
            X.each(this.stores, function(i, store) {
                store.params = this.params;
                if (store.bindTo === 'header' && this.view.headerTmpl) {
                    this.view.headerTmpl.bindStore(store);
                } else if (store.bindTo === 'footer' && this.view.footerTmpl) {
                    this.view.footerTmpl.bindStore(store);
                } else if (store.bindTo === 'body' && this.view.bodyTmpl) {
                    this.view.bodyTmpl.bindStore(store);
                }
            }, this);
        },

        // private
        // 将hash中包含的参数解析出来
        parseParams: function() {
            var values = this.urlRe.exec(this.hash).slice(1),
                params = {};
            
            X.each(this.urlParamNames, function(i, param) {
                params[param.substr(1)] = values[i];
            }, this);
            
            this.params = params;
            return params;
        },
        
        // private
        initEvent: function() {
            this.addEvents(
                /**
                 * @event beforerender
                 */
                'beforerender',
                /**
                 * @event render
                 */
                'render'
            );
        },
        
        // private
        initView: function() {
            this.view = X.create(this.view || 'view', {
                params: this.params
            });
            this.mon(this.view, 'render', this.onViewRender);
        },
        
        // private
        initController: function() {
            this.controller = X.create(this.controller || 'controller', {
                view: this.view,
                models: this.models,
                stores: this.stores,
                params: this.params
            });
        },
        
        // private
        render: function(container) {
            if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
                this.rendered = true;
                
                this.container = container = $(container);
                
                this.el = $(document.createElement('div'));
                this.el.attr('id', 'mx-app-page-' + this.id)
                       .attr('data-' + $.mobile.ns + 'role', 'page')
                       .attr('data-' + $.mobile.ns + 'url', '#/' + this.hash);
                if (this.cls) {
                    this.el.addClass(this.cls);
                }
                container.append(this.el);
                
                if (this.view) {
                    this.view.render(this.el);
                }
                
                this.mon(this.el, {
                    'pagebeforeshow': this.beforePageShow,
                    'pageshow': this.onPageShow,
                    'pagebeforehide': this.beforePageHide,
                    'pagehide': this.onPageHide
                });
                
                this.onRender(container);
                this.fireEvent('render', this, container);
            }
        },
        
        // private
        onRender: X.emptyFn,

        // private
        onViewRender: function() {
            if (this.controller) {
                this.controller.onViewRender();
            }
        },
        
        // private
        beforePageShow: function() {
            if (this.controller) {
                this.controller.beforePageShow();
                this.controller.fireEvent('pagebeforeshow', this.controller);
            }
        },
        
        // private
        onPageShow: function() {
            this.loadModelOrStore(this.models);
            this.loadModelOrStore(this.stores);
            if (this.controller) {
                this.controller.onPageShow();
                this.controller.fireEvent('pageshow', this.controller);
            }
        },
        
        // private
        beforePageHide: function() {
            this.cancelFetch();
            if (this.controller) {
                this.controller.beforePageHide();
                this.controller.fireEvent('pagebeforehide', this.controller);
            }
        },
        
        // private
        onPageHide: function() {
            if (this.controller) {
                this.controller.onPageHide();
                this.controller.fireEvent('pagehide', this.controller);
            }
        },
        
        // private
        // 取消所有model、store的AJAX fetch动作
        cancelFetch: function() {
            X.each(this.models, function(id, model) {
                model.cancelFetch();
            }, this);
            X.each(this.stores, function(id, store) {
                store.cancelFetch();
            }, this);
        },

        // private
        loadModelOrStore: function(objects) {
            X.each(objects, function(i, obj) {
                if (obj.autoLoad === true) {
                    obj.load();
                }
            }, this);
        },
        
        /**
         * 获得view对象
         */
        getView: function() {
            return this.view;
        },
        
        /**
         * 获得controller对象
         */
        getController: function() {
            return this.controller;
        },
        
        // private
        onDestroy: function() {
            if (this.models && X.isObject(this.models)) {
                X.each(this.models, function(i, model) {
                    model.destroy();
                });
            }
            if (this.stores && X.isObject(this.stores)) {
                X.each(this.stores, function(i, store) {
                    store.destroy();
                });
            }
            if (this.controller) {
                this.controller.destroy();
                this.controller = null;
            }
            if (this.view) {
                this.view.destroy();
                this.view = null;
            }
            if (this.el) {
                this.el.remove();
                this.el = null;
            }
            this.container = null;
        }
    });
});
/**
 * @class MX.app.Application
 * @alias application
 *
 * Appliaction主程序类，整合WebApp中使用的资源，管理页面视图
 */
MX.kindle('jquery', 'klass', 'localstorage', 'pagelet', function(X, $, Klass, LocalStorage, Pagelet) {
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
         * @cfg {String} databaseName 数据库名称，默认undefined
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
         */
        pageletCacheSize: 30,

        /**
         * @cfg {String} startUpSelector 启动画面selector
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

            this.history = new $.mobile.History();
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

                if (this.cls) {
                    this.pageContainer.addClass(this.cls);
                }

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
                    } catch (e) {
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

        // private
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

        /**
         * 转向到hash
         * @param {String} hash
         */
        go: function(hash, options) {
            if (!this.isPageChanging) {
                this.lastHash = hash;
                this.pageChangeOptions = $.extend({}, options);
                location.hash = '#/' + hash;
            }
        },

        /**
         * 回退
         * @param {String} (optional) defaultHash 当访问路径历史没有上一页时，默认跳转hash
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
            var path = $.mobile.path, url, lp, np, transition, transtionOptions;
            window.scrollTo(0, 1);
            url = path.getLocation();
            this.history.add(url, {
                url: url,
                hash: pagelet.hash
            });

            if (!this.isPageChanging && this.fireEvent('beforepagechange', this, pagelet) !== false) {
                this.isPageChanging = true;
                this.pageChangeOptions = this.pageChangeOptions || {};

                lp = this.lastPagelet;
                np = this.nextPagelet = pagelet;

                np.render(this.pageContainer);
                np.el.css('min-height', window.innerHeight + 'px');

                transtionOptions = $.extend({}, this.pageChangeOptions, {
                    fromHashChange: true
                });
                if (this.startUpView) {
                    transition = 'fade';
                }
                if (!transition && np.controller.getTransition) {
                    transition = np.controller.getTransition(np.hash, lp ? lp.hash : '');
                }
                if (!transition && lp) {
                    transition = lp.transition.out.effect;
                    transtionOptions.reverse = lp.transition.out.reverse;
                }
                if (!transition) {
                    transition = np.transition.in.effect || np.transition.out.effect || 'fade';
                    transtionOptions.reverse = np.transition.in.reverse;
                }
                transtionOptions.transition = transition;
                $.mobile.changePage(np.el, transtionOptions);
            }
        },

        // private
        onPageChange: function() {
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

            this.lastPagelet = this.nextPagelet;
            this.nextPagelet = null;
            this.isPageChanging = false;
            this.pageChangeOptions = null;
            this.lastHash = null;

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
});

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
if ($ && $.mobile) {
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
}