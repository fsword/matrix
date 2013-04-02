/**
 * @class MX.app.Template
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
            container = container || this.container;
            container.html(this.applyTemplate(data));
        }
    });
});
/**
 * @class MX.app.Model
 */
MX.kindle('klass', 'dateformat', function(X, Klass, DateFormat) {
    X.app.Model = Klass.define({
        // private
        alias: 'model',
        
        // private
        extend: 'utility',
        
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
         * @cfg {String/Object} restful AJAX请求API
         */
        
        /**
         * @cfg {String} requestMethod AJAX请求类型，默认'GET'
         */
        requestMethod: 'GET',
        
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
            
            this.restful = this.restful || {};
            
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
                        fields[field.name] = field;
                    }
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
                'loadfailed'
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
                    value = values[name] || '';
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
            if (!this.removed) {
                if (this.useWebDatabase && this.useCache) {
                    this.loadStorage(params);
                } else {
                    this.fetch(params);
                }
            }
        },
        
        /**
         * 强制从服务端取得数据，并更新本地缓存
         */
        fetch: function(params) {
            if (!this.removed && !this.loading && this.fireEvent('beforeload', this) !== false) {
                this.loading = true;
                
                params = params || {};
                params.data = params.data || {};
                params.data = $.extend({}, this.baseParams, this.getFetchParams() || {}, params.data, {'_dt': $.now()});
                params = $.extend({
                    type: this.requestMethod
                }, this.restful.read, params, {
                    dataType: 'json'
                });
                
                this.cancelFetch();
                this.lastXmlRequest = $.ajax(params)
                                       .done($.proxy(this.onFetchSuccess, this))
                                       .fail($.proxy(this.handleLoadFailed, this))
                                       .always($.proxy(this.handleRequestComplete, this));
            }
        },
        
        // private
        getFetchParams: function() {
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
                            var name, field, rs = {}, item = result.rows.item(0);
                            if ((item['_last_updated'] + me.cacheExpires) < $.now()) {
                                // 本地数据过期，从服务端重新加载
                                me.fetch(params);
                            } else {
                                for (name in me.fields) {
                                    if (me.fields.hasOwnProperty(name)) {
                                        rs[name] = JSON.parse(item[name]);
                                    }
                                }
                                me.handleLoadSuccess(rs);
                            }
                        } else {
                            me.handleLoadFailed();
                        }
                    });
                }, function(error) {
                    me.handleLoadFailed();
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
                            props = [],
                            val;
                        
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
        onDestroy: function() {
            this.db = null;
        }
    });
});
/**
 * @class MX.app.Store
 */
