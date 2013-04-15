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
         * 如果未设置表名，则useWebDatabase会被设置为false
         */
        
        /**
         * @cfg {Boolean} useCache 当本地数据库有数据时，优先使用本地数据
         */
        useCache: false,
        
        /**
         * @cfg {Number} cacheExpires 缓存过期时间，单位毫秒，默认10 * 60 * 1000（10分钟）
         */
        cacheExpires: 10 * 60 * 1000,
        
        /**
         * @cfg {Array} fields 定义数据表字段名，开启useWebDatabase时，必须设置fields字段
         * 如果未设置fields字段，则useWebDatabase会被设置为false
         *
         * 使用以下几种方式设置：
         *
         *  第一种
         *      fields: ['id', 'title', 'content', 'createTime']
         *
         *  第二种，设置字段类型
         *      fields: ['id', 'title', 'content', {
         *          name: 'createTime',
         *          type: 'date',
         *          format: 'Y-m-d' // 如果未设置format，默认为'Y-m-d H:i:s'
         *      }]
         *
         *      字段类型转换包含以下几种类型
         *      - number 将值转换成Number
         *      - float 将值转换成浮点数
         *      - date 将值转换成Date对象
         *      - timestamp 将一个timestamp的值，转换成一个指定格式的日期字符串
         *          例如：
         *          fields: ['id', 'title', 'content', {
         *              name: 'createTime',
         *              type: 'timestamp',
         *              format: 'Y-m-d'
         *          }]
         *          createTime的值为1365661794097
         *          转换之后，获取到createTime的值为 2013-04-11
         *
         *  第三种，设置renderer函数，使用renderer函数包装数据
         *      fields: ['id', 'title', {
         *          name: 'content',
         *          renderer: function(val) {
         *              return 'Hello, ' + val;
         *          }
         *      }]
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
         * @cfg {String/Object} restful AJAX请求API
         * 包含CRUD操作AJAX请求URL
         *  - create
         *  - read
         *  - update
         *  - destroy
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
            
            this.initRestful();
            this.initFields();
            this.initTable();
            
            /**
             * @property {Boolean} dirty
             * true表示model的值被修改
             */
            this.dirty = false;
            
            /**
             * @property {Boolean} fetched
             * true表示已从服务器取值
             */
            this.fetched = false;
            
            /**
             * @property {Boolean} removed
             * true表示当前model数据已被删除
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
                 * 当model值改变时触发
                 * @param {Model} this
                 * @param {Object} changed 修改之后的值
                 * @param {Object} currValues 当前值
                 */
                'datachanged',
                /**
                 * @event idchanged
                 * 当model的id改变时触发
                 * @param {Model} this
                 * @param {String} newId 新id
                 * @param {String} oldId 旧id
                 */
                'idchanged',
                /**
                 * @event beforeload
                 * 当model加载数据之前触发，返回false则中断操作
                 * @param {Model} this
                 */
                'beforeload',
                /**
                 * @event load
                 * 当model加载数据之后触发
                 * @param {Model} this
                 */
                'load',
                /**
                 * @event loadfailed
                 * 当model加载数据失败时触发
                 * @param {Model} this
                 */
                'loadfailed',
                /**
                 * @event loadcomplete
                 * 当model加载数据完成时触发
                 * @param {Model} this
                 */
                'loadcomplete'
            );
        },
        
        /**
         * 设置model的值
         * @param {String/Object} name 名称或一组被设置值对象
         * @param {String} value (optional)
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
         * 获取model的值
         * @param {String/Boolean} name (optional) 名称
         * @param {Boolean} raw (optional) ture表示获取未包装的原始值
         * @return {String/Object} values
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
                        } else if (type == 'timestamp') {
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
        load: function(params, /*private*/ force) {
            if (!this.removed && !this.loading && this.fireEvent('beforeload', this) !== false) {
                this.loading = true;
                params = $.extend({}, params, this.getFetchData(), this.getData ? this.getData(this.params) : null);

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
            this.load(params, true);
        },
        
        // private 强制从服务端取得数据，并更新本地缓存
        fetch: function(params) {
            var options;
            params = params || {};
            params['_dt'] = $.now(); // 时间戳，防止缓存
            options = $.extend({}, this.baseParams, {
                type: this.requestMethod,
                url: this.getUrl ? this.getUrl(this.params, 'read') : this.restful.read,
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