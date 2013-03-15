/**
 * @author max<daipingzhang@sohu-inc.com>
 * @class MX.clazz.Utility
 * 
 * 抽象类，实现了类事件，对象实例化与销毁生命周期
 */
(function() {
    var Zepto = MX.lib.Zepto,
        Class = MX.clazz.Class,
        Dispatcher = MX.util.Dispatcher;
    
    var idSeed = 1000,
        makeId = function(prefix) {
            return (prefix || 'gen-id') + (++idSeed);
        },
        equalElement = function(el, compereEl) { // 比较zepto element
            var ret = true;
            if (el.length == compereEl.length) {
                el.each(function(i, ele) {
                    if (ele != compereEl[i]) {
                        ret = false;
                        return false;
                    }
                });
            } else {
                ret = false;
            }
            return ret;
        };
    
    function createSingle(e, obj, en, fn, scope){
        return function(){
            e.dun(obj, en, fn, scope);
            return fn.apply(this, arguments);
        };
    };
    
    MX.clazz.Utility = Class.define({
        /**
         * @cfg {String} idPrefix
         * id前缀，默认'gen-id'
         */
        
        /**
         * @private
         * 构造函数，AbstractClass实现了类实例化的生命周期，实例化的几个过程：
         *  1、初始化配置参数
         *  2、实例化ob对象，注册事件
         *  3、调用init()方法
         *  4、调用initEvents()方法
         * 
         * @cfg {Object} config 配置参数≈
         */
        constructor: function(config) {
            config = config || {};
            Zepto.extend(this, config);
            
            /**
             * @property {Object} initialConfig
             * 初始化配置参数
             */
            this.initialConfig = config;
            
            if (!this.id) {
                this.id = makeId(this.idPrefix || '');
            }
            
            this.ob = new Dispatcher(this.listeners, this);
            delete this.listeners;
            this.relayMethod(this.ob, 'addEvents', 'fireEvent', 'addListener', 'removeListener', 'on', 'un');
            
            this.addEvents(
                /**
                 * @event beforedestroy
                 * 当调用destroy方法时触发，返回true则中断销毁动作
                 * @param {Class} this
                 */
                'beforedestroy', 
                /**
                 * @event destroy
                 * 当调用destroy方法时触发
                 * @param {Class} this
                 */
                'destroy'
            );
            
            this.init();
            
            this.initEvents();
        },
        
        // private
        init: MX.emptyFn,
        
        // private
        initEvents: MX.emptyFn,
        
        /**
         * 将指定对象的方法映射给this实例，使this实例也拥有指定的方法，例如：
         * @param {Object} obj 指定映射方法的对象
         * @param {Array} methods 方法名称
         */
        relayMethod: function(obj) {
            var methods = Array.prototype.slice.call(arguments, 1);
            for (var i = 0, len = methods.length; i < len; i++) {
                var method = methods[i],
                    fn = obj[method];
                if (!this[method] && fn) {
                    this[method] = function(fn) {
                        return function() {
                            return fn.apply(obj, arguments);
                        };
                    }(fn);
                }
            }
        },
        
        // private
        createEventCache: function() {
            if (!this.eventCaches) {
                this.eventCaches = [];
            }
        },
        
        // private
        clearEventCache: function() {
            if (this.eventCaches) {
                var i = this.eventCaches.length - 1,
                    e;
                for (; i >= 0; i--) {
                    e = this.eventCaches[i];
                    this.mun(e.el, e.type, e.fn, e.scope);
                };
            }
        },
        
        /**
         * 为指定element绑定一个dom事件处理函数，例如：
         * <code>
         *  this.mon(this.el, 'mouseenter', function() {
         *      // 如果为指定scope，回调函数的scope默认为模型实例对象
         *  });
         *  
         *  // 同时绑定多个监听
         *  this.mon(this.el, {
         *      'mouseenter': function() {
         *      },
         *      'mouseleave': function() {
         *      },
         *      scope: this // 定义回调函数scope
         *  })
         *  
         *  // 如果想给回调函数传递数据，那么，必须给出on函数的所有参数
         *  this.mon(this.el, 'mouseenter', function() {
         *      
         *  }, this);
         * </code>
         * @param {String/Element} el 指定元素
         * @param {String/Object} eventType 事件类型，当为Object时，表示绑定一组处理事件
         * @param {Function} handler (optional) 事件处理函数
         * @param {Object} scope (optional) 处理函数作用域
         */
        mon: function(el, types, fn, scope) {
            this.createEventCache();
            
            if (Zepto.isPlainObject(types)) {
                var type;
                scope = types.scope || this;
                delete types.scope;
                for (type in types) {
                    this.mon(el, type, types[type], scope);
                }
                return;
            }
            
            el = Zepto(el);
            if (el.length > 1) {
                MX.each(el, function(i, el) {
                    this.mon(el, types, fn, scope);
                }, this);
                return;
            }
            
            scope = scope || this;
            var proxyFn = Zepto.proxy(fn, scope);
            this.eventCaches.push({
                el: el,
                type: types,
                fn: fn,
                proxyFn: proxyFn,
                scope: scope
            });
            el.bind(types, proxyFn);
        },
         
        /**
         * 为指定元素取消一个已绑定的处理事件
         * @param {String/Element} el 指定元素
         * @param {String/Object} eventType 事件类型，当为Object时，表示取消一组处理事件
         * @param {Function} handler (optional) 事件处理函数
         * @param {Object} scope (optional) 处理函数作用域
         */
        mun: function(el, types, fn, scope) {
            this.createEventCache();
            
            if (!types) {
                for (var i = 0, len = this.eventCaches.length; i < len; i++) {
                    var event = this.eventCaches[i];
                    if (equalElement(el, event.el)) {
                        this.mun(el, event.type, event.fn, event.scope);
                    }
                }
                return;
            } else if (Zepto.isPlainObject(types)) {
                var type;
                scope = types.scope || this;
                delete types.scope;
                for (type in types) {
                    this.mun(el, type, types[type], scope);
                }
                return;
            }
            
            scope = scope || this;
            el = Zepto(el);
            
            for (var i = 0, len = this.eventCaches.length; i < len; i++) {
                var event = this.eventCaches[i];
                if (equalElement(el, event.el) && types == event.type && fn == event.fn && scope == event.scope) {
                    this.eventCaches.splice(i, 1);
                    el.unbind(types, event.proxyFn);
                    break;
                }
            }
        },
        
        // private
        createDelegateCache: function() {
            if (!this.delegateCaches) {
                this.delegateCaches = [];
            }
        },
        
        // private
        clearDelegateCache: function() {
            if (this.delegateCaches) {
                var i = this.delegateCaches.length - 1,
                    e;
                for (; i >= 0; i--) {
                    e = this.delegateCaches[i];
                    this.undelegate(e.el, e.selector, e.type, e.fn, e.scope);
                };
            }
        },
        
        /**
         * 绑定委托事件
         */
        delegate: function(el, selector, types, fn, scope) {
            this.createDelegateCache();
            
            if (Zepto.isPlainObject(types)) {
                var type;
                scope = types.scope || this;
                delete types.scope;
                for (type in types) {
                    this.delegate(el, selector, type, types[type], scope);
                }
                return;
            }
            
            el = Zepto(el);
            if (el.length > 1) {
                MX.each(el, function(i, el) {
                    this.delegate(el, selector, types, fn, scope);
                }, this);
                return;
            }
            
            scope = scope || this;
            var proxyFn = Zepto.proxy(fn, scope);
            this.delegateCaches.push({
                el: el,
                selector: selector,
                type: types,
                fn: fn,
                proxyFn: proxyFn,
                scope: scope
            });
            el.delegate(selector, types, proxyFn);
        },
        
        /**
         * 移除委托事件
         */
        undelegate: function(el, selector, types, fn, scope) {
            this.createDelegateCache();
            
            if (!types) {
                for (var i = 0, len = this.delegateCaches.length; i < len; i++) {
                    var event = this.delegateCaches[i];
                    if (equalElement(el, event.el)) {
                        this.undelegate(el, event.selector, event.type, event.fn, event.scope);
                    }
                }
                return;
            } else if (Zepto.isPlainObject(types)) {
                var type;
                scope = types.scope || this;
                delete types.scope;
                for (type in types) {
                    this.undelegate(el, selector, type, types[type], scope);
                }
                return;
            }
            
            scope = scope || this;
            el = Zepto(el);
            
            for (var i = 0, len = this.delegateCaches.length; i < len; i++) {
                var event = this.delegateCaches[i];
                if (equalElement(el, event.el) && selector == event.selector && types == event.type && fn == event.fn && scope == event.scope) {
                    this.delegateCaches.splice(i, 1);
                    el.undelegate(selector, types, event.proxyFn);
                    break;
                }
            }
        },
        
        // private
        createDispatcherCache: function() {
            if (!this.dispatcherCaches) {
                this.dispatcherCaches = [];
            }
        },
        
        // private
        clearDispatcherCache: function() {
            if (this.dispatcherCaches) {
                var i = this.dispatcherCaches.length - 1,
                    e;
                for (; i >= 0; i--) {
                    e = this.dispatcherCaches[i];
                    this.dun(e.obj, e.event, e.fn, e.scope);
                };
            }
        },
        
        /**
         * 监听dispatcher事件
         */
        don: function(obj, event, fn, scope, options) {
            this.createDispatcherCache();
            
            if (Zepto.isPlainObject(event)) {
                var eName;
                scope = event.scope || this;
                delete event.scope;
                for (eName in event) {
                    this.don(obj, eName, event[eName], scope || this, options);
                }
                return;
            }
            
            if (obj) {
                scope = scope || this;
                var fireFn = this.createListener(obj, event, fn, scope, options);
                this.dispatcherCaches.push({
                    obj: obj,
                    event: event,
                    fn: fn,
                    fireFn: fireFn,
                    scope: scope
                });
                obj.on(event, fireFn, scope);
            }
        },
        
        /**
         * 移除dispatcher事件
         */
        dun: function(obj, event, fn, scope) {
            this.createDispatcherCache();
            
            if (Zepto.isPlainObject(event)) {
                var eName;
                scope = event.scope || this;
                delete event.scope;
                for (eName in event) {
                    this.dun(obj, eName, event[eName], scope || this);
                }
                return;
            }
            
            scope = scope || this;
            
            for (var i = 0, len = this.dispatcherCaches.length; i < len; i++) {
                var e = this.dispatcherCaches[i];
                if (e.obj == obj && e.event == event && e.fn == fn && e.scope == scope) {
                    this.dispatcherCaches.splice(i, 1);
                    obj.un(event, e.fireFn, scope);
                    break;
                }
            }
        },
        
        // private
        createListener: function(obj, eventName, fireFn, scope, options) {
            var h = fireFn;
            options = options || {};
            if (options.single) {
                h = createSingle(this, obj, eventName, fireFn, scope);
            }
            return h;
        },
        
        // private
        beforeDestroy: MX.emptyFn,
        
        // private
        onDestroy: MX.emptyFn,
        
        /**
         * 调用destroy()方法，进入销毁生命周期，如下：
         *  1、fire事件'beforedestroy'
         *  2、调用beforeDestroy()方法
         *  3、移除dom对象绑定的事件
         *  4、调用onDestroy()方法
         *  5、fire事件'destroy'
         *  6、清空ob绑定的事件
         */
        destroy: function() {
            if (!this.isDestroyed) {
                if (this.fireEvent('beforedestroy', this) !== false) {
                    this.destroying = true;
                    this.beforeDestroy();
                    
                    this.clearEventCache();
                    this.clearDelegateCache();
                    this.clearDispatcherCache();
                    
                    this.onDestroy();
                    this.fireEvent('destroy', this);
                    
                    this.ob.purgeListeners();
                    this.destroying = false;
                    this.isDestroyed = true;
                }
            }
        }
    });
})();