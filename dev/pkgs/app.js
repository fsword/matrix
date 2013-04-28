/**
 * @class MX.app.Template
 * @alias template
 *
 * 模版封装类，Matrix框架使用了高速模版引擎artTemplate，主要用来支持View视图的页面渲染
 *
 * Matrix框架Appliaction在启动时，会自动加载模版文件，模版内容会生成一个DOM元素插入到body中
 * 模版代码格式如下：
 *  <script id="index-body-template" type="text/tmpl">
 *      <div>
 *          <#= value #>
 *      </div>
 *  </script>
 *
 * 每一个模版片段都必须要有唯一的id标识
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
         * @cfg {String} target 绑定目标模版DOM的id
         */
        
        /**
         * @cfg {String} template 模版HTML String
         * 如果未设置target，那么，也可以直接传入一个HTML字符串
         */

        /**
         * @cfg {Function} getData 获取模版中应用的数据
         * 包含参数：
         *  - Object : data 传入的原始data
         *
         * <code>
         *  var tmpl = new Template({
         *      template: '<div><#= value #></div>',
         *      getData: function(data) {
         *          // 这里将原始的data重新包装并返回
         *          return {
         *              value: 'Max say: ' + data.value
         *          };
         *      }
         *  });
         *
         *  var html = tmpl.applyTemplate({
         *      value: 'hello world'
         *  });
         *
         *  // 输出'<div>Max say: hello world</div>'
         *  alert(html);
         * <//code>
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
         * 获得模版生成的HTML代码片段
         * 例如，模版为：
         *  <script id="index-body-template" type="text/tmpl">
         *      <div>
         *          <#= value #>
         *      </div>
         *  </script>
         *
         * 调用接口:
         * <code>
         *   template.applyTemplate({
         *       value: 'hello world'
         *   });
         * </code>
         *
         * 返回字符串:
         *  <div>
         *      hello world
         *  </div>
         *
         * @param {Object} data 模版中应用的数据
         * @return {String} html碎片
         */
        applyTemplate: function(data) {
            if (this.template) {
                // getData()与this.params这两个接口是从View中调用
                // 在View.render()中会设置
                data = this.getData(this.params, data || {});

                return this.template(data || {});
            }
            return '';
        },
        
        /**
         * 将模版生成的html，直接渲染到绑定的容器element中
         * @param {Object/Element} container (optional) 模版容器
         * @param {Object} data (optional) 模版中应用的数据
         */
        render: function(container, data) {
            if (X.isObject(container)) {
                data = container;
                container = null;
            }
            container = container || this.container;
            container.html(this.applyTemplate(data));
        },

        // private
        getData: function(params, data) {
            return data;
        },

        /**
         * 为模版绑定一个model或store实例对象，监听store的'load'事件，
         * 当store加载数据成功时，自动将模版渲染到容器中
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
         * 移除已绑定的store
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
/**
 * @class MX.app.View
 * @alias view
 *
 * 页面视图类，负责渲染页面
 *
 * 一般情况下，一个页面由三部分组成：header、body、footer
 * header和footer，只有在设置了headerCfg、footerCfg的时候才会被渲染到页面上
 *
 * 页面视图的完全使用jquery mobile的page structure样式，页面至少必须引入structure.css，页面结构才能正常显示
 *  <link rel="stylesheet" href="../../resources/jquerymobile/1.3.0/lite/structure.css" media="all" />
 *  或包含皮肤样式
 *  <link rel="stylesheet" href="../../resources/jquerymobile/1.3.0/lite.css" media="all" />
 *
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    X.app.View = Klass.define({
        // private
        alias: 'view',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Object} headerCfg header配置参数，如果未设置，则不渲染header element
         * headerCfg可以用的参数：
         *  String : cls 添加到header元素上的扩展CSS样式
         *  String/Object : template 绑定模版，值为string时表示模版id，值为object时表示模版配置参数
         *  Boolean : fixed true表示fixed定位
         */
        
        /**
         * @cfg {Object} footerCfg footer配置参数，如果未设置，则不渲染header element
         * footerCfg可以用的参数：
         *  String : cls 添加到footer元素上的扩展CSS样式
         *  String/Object : template 绑定模版，值为string时表示模版id，值为object时表示模版配置参数
         *  Boolean : fixed true表示fixed定位
         */
        
        /**
         * @cfg {Object} bodyCfg body配置参数
         * bodyCfg可以用的参数：
         *  String : cls 添加到body元素上的扩展CSS样式
         *  String : template 模版
         */

        /**
         * @cfg {String/Object/Array} templates View绑定的模版
         * <code>
         *  // 模版的几种配置方式，更多模版配置参数参见{Template}的API
         *  // 第一种
         *  templates: 'tmpl1'
         *
         *  // 第二种
         *  templates: {
         *      id:  'tmpl1',
         *      getData: function(params, data) {
         *          // ...
         *      }
         *  }
         *
         *  // 第三种
         *  templates: ['tmpl1', 'tmpl2', 'tmpl3']
         *
         *  // 第四种
         *  templates: ['tmpl1', {
         *      id:  'tmpl1',
         *      getData: function(params, data) {
         *          // ...
         *      }
         *  }, 'tmpl3']
         * </code>
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
                /**
                 * @property {Template} headerTmpl
                 * header模版实例对象
                 */
                this.headerTmpl = this.addTemplate(X.isString(this.headerCfg.template) ? { id: this.headerCfg.template } : $.extend({}, this.headerCfg.template));
            }
            if (this.footerCfg && this.footerCfg.template) {
                /**
                 * @property {Template} footerTmpl
                 * footer模版实例对象
                 */
                this.footerTmpl = this.addTemplate(X.isString(this.footerCfg.template) ? { id: this.footerCfg.template } : $.extend({}, this.footerCfg.template));
            }
            if (this.bodyCfg && this.bodyCfg.template) {
                /**
                 * @property {Template} bodyTmpl
                 * body模版实例对象
                 */
                this.bodyTmpl = this.addTemplate(X.isString(this.bodyCfg.template) ? { id: this.bodyCfg.template } : $.extend({}, this.bodyCfg.template));
            }
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event beforerender
                 * 当View渲染之前调用，返回false则终止View渲染
                 * @param {View} this
                 */
                'beforerender',
                /**
                 * @event render
                 * 当View渲染完成调用
                 * @param {View} this
                 */
                'render'
            );
        },
        
        // private
        render: function(container) {
            if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
                /**
                 * @property {Boolean} rendered
                 * true表示View已经渲染
                 */
                this.rendered = true;

                /**
                 * @property {Boolean} container
                 * View渲染容器
                 */
                this.container = container = $(container);

                if (this.headerCfg) {
                    /**
                     * @property {Element} header
                     * header jquery element
                     */
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
                        // 如果header模版绑定了Model或Store时，header的渲染应当在Store加载完成之后进行
                        // 如果未绑定，就可以在View渲染时一起渲染
                        !this.headerTmpl.store && this.headerTmpl.render();
                    }
                    container.append(this.header);
                }

                var bodyCfg = this.bodyCfg || {};
                /**
                 * @property {Element} body
                 * body jquery element
                 */
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
                    // 如果body模版绑定了Model或Store时，body的渲染应当在Store加载完成之后进行
                    // 如果未绑定，就可以在View渲染时一起渲染
                    !this.bodyTmpl.store && this.bodyTmpl.render();
                }
                container.append(this.body);

                if (this.footerCfg) {
                    /**
                     * @property {Element} footer
                     * footer jquery element
                     */
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
                        // 如果footer模版绑定了Model或Store时，footer的渲染应当在Store加载完成之后进行
                        // 如果未绑定，就可以在View渲染时一起渲染
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
         * 根据模版id获取模版
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
 *
 * 页面控制器，控制器的实例化是在view实例化之后触发
 *
 * 页面控制器包含三类可用的control接口：
 *  1、控制器生命周期函数
 *      - init() controller初始化时触发
 *      - initEvents() controller init()之后触发
 *      - beforeDestroy() controller销毁之前触发
 *      - onDestroy() controller销毁时触发
 *
 *  子类Controller可以重写以上几个方法，但是必须在函数内部调用this.callParent()函数，例如：
 *  <code>
 *      Klass.define({
 *          extend: 'controller',
 *          onDestroy: function() {
 *              // 调用了父类的onDestroy()
 *              this.callParent();
 *
 *              // 以下再执行当前controller的销毁动作
 *
 *          }
 *      });
 *  </code>
 *  this.callParent是Matrix框架类继承体系一个函数，调用当前方法的父类方法，具体参见{Class}类的API
 *
 *  2、委托事件监听
 *  <code>
 *      Klass.define({
 *          extend: 'controller',
 *          delegates: {
 *              'click a.back': 'back'
 *          },
 *          back: function() {
 *
 *          }
 *      });
 *  </code>
 *
 *  3、页面事件接口
 *  页面事件监听：
 *      - pagecreate
 *      - pagebeforeshow
 *      - pageshow
 *      - pagebeforehide
 *      - pagehide
 *  子类实现的抽象方法：
 *      - onPageCreate() 当页面创建DOM时触发
 *      - beforePageShow() 当进入页面之前触发
 *      - onPageShow() 当进入页面时触发
 *      - beforePageHide() 当离开页面之前触发
 *      - onPageHide() 当离开页面时触发
 *
 *  <code>
 *      Klass.define({
 *          extend: 'controller',
 *          onPageCreate: function() {
 *          },
 *          beforePageShow: function() {
 *          },
 *          onPageShow: function() {
 *          },
 *          beforePageHide: function() {
 *          },
 *          onPageHide: function() {
 *          }
 *      });
 *  </code>
 */
MX.kindle('klass', function(X, Klass) {
    X.app.Controller = Klass.define({
        // private
        alias: 'controller',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Object} delegates 创建委托事件监听
         * 委托事件监听的参数格式如下:
         * <code>
         *  delegates: {
         *      // 事件类型 选择器 回调函数（绑定到controller的一个方法）
         *      'click a.btn': 'back'
         *  }
         * </code>
         */

        /**
         * @cfg {Function} getTransition 动态重载页面切换效果，返回一个动画效果
         * 除了在Pagelet的Config中配置静态的transition效果之外，还可以重写getTransition()方法，动态返回过渡动画效果
         * 如果返回null或undefined，那么，则使用Pagelet Config中配置的静态transition效果
         *
         * 参数有两个：
         *  String : to 将要去到的页面hash
         *  String : from 当前要离开页面的hash
         *
         * 例如：
         * <code>
         *  Klass.define({
         *      extend: 'controller',
         *      getTransition(to, from) {
         *          if (to == 'welcome') {
         *              return 'slidedown';
         *          }
         *      }
         *  });
         * </code>
         */
        
        // private
        init: function() {
            /**
             * @method getTemplate
             * 根据模版id获取模版
             * @param {String} id
             * @return {Object} template
             */
            // 将view实例对象中的getTemplate方法委派给controller对象
            // 这样，在controller中就可以使用this.getTemplate()获取模版对象
            this.relayMethod(this.view, 'getTemplate');
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event pagecreate
                 * 当页面创建DOM时触发
                 * @param {Controller} this
                 */
                'pagecreate',
                /**
                 * @event pagebeforeshow
                 * 当进入页面之前触发
                 * @param {Controller} this
                 */
                'pagebeforeshow',
                /**
                 * @event pageshow
                 * 当进入页面时触发
                 * @param {Controller} this
                 */
                'pageshow',
                /**
                 * @event pagebeforehide
                 * 当离开页面之前触发
                 * @param {Controller} this
                 */
                'pagebeforehide',
                /**
                 * @event pagehide
                 * 当离开页面时触发
                 * @param {Controller} this
                 */
                'pagehide',
                /**
                 * @event orientationchange
                 * 当设备方向改变时触发
                 * @param {Controller} this
                 */
                'orientationchange'
            );
        },
        
        /*
         * @private
         * 绑定委托事件
         *
         * 可以使用以下几种方式调用：
         *
         *  两个参数
         *  delegateEvent(root, eventName)
         *      Object : eventName的参数格式：
         *      {
         *          scope: scope,
         *          'click ul > li': callbackFn
         *      }
         *
         *  四个参数
         *  delegateEvent(root, eventName, selector, callbackFn)
         *
         *  五个参数
         *  delegateEvent(root, eventName, selector, callbackFn, scope)
         *
         * @param {Element} root 委托事件监听的根元素
         * @param {String/Object} eventName 事件名称
         * @param {String} selector (optional) 选取器
         * @param {Function} callbackFn (optional) 事件回调函数
         * @param {Object} scope (optional) 回调函数作用域
         */
        delegateEvent: function(root, eventName, selector, callbackFn, scope) {
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

        /**
         * 子类扩展方法，当页面创建DOM时触发
         */
        onPageCreate: X.emptyFn,

        /**
         * 子类扩展方法，当进入页面之前触发
         */
        beforePageShow: X.emptyFn,

        /**
         * 子类扩展方法，当进入页面时触发
         */
        onPageShow: X.emptyFn,

        /**
         * 子类扩展方法，当离开页面之前触发
         */
        beforePageHide: X.emptyFn,

        /**
         * 子类扩展方法，当离开页面时触发
         */
        onPageHide: X.emptyFn,

        /**
         * 子类扩展方法，当设备方向改变时触发
         */
        onOrientationChange: X.emptyFn,
        
        /**
         * 获取Model实例对象
         * @param {String} id
         * @return {Object} model
         */
        getModel: function(id) {
            return this.models[id];
        },
        
        /**
         * 获取Store实例对象
         * @param {String} id
         * @return {Object} store
         */
        getStore: function(id) {
            return this.stores[id];
        },
        
        /**
         * 获取header element
         * @return {Element} header
         */
        getHeader: function() {
            return this.view.header;
        },
        
        /**
         * 获取footer element
         * @return {Element} footer
         */
        getFooter: function() {
            return this.view.footer;
        },
        
        /**
         * 获取body element
         * @return {Element} body
         */
        getBody: function() {
            return this.view.body;
        },
        
        /**
         * 获取view container element
         * @return {Element} container
         */
        getContainer: function() {
            return this.view.container;
        },
        
        /**
         * 获取view container element
         * @return {Element} container
         */
        getCt: function() {
            return this.getContainer();
        },

        /**
         * 获取hash中包含的参数
         * 比如：
         *  pagelet配置参数设置的url为'c/:id/:page'
         *
         * 那么，当访问页面'http://localhost/mx/examples/msohu/index.html#/c/0/1'时，
         * 使用getParam方法返回：
         *  {
         *      id: '0',
         *      page: '1'
         *  }
         * @return {Object} params
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
 *
 * Pagelet是Appliaction的一个内部对象，一般情况下不会被外部调用，
 * 在业务系统中只会使用View或Controller提供的接口
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
         * @cfg {String} url pagelet绑定的url
         * 当页面hash发生改变时，使用url匹配hash创建对应的pagelet，然后实现页面跳转
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

        /**
         * @cfg {String/Object} transition 页面切换过渡动画效果
         * 当值为string时，仅仅表示设置了“页面进入效果”
         *  transition: 'fade'
         *
         * 如果要设置页面离开效果，使用下面这种方式:
         *  transition: {
         *      pageIn: 'fade',
         *      pageOut: 'slideup'
         *  }
         *
         * 还可以通过设置reverse属性，使动画反向
         *  transition: {
         *      pageIn: 'fade',
         *      pageOut: {
         *          effect: 'slideup',
         *          reverse: true
         *      }
         *  }
         */
        
        // private
        init: function() {
            // 匹配URL中包含的参数名
            this.urlParamNames = this.url.match(paramNameRe);
            
            // 解析URL中包含的参数值
            this.parseParams();

            // 这里必须严格按照下面的顺序初始化
            this.initTransition();
            this.initView();
            this.initModels();
            this.initStores();
            this.initController();
        },

        /*
         * @private
         * 将hash中包含的参数解析出来
         *
         * 比如：
         *  pagelet配置参数设置的url为'c/:id/:page'
         *
         * 那么，当访问页面'http://localhost/mx/examples/msohu/index.html#/c/0/1'时，
         * 解析的params为：
         *  {
         *      id: '0',
         *      page: '1'
         *  }
         */
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
        initTransition: function() {
            this.transition = this.transition || '';
            if (X.isString(this.transition)) {
                this.transition = {
                    show: this.transition,
                    hide: ''
                };
            }
            if (X.isString(this.transition.show)) {
                this.transition.show = {
                    effect: this.transition.show
                };
            }
            if (X.isString(this.transition.hide)) {
                this.transition.hide = {
                    effect: this.transition.hide
                };
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
        initEvents: function() {
            this.addEvents(
                /**
                 * @event beforerender
                 * 当pagelet渲染之前触发，返回false，终止pagelet渲染
                 * @param {Pagelet} this
                 */
                'beforerender',
                /**
                 * @event render
                 * 当pagelet渲染时触发
                 * @param {Pagelet} this
                 */
                'render'
            );
        },
        
        // private
        initView: function() {
            /**
             * @property {Object} view
             * 绑定的view实例对象
             */
            this.view = X.create(this.view || 'view', {
                params: this.params
            });
            this.mon(this.view, 'render', this.onViewRender);
        },
        
        // private
        initController: function() {
            /**
             * @property {Object} controller
             * 绑定的controller实例对象
             */
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

                /**
                 * @property {Element} container
                 * pagelet container jquery element
                 */
                this.container = container = $(container);

                /**
                 * @property {Element} el
                 * pagelet el jquery element
                 */
                this.el = $(document.createElement('div'));
                this.el.attr('id', 'mx-app-page-' + this.id)
                       .attr('data-' + $.mobile.ns + 'role', 'page')
                       .attr('data-' + $.mobile.ns + 'url', '#/' + this.hash);
                if (this.cls) {
                    this.el.addClass(this.cls);
                }

                this.el.css('min-height', window.innerHeight + 'px');

                container.append(this.el);
                
                if (this.view) {
                    this.view.render(this.el);
                }

                // pagelet代理page事件
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
            /*
             * 在页面进入时，自动加载配置了autoLoad属性的model、store
             */
            this.loadModelOrStore(this.models);
            this.loadModelOrStore(this.stores);
            if (this.controller) {
                this.controller.onPageShow();
                this.controller.fireEvent('pageshow', this.controller);
            }
        },

        // private
        beforePageHide: function() {
            /*
             * 当页面离开时，中断当前页面的所有model、store的AJAX请求操作
             * 防止页面离开之后，Pagelet的DOM被刷新
             */
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
        onOrientationChange: function() {
            if (this.el) {
                this.el.css('min-height', window.innerHeight + 'px');
            }
            if (this.controller) {
                this.controller.onOrientationChange();
                this.controller.fireEvent('orientationchange', this.controller);
            }
        },
        
        // private 取消所有model、store的AJAX请求操作
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
         * @return {Object} view
         */
        getView: function() {
            return this.view;
        },
        
        /**
         * 获得controller对象
         * @return {Object} controller
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
                //$body.scrollTop(0);

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
            this.lastPagelet && this.lastPagelet.onOrientationChange();
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