MX.kindle('jquery', 'klass', 'collection', function(X, $, Klass, Collection) {
    X.app.Store = Klass.define({
        // private
        alias: 'store',
        
        // private
        extend: 'utility',
        
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
         * @cfg {String/Object} restful AJAX请求API
         */
        
        /**
         * @cfg {String} requestMethod AJAX请求类型，默认'GET'
         */
        requestMethod: 'GET',
        
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
        
        // private
        init: function() {
            this.baseParams = this.baseParams || {};
            this.storageKey = this.storageKey || this.alias;
            this.meta = this.meta || {};
            X.applyIf(this.meta, {
                pageNumberProperty: 'page',
                pageSizeProperty: 'pageSize',
                pageStartProperty: 'pageStart',
                totalProperty: 'total'
            });
            
            this.initRestful();
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
        initRestful: function() {
            var actions = {
                create: 'create',
                read: 'read',
                update: 'update',
                destroy: 'destroy'
            }, rest, rests;
            
            this.restful = this.restful || {};
            
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
                'loadfailed'
            );
        },
        
        /**
         * 加载数据
         */
        load: function(params) {
            if (!this.removed) {
                params = params || {};
                params.data = params.data || {};
                params.data.page = params.data.page || this.currentPage;
                if (this.useWebDatabase && this.useCache) {
                    this.loadStorage(params);
                } else {
                    this.fetch(params);
                }
            }
        },
        
        /**
         * 强制从服务端取得数据，并更新本地缓存
         */
        fetch: function(params) {
            var me = this,
                meta = me.meta,
                maxPage = me.maxPage,
                pageNumber;
            
            params = params || {};
            params.data = params.data || {};
            pageNumber = params.data.page || me.currentPage;
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            params.data.page = pageNumber;
            
            if (!me.loading && pageNumber <= maxPage && me.fireEvent('beforeload', me, pageNumber) !== false) {
                me.loading = true;
                me.toPage = pageNumber;
                
                params.data[meta.pageNumberProperty] = pageNumber;
                params.data[meta.pageSizeProperty] = me.pageSize;
                params.data[meta.pageStartProperty] = (pageNumber - 1) * me.pageSize;
                params.data['_dt'] = $.now(); // 时间戳，防止缓存
                params.data = $.extend({}, me.baseParams, params.data);
                params = $.extend({
                    type: me.requestMethod
                }, me.restful.read, params, {
                    dataType: 'json'
                });
                
                me.cancelFetch();
                me.lastXmlRequest = $.ajax(params)
                                     .done($.proxy(me.onFetchSuccess, me))
                                     .fail($.proxy(me.handleLoadFailed, me))
                                     .always($.proxy(me.handleRequestComplete, me));
            }
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
            delete this.lastXhr;
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
                    'destroy': function(model) {
                        this.data.remove(model);
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
                me.toPage = pageNumber; // 记录翻页页码
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
                            }
                        } else {
                            me.handleLoadFailed();
                        }
                    });
                }, function(error) {
                    me.handleLoadFailed();
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
                                value = JSON.stringify(me.get(null, true));
                            
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
        onDestroy: function() {
            this.db = null;
        }
    });
});
/**
 * @class MX.app.View
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    X.app.View = Klass.define({
        // private
        alias: 'view',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {String} headerCls 添加到header元素上的扩展CSS样式
         */
        
        /**
         * @cfg {String} footerCls 添加到footer元素上的扩展CSS样式
         */
        
        /**
         * @cfg {String} bodyCls 添加到body元素上的扩展CSS样式
         */
        
        // private
        init: function() {
            this.initTemplate();
        },
        
        // private
        initTemplate: function() {
            var templates = {}, tmpl;
            X.each(this.templates, function(i, config) {
                tmpl = X.create('template', $.extend({}, config));
                if (tmpl.renderToBody) {
                    this.renderBodyTmpl = tmpl;
                } else if (tmpl.renderToHeader) {
                    this.renderHeaderTmpl = tmpl;
                } else if (tmpl.renderToFooter) {
                    this.renderFooterTmpl = tmpl;
                }
                templates[tmpl.id] = tmpl;
            }, this);
            this.templates = templates; 
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
                
                if (this.renderHeaderTmpl) {
                    this.header = $(document.createElement('div'));
                    this.header.attr('id', 'mx-app-page-header-' + this.id)
                               .attr('data' + $.mobile.ns + '-role', 'header');
                    if (this.headerCls) {
                        this.header.addClass(this.headerCls);
                    }
                    this.renderHeaderTmpl.container = this.header;
                    this.renderHeaderTmpl.render();
                    container.append(this.header);
                }
                
                if (this.renderFooterTmpl) {
                    this.footer = $(document.createElement('div'));
                    this.footer.attr('id', 'mx-app-page-footer-' + this.id)
                               .attr('data' + $.mobile.ns + '-role', 'footer');
                    if (this.footerCls) {
                        this.footer.addClass(this.footerCls);
                    }
                    this.renderFooterTmpl.container = this.header;
                    this.renderFooterTmpl.render();
                    container.append(this.header);
                }
                
                this.body = $(document.createElement('div'));
                this.body.attr('id', 'mx-app-page-body-' + this.id)
                         .attr('data' + $.mobile.ns + '-role', 'content');
                if (this.bodyCls) {
                    this.body.addClass(this.bodyCls);
                }
                if (this.renderBodyTmpl) {
                    this.renderBodyTmpl.container = this.body;
                    this.renderBodyTmpl.render();
                }
                container.append(this.body);
                
                this.onRender(container);
                this.fireEvent('render', this, container);
            }
        },
        
        // private
        onRender: X.emptyFn,
        
        /**
         * 获取模版
         * @param {String} id
         * @return {Object} template
         */
        getTemplate: function(id) {
            return this.templates[id];
        },
        
        // private
        onDestory: function() {
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
        }
    });
});
/**
 * @class MX.app.Controller
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
            
            this.mon(this.view, 'render', function() {
                if (this.delegates) {
                    this.delegateEvent(this.view.container, this.delegates);
                    delete this.delegates;
                }
            });
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
        
        // private
        onDestroy: function() {
            this.view = null;
            this.models = this.stores = null;
        }
    });
});
/**
 * @class MX.app.Pagelet
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
            
            this.initView();
            this.initController();
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
            this.view = X.create(this.view || 'view', {});
        },
        
        // private
        initController: function() {
            this.controller = X.create(this.controller || 'controller', {
                pagelet: this,
                view: this.view,
                models: this.models,
                stores: this.stores
            });
        },
        
        // private
        render: function(container) {
            if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
                this.rendered = true;
                
                this.container = container = $(container);
                
                this.el = $(document.createElement('div'));
                this.el.attr('id', 'mx-app-page-' + this.id)
                       .attr('data' + $.mobile.ns + '-role', 'page')
                       .attr('data' + $.mobile.ns + '-url', '#/' + this.hash);
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
        beforePageShow: function() {
            if (this.controller) {
                this.controller.beforePageShow();
                this.controller.fireEvent('pagebeforeshow', this.controller);
            }
        },
        
        // private
        onPageShow: function() {
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
        onDestory: function() {
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