/**
 * @class MX.klass.Utility
 * 
 * 抽象类，实现了类事件，对象实例化与销毁生命周期
 */
MX.kindle('jquery', 'klass', 'dispatcher', function(X, $, Klass, Dispatcher) {
    var idSeed = 1000,
        eventPropRe = /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/;
    
    function makeId(prefix) {
        return (prefix || 'gen-id') + (++idSeed);
    };
    
    function createSingle(obj, item, types, selector, fn, scope){
        return function(){
            obj.mun(item, types, selector, fn, scope);
            return fn.apply(scope, arguments);
        };
    };
    
    X.klass.Utility = Klass.define({
        // private
        alias: 'utility',
        
        /**
         * @cfg {String} idPrefix
         * id前缀，默认'gen-id'
         */
        
        /*
         * @private
         * 构造函数，AbstractClass实现了类实例化的生命周期，实例化的几个过程：
         *  1、初始化配置参数
         *  2、实例化ob对象，注册事件
         *  3、调用init()方法
         *  4、调用initEvents()方法
         * 
         * @cfg {Object} config 配置参数
         */
        constructor: function(config) {
            config = config || {};
            $.extend(this, config);
            
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
        init: X.emptyFn,
        
        // private
        initEvents: X.emptyFn,
        
        /**
         * 将指定对象的方法映射给this实例，使this实例也拥有指定的方法，例如：
         * @param {Object} obj 指定映射方法的对象
         * @param {Array} methods 方法名称
         */
        relayMethod: function(obj) {
            var methods = Array.prototype.slice.call(arguments, 1),
                method,
                fn,
                i, 
                len;
            for (i = 0, len = methods.length; i < len; i++) {
                method = methods[i];
                fn = obj[method];
                if (!this[method] && fn) {
                    this[method] = function(proxyFn) {
                        return function() {
                            return proxyFn.apply(obj, arguments);
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
                    item;
                for (; i >= 0; i--) {
                    item = this.eventCaches[i];
                    this.mun(item, item.type, item.selector, item.fn, item.scope);
                };
            }
        },
        
        /**
         * 为指定Element绑定一个dom事件处理函数，例如：
         * <code>
         *  this.mon(this.el, 'mouseenter', function() {
         *      // 如果未指定scope，回调函数的scope默认为模型实例对象
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
         *  // 同时也可以绑定委托事件
         *  this.mon(this.el, 'mouseenter', 'a.btn', function() {
         *      
         *  }, this);
         * </code>
         * 
         * @param {Element/Object} item
         * @param {String/Object} events 事件类型，当为Object时，表示绑定一组处理事件
         * @param {String} selector (options) 一个选择器字符串
         * @param {Function} handler (optional) 事件处理函数
         * @param {Object} scope (optional) 处理函数作用域
         * @param {Object} options (optional) 
         */
        mon: function(item, types, selector, fn, scope, options) {
            var event,
                type,
                proxyFn,
                isClass = true;
            
            this.createEventCache();
            
            if (X.isObject(types)) {
                scope = types.scope || this;
                for (type in types) {
                    if (eventPropRe.test(type)) {
                        continue;
                    }
                    event = types[type];
                    if (X.isFunction(event)) {
                        this.mon(item, type, undefined, event, scope, undefined);
                    } else {
                        this.mon(item, type, event.selector, event.fn, event.scope || scope, options);
                    }
                }
                return;
            }
            
            if (X.isFunction(selector)) {
                // (item, type, fn, scope, options)
                fn = selector;
                scope = fn;
                options = scope;
                selector = undefined;
                scope = undefined;
            }
            
            if (!item.$isInstance) {
                isClass = false;
                item = $(item);
                if (item.length > 1) {
                    X.each(item, function(i, el) {
                        this.mon(el, types, selector, fn, scope, options);
                    }, this);
                    return;
                }
            }
            
            scope = scope || this;
            options = options || {};
            if (!isClass) {
                proxyFn = this.createListener(item, types, selector, fn, scope, options);
            }
            this.eventCaches.push({
                isClass: isClass,
                item: item,
                type: types,
                selector: selector,
                fn: fn,
                proxyFn: proxyFn,
                scope: scope,
                options: options
            });
            
            if (isClass) {
                item.on && item.on(types, fn, scope, options);
            } else {
                item.on(types, selector, undefined, proxyFn);
            }
        },
        
        // private
        createListener: function(item, types, selector, fn, scope, options) {
            var fireFn = $.proxy(fn, scope);
            options = options || {};
            if (options.single) {
                fireFn = createSingle(this, item, types, selector, fn, scope);
            }
            return fireFn;
        },
         
        /**
         * 为指定元素取消一个已绑定的处理事件
         * @param {String/Element} el 指定元素
         * @param {String/Object} eventType 事件类型，当为Object时，表示取消一组处理事件
         * @param {Function} handler (optional) 事件处理函数
         * @param {Object} scope (optional) 处理函数作用域
         */
        mun: function(item, types, selector, fn, scope) {
            var isClass = item.$isInstance,
                event,
                type,
                i, len;
            
            this.createEventCache();
            
            if (!isClass) {
                item = $(item);
            }
            if (!types) {
                for (i = 0, len = this.eventCaches.length; i < len; i++) {
                    event = this.eventCaches[i];
                    if (isClass ? item == event.item :  item.is(event.item)) {
                        this.mun(item, event.type, event.selector, event.fn, event.scope);
                    }
                }
                return;
            } else if (X.isObject(types)) {
                scope = types.scope || this;
                for (type in types) {
                    if (eventPropRe.test(type)) {
                        continue;
                    }
                    event = types[type];
                    if (X.isFunction(event)) {
                        this.mun(item, type, undefined, event, scope);
                    } else {
                        this.mun(item, type, event.selector, event.fn, event.scope || scope);
                    }
                }
                return;
            }
            
            if (X.isFunction(selector)) {
                // (item, type, fn, scope)
                fn = selector;
                scope = fn;
                selector = undefined;
                scope = undefined;
            }
            
            scope = scope || this;
            for (i = 0, len = this.eventCaches.length; i < len; i++) {
                event = this.eventCaches[i];
                if ((isClass ? item == event.item : item.is(event.item)) && types == event.type && selector == event.selector && fn == event.fn && scope == event.scope) {
                    this.eventCaches.splice(i, 1);
                    if (isClass) {
                        item.un && item.un(types, fn, scope);
                    } else {
                        item.off(types, selector, undefined, event.proxyFn);
                    }
                    break;
                }
            }
        },
        
        // private
        beforeDestroy: X.emptyFn,
        
        // private
        onDestroy: X.emptyFn,
        
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
                    
                    this.onDestroy();
                    this.fireEvent('destroy', this);
                    
                    this.ob.purgeListeners();
                    this.destroying = false;
                    this.isDestroyed = true;
                }
            }
        }
    });
});