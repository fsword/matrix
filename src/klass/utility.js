/**
 * @class MX.klass.Utility
 * @alias utility
 * Utility类是非常实用的一个类，一般情况下，声明类都应该继承Utility类。
 * 它定义了类的两个常用生命周期：初始化、销毁。
 * 除此之外，它还能处理类的自定义事件以及HTMLElement事件，并且事件的销毁由类的实例对象托管，在实例被销毁时，事件监听自动销毁。
 *
 * 以下是Utility类生命周期的几个模板方法，由子类继承实现
 * <code>
 *  var Cls1 = Klass.define({
 *      extend: 'utility',
 *      init: function() {
 *          // 初始化函数，在类被实例化执行构造函数时调用
 *      },
 *      initEvents: function() {
 *          // 初始化事件，在init()函数之后调用
 *      },
 *      beforeDestroy: function() {
 *          // 销毁实例，在destroy()函数最初调用
 *      },
 *      onDestroy: function() {
 *          // 销毁实例，在destroy()函数之后调用
 *      }
 *  });
 * </code>
 */
MX.kindle('jquery', 'klass', 'dispatcher', function(X, $, Klass, Dispatcher) {
    var idSeed = 1000,
        eventPropRe = /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/;
    
    function makeId(prefix) {
        return (prefix || 'gen-id') + (++idSeed);
    }
    
    function createSingle(obj, item, types, selector, fn, scope){
        return function(){
            obj.mun(item, types, selector, fn, scope);
            return fn.apply(scope, arguments);
        };
    }
    
    X.klass.Utility = Klass.define({
        // private
        alias: 'utility',
        
        /**
         * @cfg {String} idPrefix id前缀，默认'gen-id'
         * 继承自Utility的子类，在实例化时，会自动生成一个id
         */

        /**
         * @cfg {Object} listeners 自定义事件监听回调函数
         * 参数格式如下：
         * <code>
         *  Klass.define({
         *      extend: 'utility',
         *      listeners: {
         *          scope: this, // 设置回调函数的作用域，如果未设置，默认为当前类的实例对象
         *          'custom1': function() {
         *              // 第一种写法
         *          },
         *          'custom2': {
         *              fn: function() {
         *                  // 第二种写法
         *              },
         *              scope: this // 为当前事件监听回调函数设置指定的作用域
         *          }
         *      }
         *  });
         * </code>
         */
        
        /*
         * @private
         * 构造函数，实现了Utility类的初始化生命周期，初始化的几个过程：
         *  1、初始化配置参数，生成id
         *  2、实例化Dispatcher对象，将自定义事件函数委派给当前实例
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

            /**
             * @property {String} id
             * 实例对象id
             */
            if (!this.id) {
                this.id = makeId(this.idPrefix || '');
            }

            /**
             * @property {MX.util.Dispatcher} ob
             * 自定义事件实例对象
             */
            this.ob = new Dispatcher(this.listeners, this);
            delete this.listeners;
            this.relayMethod(this.ob, 'addEvents', 'fireEvent', 'addListener', 'removeListener', 'on', 'un');

            this.addEvents(
                /**
                 * @event beforedestroy
                 * 当调用destroy()函数时，在destroy最初触发，返回true则中断销毁动作
                 * @param {Object} this
                 */
                'beforedestroy',
                /**
                 * @event destroy
                 * 当调用destroy()函数时触发
                 * @param {Object} this
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
         * 将指定对象的方法委派给当前类的实例对象this，使this实例也拥有这些方法，例如：
         * <code>
         *  var Cls1 = Klass.define({
         *      str: 'max',
         *      method1: function() {
         *          alert(this.str + 1);
         *      },
         *      method2: function() {
         *          alert(this.str + 2);
         *      }
         *  });
         *  var obj1 = new Cls1();
         *
         *  var Cls2 = Klass.define({
         *      str: 'none',
         *      constructor: function() {
         *          this.relayMethod(obj1, 'method1', 'method2');
         *      },
         *      method3: function() {
         *          alert(this.str + 3);
         *      }
         *  });
         *  var obj2 = new Cls2();
         *
         *  obj2.method1(); // alert 'max1';
         *  obj2.method2(); // alert 'max2';
         *  obj2.method3(); // alert 'none3';
         * </code>
         *
         * @param {Object} obj 源对象
         * @param {String...} methodName 方法名称
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
         * 事件监听，为指定对象（item）绑定一个事件处理函数，item可以是一个Utility子类的实例对象，
         * 也可以是一个jQuery element或浏览器对象（浏览器对象会被自动封装成一个jQuery element对象）.
         *
         * 当item是一个Utility子类实例对象时，selector参数无效，可以使用以下几种方式进行事件监听：
         * <code>
         *  // 传入两个参数
         *  this.mon(this.view, {
         *      scope: this,
         *      'render': function() {
         *          // 第一种写法
         *      },
         *      'destroy': {
         *          fn: function() {
         *              // 第二种写法
         *          },
         *          options: {
         *              single: true
         *          },
         *          scope: this // 为当前事件监听回调函数指定作用域
         *      }
         *  });
         *
         *  // 传入三个参数
         *  this.mon(this.view, 'render', function() {});
         *
         *  // 传入四个参数
         *  this.mon(this.view, 'render', function() {}, this);
         *
         *  // 传入五个参数
         *  this.mon(this.view, 'render', function() {}, this, { single: true });
         * </code>
         *
         * 当item是jquery element对象时，可以使用以下几种方式进行事件监听：
         * <code>
         *  // 传入两个参数
         *  this.mon(this.el, {
         *      scope: this,
         *      'mouseenter': function() {
         *          // 第一种写法
         *      },
         *      'mouseleave': {
         *          fn: function() {
         *              // 第二种写法
         *          },
         *          options: {
         *              single: true
         *          },
         *          scope: this // 为当前事件监听回调函数指定作用域
         *      }
         *  });
         *
         *  // 传入三个参数
         *  this.mon(this.el, 'mouseenter', function() {});
         *
         *  // 传入四个参数
         *  this.mon(this.el, 'mouseenter', function() {}, this);
         *
         *  // 传入五个参数
         *  this.mon(this.el, 'mouseenter', function() {}, this, { single: true });
         * </code>
         *
         * 处理item为jquery element对象的委托事件使用如下方式：
         * <code>
         *  // 传入两个参数
         *  this.mon(this.el, {
         *      scope: this,
         *      'click': {
         *          fn: function() {
         *          },
         *          selector: 'a.btn'
         *          options: {
         *              single: true
         *          },
         *          scope: this // 为当前事件监听回调函数指定作用域
         *      }
         *  });
         *
         *  // 传入四个参数
         *  this.mon(this.el, 'mouseenter', 'a.btn', function() {});
         *
         *  // 传入五个参数
         *  this.mon(this.el, 'mouseenter', 'a.btn', function() {}, this);
         *
         *  // 传入六个参数
         *  this.mon(this.el, 'mouseenter', 'a.btn', function() {}, this, { single: true });
         * </code>
         * 
         * @param {Element/Object} item 指定对象，Utility子类实例对象或一个jquery element对象
         * @param {String/Object} types 事件类型，当为Object类型时，表示监听一组事件
         * @param {String} selector (options) 一个选择器字符串，仅对jquery element对象有效
         * @param {Function} fn (optional) 事件监听回调函数
         * @param {Object} scope (optional) 回调函数作用域
         * @param {Object} options (optional) 事件监听选项，当item为jquery element时，options可以在回调函数的第一个参数event.data获得
         *  可选的选项参数包括：
         *      Boolean : single true表示只执行一次
         */
        mon: function(item, types, selector, fn, scope, options) {
            var event,
                type,
                proxyFn,
                isClass = true,
                data;
            
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
                        this.mon(item, type, event.selector, event.fn, event.scope || scope, event.options || options);
                    }
                }
                return;
            }
            
            if (X.isFunction(selector)) {
                // (item, type, fn, scope, options)
                options = scope;
                scope = fn;
                fn = selector;
                selector = undefined;
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
            data = [options];
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
                options: options,
                data: data
            });
            
            if (isClass) {
                item.on && item.on(types, fn, scope, options);
            } else {
                item.on(types, selector, data, proxyFn);
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
         * 销毁一个事件监听，与声明事件监听mon()的传参方式一致，item同样包括两类：Utility的子类实例对象、jquery element对象
         * @param {Element/Object} item 指定对象，Utility子类实例对象或一个jquery element对象
         * @param {String/Object} types 事件类型，当为Object类型时，表示监听一组事件
         * @param {String} selector (options) 一个选择器字符串，仅对jquery element对象有效
         * @param {Function} fn (optional) 事件监听回调函数
         * @param {Object} scope (optional) 回调函数作用域
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
                        this.mun(item, type, event.data, event, scope);
                    } else {
                        this.mun(item, type, event.selector, event.fn, event.scope || scope);
                    }
                }
                return;
            }
            
            if (X.isFunction(selector)) {
                // (item, type, fn, scope)
                scope = fn;
                fn = selector;
                selector = undefined;
            }
            
            scope = scope || this;
            for (i = 0, len = this.eventCaches.length; i < len; i++) {
                event = this.eventCaches[i];
                if ((isClass ? item == event.item : item.is(event.item)) && types == event.type && selector == event.selector && fn == event.fn && scope == event.scope) {
                    this.eventCaches.splice(i, 1);
                    if (isClass) {
                        item.un && item.un(types, fn, scope);
                    } else {
                        item.off(types, selector, event.data, event.proxyFn);
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
         * 销毁当前实例对象
         *
         * 销毁生命周期如下：
         *  1、fire事件'beforedestroy'，返回false时中断销毁动作
         *  2、调用beforeDestroy()方法
         *  3、移除所有jquery element事件监听
         *  4、调用onDestroy()方法
         *  5、fire事件'destroy'
         *  6、清空this.ob事件监听
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