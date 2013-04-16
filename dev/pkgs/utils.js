/**
 * @class MX.util.Dispatcher
 * @alias dispatcher
 * 
 * 事件派发者，帮助类声明、管理自定义事件
 *
 * 使用方法如下：
 * 
 * <code>
 *  MX.kindle('dispatcher', function(X, Dispatcher) {
 *      // 实例化一个派发者
 *      var ob = new Dispatcher();
 *      
 *      // 添加事件类型
 *      ob.addEvents('init');
 *  
 *      // 添加事件监听
 *      ob.addListener('init', function() {
 *          // 监听回调函数
 *      });
 *
 *      // 执行事件，调用事件监听回调函数
 *      ob.fireEvent('init');
 *  });
 * </code>
 * 
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    var eventPropRe = /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/;
    
    function createSingle(e, en, fn, scope){
        return function(){
            e.removeListener(en, fn, scope);
            return fn.apply(scope, arguments);
        };
    };
    
    var Dispatcher = Klass.define({
        // private
        alias: 'dispatcher',
        
        /*
         * @private
         * 构造函数
         * @param {Object} listeners 事件监听
         * @param {Object} defaultScope 事件监听回调函数作用域，默认为window
         */
        constructor: function(listeners, defaultScope) {
            this.events = {};
            this.defaultScope = defaultScope || window;
            
            if (listeners) {
                this.addListener(listeners);
            }
        },
        
        /**
         * 声明事件类型，调用方式如下：
         * 
         * <code>
         *  ob.addEvents('event1', 'event2');
         *  
         *  // 或
         *  
         *  ob.addEvents({
         *      'event1': true,
         *      'event2': true
         *  });
         * </code>
         * 
         * @param {String} eventName 事件名称
         * @param {String...} eventName1...n (optional)
         */
        addEvents: function(o) {
            var args,
                i,
                events = this.events;
    
            if (X.isString(o)) {
                args = arguments;
                i = args.length;
    
                while (i--) {
                    events[args[i]] = events[args[i]] || [];
                }
            } else {
                X.each(o, function(eventName, v) {
                    events[eventName] = events[eventName] || [];
                });
            }
        },
        
        /**
         * 增加事件监听
         * @param {String} eventName 事件名称
         * @param {String} fireFn 事件监听回调函数
         * @param {String} scope (optional) 回调函数作用域
         * @param {Object} options (optional) 事件监听选项
         *  可选的选项参数包括：
         *      Boolean : single true表示只执行一次
         */
        addListener: function(eventName, fireFn, scope, options) {
            if (!X.isString(eventName)) {
                var scope = eventName['scope'],
                    listener,
                    eName;
                for (eName in eventName) {
                    if (eventPropRe.test(eName)) {
                        continue;
                    }
                    listener = eventName[eName];
                    if (X.isFunction(listener)) {
                        this.addListener(eName, listener, scope);
                    } else {
                        this.addListener(eName, listener.fn, listener.scope || scope);
                    }
                }
                return;
            }
            
            var events = this.events;
            eventName = eventName.toLowerCase();
            events[eventName] = events[eventName] || [];
            scope = scope || this.defaultScope;
            options = options || {};
            
            events[eventName].push({
                single: options.single,
                fireFn: fireFn,
                listenerFn: this.createListener(eventName, fireFn, scope, options),
                scope: scope
            });
        },
        
        /**
         * 移除事件监听
         * @param {String} eventName 事件名称
         * @param {String} fireFn 事件监听回调函数
         * @param {String} scope 回调函数作用域
         */
        removeListener: function(eventName, fireFn, scope) {
            eventName = eventName.toLowerCase();
            var listeners = this.events[eventName];
            if (X.isArray(listeners)) {
                scope = scope || this.defaultScope;
                for (var i = 0, len = listeners.length; i < len; i++) {
                    if (listeners[i].fireFn == fireFn && scope == listeners[i].scope) {
                        listeners.splice(i, 1);
                        return;
                    }
                }
            }
        },
        
        /**
         * 清空某一个事件的所有监听
         * @param {String} eventName 事件名称
         */
        clearListeners: function(eventName) {
            this.events[eventName.toLowerCase()] = [];
        },
        
        /**
         * 清空所有事件的监听
         */
        purgeListeners: function() {
            for (var eventName in this.events) {
                this.clearListeners(eventName);
            }
        },
        
        /**
         * 校验一个事件是否含有监听函数，返回true则表示此事件有监听
         * @param {String} eventName 事件名称
         * @return {Booolean} 
         */
        hasListener: function(eventName) {
            var listeners = this.events[eventName.toLowerCase()];
            return X.isArray(listeners) && listeners.length > 0;
        },
        
        /**
         * 执行事件，调用事件监听回调函数
         * @param {String} eventName 事件名称
         */
        fireEvent: function(eventName) {
            var listeners = this.events[eventName.toLowerCase()];
            if (X.isArray(listeners)) {
                var args = Array.prototype.slice.call(arguments, 1),
                    len = listeners.length,
                    i = 0,
                    l;
                if (len > 0) {
                    for (; i < len; i++) {
                        l = listeners[i];
                        if (l) {
                            if (l.single === true) {
                                i--;
                            }
                            if (l.listenerFn.apply(l.scope, args) === false) {
                                return false;
                            }
                        }
                    }
                }
            }
        },
        
        // private
        createListener: function(eventName, fireFn, scope, options) {
            var h = fireFn;
            options = options || {};
            if (options.single) {
                h = createSingle(this, eventName, fireFn, scope);
            }
            return h;
        }
    });
    
    $.extend(Dispatcher.prototype, {
        /**
         * 增加事件监听，addListener的缩写方法名
         * @param {String} eventName 事件名称
         * @param {String} fireFn 事件监听回调函数
         * @param {String} scope (optional) 回调函数作用域
         * @param {Object} options (optional) 事件监听选项
         *  可选的选项参数包括：
         *      Boolean : single true表示只执行一次
         */
        on: Dispatcher.prototype.addListener,

        /**
         * 移除事件监听，removeListener的缩写方法名
         * @param {String} eventName 事件名称
         * @param {String} fireFn 事件监听回调函数
         * @param {String} scope 回调函数作用域
         */
        un: Dispatcher.prototype.removeListener
    });

    X.util.Dispatcher = Dispatcher;
});
/**
 * @class MX.klass.Utility
 * @alias utility
 *
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
         * @param {Object} options (optional) 事件监听选项
         *  可选的选项参数包括：
         *      Boolean : single true表示只执行一次
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
         * 销毁一个事件监听，与声明事件监听mon()的传参方式一致，item同样包括两类：Utility的子类实例对象、jquery element对象
         * @param {Element/Object} item 指定对象，Utility子类实例对象或一个jquery element对象
         * @param {String/Object} types 事件类型，当为Object类型时，表示监听一组事件
         * @param {String} selector (options) 一个选择器字符串，仅对jquery element对象有效
         * @param {Function} fn (optional) 事件监听回调函数
         * @param {Object} scope (optional) 回调函数作用域
         */
        mun: function(item, types, selector, fn, scope) {
            var isClass = !!item.$isInstance,
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
/**
 * @class MX.util.LocalStorage
 * @alias localstorage
 *
 * window.localStorage的封装类，可以将String或Object存储到localStorage中，将值取回时，可以还原成存储时的格式
 */
MX.kindle(function(X) {
    var storage = window.localStorage,
        JSON = window.JSON;

    var LocalStorage = {
        /**
         * @cfg {String} globalPrefix localStorage存储key的前缀，全局属性，会影响到所有存储的值
         */
        globalPrefix: '',

        /**
         * 保存一个键值到localStorage中
         * @param {String} key
         * @param {String/Number/Object/Array/...} value
         */
        set: function(key, value) {
            try {
                storage.setItem(LocalStorage.globalPrefix + key, JSON.stringify(value));
            } catch (e) {
                // ignore
            }
        },

        /**
         * 使用key找回一个值
         * @param {String} key
         * @returns {Mixed}
         */
        get: function(key) {
            try {
                return JSON.parse(storage.getItem(LocalStorage.globalPrefix + key));
            } catch (e) {
                // ignore
            }
            return '';
        },

        /**
         * 移除一个localStorage中的值
         * @param {String} key
         */
        remove: function(key) {
            storage.removeItem(LocalStorage.globalPrefix + key);
        }
    };
    
    X.util.LocalStorage = LocalStorage;
    X.reg('localstorage', LocalStorage);
});
/**
 * @class MX.util.Format
 * @alias format
 *
 * 常用格式化工具函数，包括：格式化String、格式化Number
 */
MX.kindle('jquery', function(X, $) {
    var formatRe = /\{(\d+)\}/g,
        escapeRe = /('|\\)/g,
        escapeRegexRe = /([-.*+?\^${}()|\[\]\/\\])/g,
        isToFixedBroken = (0.9).toFixed() !== '1';

    function toCamelCase(str) {
        if (str && str.length > 0) {
            var arr = str.split('-'),
                i = 1,
                len = arr.length,
                newStr = [];
            newStr.push(arr[0]);
            for (; i < len; i++) {
                newStr.push(UtilFormat.capitalize(arr[i]));
            }
            str = newStr.join('');
        }
        return str;
    }
    
    var UtilFormat = X.util.Format = {
        /* string format */
        
        /**
         * Pads the left side of a string with a specified character.  This is especially useful
         * for normalizing number and date strings.  Example usage:
         *
         * <pre><code>
         * var s = MX.util.String.leftPad('123', 5, '0');
         * // s now contains the string: '00123'
         * </code></pre>
         * @param {String} string The original string
         * @param {Number} size The total length of the output string
         * @param {String} character (optional) The character with which to pad the original string (defaults to empty string " ")
         * @return {String} The padded string
         */
        leftPad: function(string, size, character) {
            var result = String(string);
            character = character || " ";
            while (result.length < size) {
                result = character + result;
            }
            return result;
        },
        
        /**
         * 格式化一个字符串，例如：
         * <code>
         *  var str = MX.util.Format.format('Hi, {0}! {1}!', 'Max', 'Welcome');
         *  
         *  // 输出 “Hi, Max! Welcome!”
         *  alert(str);
         * </code>
         * 
         * @param {String} formatString 被格式化的字符串
         * @param {String} value1 被替换的值
         * @param {String...} value2...n (optional)
         * @return {String} 格式化完成的字符串
         */
        format: function(formatString) {
            var args = Array.prototype.slice.call(arguments, 1);
            return formatString.replace(formatRe, function(m, i) {
                return args[i];
            });
        },

        /**
         * Capitalize the given string
         * @param {String} string
         * @return {String}
         */
        capitalize: function(string) {
            return string.length > 0 ? (string.charAt(0).toUpperCase() + string.substr(1)) : string;
        },

        /**
         * Uncapitalize the given string
         * @param {String} string
         * @return {String}
         */
        uncapitalize: function(string) {
            return string.length > 0 ? (string.charAt(0).toLowerCase() + string.substr(1)) : string;
        },
        
        /**
         * 将一个'data-info-text'格式的字符串转换成，一个符合驼峰命名法的字符串并返回
         * 
         * 如果参数是一个String，例如：
         *      
         *      data-info-text 转换后 dataInfoText
         * 
         * 
         * 如果参数是一个Object，例如：
         * 
         *      {
         *          'data-info-text': 'text',
         *          'data-error-text': 'error',
         *      }
         *      
         *      转换后
         *      
         *      {
         *          dataInfoText: 'text',
         *          dataErrorText: 'error',
         *      }
         * 
         * @param {String/Object} obj
         * @return {String/Object}
         */
        toCamelCase: function(obj) {
            if (X.isObject(obj)) {
                var ret = {};
                X.each(obj, function(key, v) {
                    ret[toCamelCase(key)] = v;
                });
                return ret;
            }
            return toCamelCase(obj);
        },

        /**
         * Appends content to the query string of a URL, handling logic for whether to place
         * a question mark or ampersand.
         * @param {String} url The URL to append to.
         * @param {String/Object} obj The content to append to the URL.
         * @return {String} The resulting URL
         */
        urlAppend : function(url, obj) {
            url += (url.indexOf('?') === -1 ? '?' : '&');
            if (X.isString(obj)) {
                url += obj;
            } else {
                var arr = [];
                X.each(obj, function(key, value) {
                    arr.push(key + '=' + (value || ''));
                });
                url += arr.join('&');
            }
            if (url.charAt(url.length - 1) == '?') {
                url = url.substring(0, url.length - 1);
            }
            return url;
        },

        /**
         * Escapes the passed string for use in a regular expression
         * @param {String} string
         * @return {String}
         */
        escapeRegex: function(string) {
            return string.replace(escapeRegexRe, "\\$1");
        },

        /**
         * Escapes the passed string for ' and \
         * @param {String} string The string to escape
         * @return {String} The escaped string
         */
        escape: function(string) {
            return string.replace(escapeRe, "\\$1");
        },
        
        
        /* number format*/
        
        /**
         * Formats a number using fixed-point notation
         * @param {Number} value The number to format
         * @param {Number} precision The number of digits to show after the decimal point
         */
        numberToFixed: isToFixedBroken ? function(value, precision) {
            precision = precision || 0;
            var pow = Math.pow(10, precision);
            return (Math.round(value * pow) / pow).toFixed(precision);
        } : function(value, precision) {
            return value.toFixed(precision);
        },

        /**
         * Validate that a value is numeric and convert it to a number if necessary. Returns the specified default value if
         * it is not.
         * 
         * X.util.Number.from('1.23', 1); // returns 1.23
         * X.util.Number.from('abc', 1); // returns 1
         * 
         * @param {Object} value
         * @param {Number} defaultValue The value to return if the original value is non-numeric
         * @return {Number} value, if numeric, defaultValue otherwise
         */
        from: function(value, defaultValue) {
            if (isFinite(value)) {
                value = parseFloat(value);
            }

            return !isNaN(value) ? value : defaultValue;
        }
    };
    
    X.reg('format', UtilFormat);
});
/**
 * @class MX.util.DateFormatFormat
 * @alias dateformat
 * 
 * DateFormat类来自Ext3.4.0的源码
 * 
 * A set of useful static methods to deal with date
 * Note that if MX.util.DateFormat is required and loaded, it will copy all methods / properties to
 * this object for convenience
 *
 * The date parsing and formatting syntax contains a subset of
 * <a href="http://www.php.net/date">PHP's date() function</a>, and the formats that are
 * supported will provide results equivalent to their PHP versions.
 *
 * The following is a list of all currently supported formats:
 * <pre class="">
Format  Description                                                               Example returned values
------  -----------------------------------------------------------------------   -----------------------
  d     Day of the month, 2 digits with leading zeros                             01 to 31
  D     A short textual representation of the day of the week                     Mon to Sun
  j     Day of the month without leading zeros                                    1 to 31
  l     A full textual representation of the day of the week                      Sunday to Saturday
  N     ISO-8601 numeric representation of the day of the week                    1 (for Monday) through 7 (for Sunday)
  S     English ordinal suffix for the day of the month, 2 characters             st, nd, rd or th. Works well with j
  w     Numeric representation of the day of the week                             0 (for Sunday) to 6 (for Saturday)
  z     The day of the year (starting from 0)                                     0 to 364 (365 in leap years)
  W     ISO-8601 week number of year, weeks starting on Monday                    01 to 53
  F     A full textual representation of a month, such as January or March        January to December
  m     Numeric representation of a month, with leading zeros                     01 to 12
  M     A short textual representation of a month                                 Jan to Dec
  n     Numeric representation of a month, without leading zeros                  1 to 12
  t     Number of days in the given month                                         28 to 31
  L     Whether it&#39;s a leap year                                                  1 if it is a leap year, 0 otherwise.
  o     ISO-8601 year number (identical to (Y), but if the ISO week number (W)    Examples: 1998 or 2004
        belongs to the previous or next year, that year is used instead)
  Y     A full numeric representation of a year, 4 digits                         Examples: 1999 or 2003
  y     A two digit representation of a year                                      Examples: 99 or 03
  a     Lowercase Ante meridiem and Post meridiem                                 am or pm
  A     Uppercase Ante meridiem and Post meridiem                                 AM or PM
  g     12-hour format of an hour without leading zeros                           1 to 12
  G     24-hour format of an hour without leading zeros                           0 to 23
  h     12-hour format of an hour with leading zeros                              01 to 12
  H     24-hour format of an hour with leading zeros                              00 to 23
  i     Minutes, with leading zeros                                               00 to 59
  s     Seconds, with leading zeros                                               00 to 59
  u     Decimal fraction of a second                                              Examples:
        (minimum 1 digit, arbitrary number of digits allowed)                     001 (i.e. 0.001s) or
                                                                                  100 (i.e. 0.100s) or
                                                                                  999 (i.e. 0.999s) or
                                                                                  999876543210 (i.e. 0.999876543210s)
  O     Difference to Greenwich time (GMT) in hours and minutes                   Example: +1030
  P     Difference to Greenwich time (GMT) with colon between hours and minutes   Example: -08:00
  T     Timezone abbreviation of the machine running the code                     Examples: EST, MDT, PDT ...
  Z     Timezone offset in seconds (negative if west of UTC, positive if east)    -43200 to 50400
  c     ISO 8601 date
        Notes:                                                                    Examples:
        1) If unspecified, the month / day defaults to the current month / day,   1991 or
           the time defaults to midnight, while the timezone defaults to the      1992-10 or
           browser's timezone. If a time is specified, it must include both hours 1993-09-20 or
           and minutes. The "T" delimiter, seconds, milliseconds and timezone     1994-08-19T16:20+01:00 or
           are optional.                                                          1995-07-18T17:21:28-02:00 or
        2) The decimal fraction of a second, if specified, must contain at        1996-06-17T18:22:29.98765+03:00 or
           least 1 digit (there is no limit to the maximum number                 1997-05-16T19:23:30,12345-0400 or
           of digits allowed), and may be delimited by either a '.' or a ','      1998-04-15T20:24:31.2468Z or
        Refer to the examples on the right for the various levels of              1999-03-14T20:24:32Z or
        date-time granularity which are supported, or see                         2000-02-13T21:25:33
        http://www.w3.org/TR/NOTE-datetime for more info.                         2001-01-12 22:26:34
  U     Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)                1193432466 or -2138434463
  MS    Microsoft AJAX serialized dates                                           \/Date(1238606590509)\/ (i.e. UTC milliseconds since epoch) or
                                                                                  \/Date(1238606590509+0800)\/
</pre>
 *
 * Example usage (note that you must escape format specifiers with '\\' to render them as character literals):
 * <pre><code>
// Sample date:
// 'Wed Jan 10 2007 15:05:01 GMT-0600 (Central Standard Time)'

var dt = new Date('1/10/2007 03:05:01 PM GMT-0600');
console.log(MX.util.DateFormat.format(dt, 'Y-m-d'));                          // 2007-01-10
console.log(MX.util.DateFormat.format(dt, 'F j, Y, g:i a'));                  // January 10, 2007, 3:05 pm
console.log(MX.util.DateFormat.format(dt, 'l, \\t\\he jS \\of F Y h:i:s A')); // Wednesday, the 10th of January 2007 03:05:01 PM
</code></pre>
 *
 * Here are some standard date/time patterns that you might find helpful.  They
 * are not part of the source of MX.util.DateFormat, but to use them you can simply copy this
 * block of code into any script that is included after MX.util.DateFormat and they will also become
 * globally available on the Date object.  Feel free to add or remove patterns as needed in your code.
 * <pre><code>
MX.util.DateFormat.patterns = {
    ISO8601Long:"Y-m-d H:i:s",
    ISO8601Short:"Y-m-d",
    ShortDate: "n/j/Y",
    LongDate: "l, F d, Y",
    FullDateTime: "l, F d, Y g:i:s A",
    MonthDay: "F d",
    ShortTime: "g:i A",
    LongTime: "g:i:s A",
    SortableDateTime: "Y-m-d\\TH:i:s",
    UniversalSortableDateTime: "Y-m-d H:i:sO",
    YearMonth: "F, Y"
};
</code></pre>
 *
 * Example usage:
 * <pre><code>
var dt = new Date();
console.log(MX.util.DateFormat.format(dt, MX.util.DateFormat.patterns.ShortDate));
</code></pre>
 * <p>Developer-written, custom formats may be used by supplying both a formatting and a parsing function
 * which perform to specialized requirements. The functions are stored in {@link #parseFunctions} and {@link #formatFunctions}.</p>
 * @singleton
 */

/*
 * Most of the date-formatting functions below are the excellent work of Baron Schwartz.
 * (see http://www.xaprb.com/blog/2005/12/12/javascript-closures-for-runtime-efficiency/)
 * They generate precompiled functions from format patterns instead of parsing and
 * processing each pattern every time a date is formatted. These functions are available
 * on every Date object.
 */

MX.kindle(function(MX) {

// create private copy of MX's MX.util.Format.format() method
// - to remove unnecessary dependency
// - to resolve namespace conflict with MS-Ajax's implementation
function xf(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/\{(\d+)\}/g, function(m, i) {
        return args[i];
    });
}

MX.util.DateFormat = {
    /**
     * Returns the current timestamp
     * @return {Number} The current timestamp
     * @method
     */
    now: Date.now || function() {
        return +new Date();
    },

    /**
     * @private
     * Private for now
     */
    toString: function(date) {
        var pad = MX.util.Format.leftPad;

        return date.getFullYear() + "-"
            + pad(date.getMonth() + 1, 2, '0') + "-"
            + pad(date.getDate(), 2, '0') + "T"
            + pad(date.getHours(), 2, '0') + ":"
            + pad(date.getMinutes(), 2, '0') + ":"
            + pad(date.getSeconds(), 2, '0');
    },

    /**
     * Returns the number of milliseconds between two dates
     * @param {Date} dateA The first date
     * @param {Date} dateB (optional) The second date, defaults to now
     * @return {Number} The difference in milliseconds
     */
    getElapsed: function(dateA, dateB) {
        return Math.abs(dateA - (dateB || new Date()));
    },

    /**
     * Global flag which determines if strict date parsing should be used.
     * Strict date parsing will not roll-over invalid dates, which is the
     * default behaviour of javascript Date objects.
     * (see {@link #parse} for more information)
     * Defaults to <tt>false</tt>.
     * @type Boolean
    */
    useStrict: false,

    // private
    formatCodeToRegex: function(character, currentGroup) {
        // Note: currentGroup - position in regex result array (see notes for MX.util.DateFormat.parseCodes below)
        var p = utilDate.parseCodes[character];

        if (p) {
          p = typeof p == 'function'? p() : p;
          utilDate.parseCodes[character] = p; // reassign function result to prevent repeated execution
        }

        return p ? MX.applyIf({
          c: p.c ? xf(p.c, currentGroup || "{0}") : p.c
        }, p) : {
            g: 0,
            c: null,
            s: MX.util.Format.escapeRegex(character) // treat unrecognised characters as literals
        };
    },

    /**
     * <p>An object hash in which each property is a date parsing function. The property name is the
     * format string which that function parses.</p>
     * <p>This object is automatically populated with date parsing functions as
     * date formats are requested for MX standard formatting strings.</p>
     * <p>Custom parsing functions may be inserted into this object, keyed by a name which from then on
     * may be used as a format string to {@link #parse}.<p>
     * <p>Example:</p><pre><code>
MX.util.DateFormat.parseFunctions['x-date-format'] = myDateParser;
</code></pre>
     * <p>A parsing function should return a Date object, and is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>date</code> : String<div class="sub-desc">The date string to parse.</div></li>
     * <li><code>strict</code> : Boolean<div class="sub-desc">True to validate date strings while parsing
     * (i.e. prevent javascript Date "rollover") (The default must be false).
     * Invalid date strings should return null when parsed.</div></li>
     * </ul></div></p>
     * <p>To enable Dates to also be <i>formatted</i> according to that format, a corresponding
     * formatting function must be placed into the {@link #formatFunctions} property.
     * @property parseFunctions
     * @type Object
     */
    parseFunctions: {
        "MS": function(input, strict) {
            // note: the timezone offset is ignored since the MS Ajax server sends
            // a UTC milliseconds-since-Unix-epoch value (negative values are allowed)
            var re = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/'),
                r = (input || '').match(re);
            return r? new Date(((r[1] || '') + r[2]) * 1) : null;
        }
    },
    parseRegexes: [],

    /**
     * <p>An object hash in which each property is a date formatting function. The property name is the
     * format string which corresponds to the produced formatted date string.</p>
     * <p>This object is automatically populated with date formatting functions as
     * date formats are requested for MX standard formatting strings.</p>
     * <p>Custom formatting functions may be inserted into this object, keyed by a name which from then on
     * may be used as a format string to {@link #format}. Example:</p><pre><code>
MX.util.DateFormat.formatFunctions['x-date-format'] = myDateFormatter;
</code></pre>
     * <p>A formatting function should return a string representation of the passed Date object, and is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>date</code> : Date<div class="sub-desc">The Date to format.</div></li>
     * </ul></div></p>
     * <p>To enable date strings to also be <i>parsed</i> according to that format, a corresponding
     * parsing function must be placed into the {@link #parseFunctions} property.
     * @property formatFunctions
     * @type Object
     */
    formatFunctions: {
        "MS": function() {
            // UTC milliseconds since Unix epoch (MS-AJAX serialized date format (MRSF))
            return '\\/Date(' + this.getTime() + ')\\/';
        }
    },

    y2kYear : 50,

    /**
     * Date interval constant
     * @type String
     */
    MILLI : "ms",

    /**
     * Date interval constant
     * @type String
     */
    SECOND : "s",

    /**
     * Date interval constant
     * @type String
     */
    MINUTE : "mi",

    /** Date interval constant
     * @type String
     */
    HOUR : "h",

    /**
     * Date interval constant
     * @type String
     */
    DAY : "d",

    /**
     * Date interval constant
     * @type String
     */
    MONTH : "mo",

    /**
     * Date interval constant
     * @type String
     */
    YEAR : "y",

    /**
     * <p>An object hash containing default date values used during date parsing.</p>
     * <p>The following properties are available:<div class="mdetail-params"><ul>
     * <li><code>y</code> : Number<div class="sub-desc">The default year value. (defaults to undefined)</div></li>
     * <li><code>m</code> : Number<div class="sub-desc">The default 1-based month value. (defaults to undefined)</div></li>
     * <li><code>d</code> : Number<div class="sub-desc">The default day value. (defaults to undefined)</div></li>
     * <li><code>h</code> : Number<div class="sub-desc">The default hour value. (defaults to undefined)</div></li>
     * <li><code>i</code> : Number<div class="sub-desc">The default minute value. (defaults to undefined)</div></li>
     * <li><code>s</code> : Number<div class="sub-desc">The default second value. (defaults to undefined)</div></li>
     * <li><code>ms</code> : Number<div class="sub-desc">The default millisecond value. (defaults to undefined)</div></li>
     * </ul></div></p>
     * <p>Override these properties to customize the default date values used by the {@link #parse} method.</p>
     * <p><b>Note: In countries which experience Daylight Saving Time (i.e. DST), the <tt>h</tt>, <tt>i</tt>, <tt>s</tt>
     * and <tt>ms</tt> properties may coincide with the exact time in which DST takes effect.
     * It is the responsiblity of the developer to account for this.</b></p>
     * Example Usage:
     * <pre><code>
// set default day value to the first day of the month
MX.util.DateFormat.defaults.d = 1;

// parse a February date string containing only year and month values.
// setting the default day value to 1 prevents weird date rollover issues
// when attempting to parse the following date string on, for example, March 31st 2009.
MX.util.DateFormat.parse('2009-02', 'Y-m'); // returns a Date object representing February 1st 2009
</code></pre>
     * @property defaults
     * @type Object
     */
    defaults: {},

    //<locale type="array">
    /**
     * @property {String[]} dayNames
     * An array of textual day names.
     * Override these values for international dates.
     * Example:
     * <pre><code>
MX.util.DateFormat.dayNames = [
    'SundayInYourLang',
    'MondayInYourLang',
    ...
];
</code></pre>
     */
    dayNames : [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ],
    //</locale>

    //<locale type="array">
    /**
     * @property {String[]} monthNames
     * An array of textual month names.
     * Override these values for international dates.
     * Example:
     * <pre><code>
MX.util.DateFormat.monthNames = [
    'JanInYourLang',
    'FebInYourLang',
    ...
];
</code></pre>
     */
    monthNames : [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],
    //</locale>

    //<locale type="object">
    /**
     * @property {Object} monthNumbers
     * An object hash of zero-based javascript month numbers (with short month names as keys. note: keys are case-sensitive).
     * Override these values for international dates.
     * Example:
     * <pre><code>
MX.util.DateFormat.monthNumbers = {
    'LongJanNameInYourLang': 0,
    'ShortJanNameInYourLang':0,
    'LongFebNameInYourLang':1,
    'ShortFebNameInYourLang':1,
    ...
};
</code></pre>
     */
    monthNumbers : {
        January: 0,
        Jan: 0,
        February: 1,
        Feb: 1,
        March: 2,
        Mar: 2,
        April: 3,
        Apr: 3,
        May: 4,
        June: 5,
        Jun: 5,
        July: 6,
        Jul: 6,
        August: 7,
        Aug: 7,
        September: 8,
        Sep: 8,
        October: 9,
        Oct: 9,
        November: 10,
        Nov: 10,
        December: 11,
        Dec: 11
    },
    //</locale>
    
    //<locale>
    /**
     * @property {String} defaultFormat
     * <p>The date format string that the {@link MX.util.Format#dateRenderer}
     * and {@link MX.util.Format#date} functions use.  See {@link MX.util.DateFormat} for details.</p>
     * <p>This may be overridden in a locale file.</p>
     */
    defaultFormat : "m/d/Y",
    //</locale>
    //<locale type="function">
    /**
     * Get the short month name for the given month number.
     * Override this function for international dates.
     * @param {Number} month A zero-based javascript month number.
     * @return {String} The short month name.
     */
    getShortMonthName : function(month) {
        return MX.util.DateFormat.monthNames[month].substring(0, 3);
    },
    //</locale>

    //<locale type="function">
    /**
     * Get the short day name for the given day number.
     * Override this function for international dates.
     * @param {Number} day A zero-based javascript day number.
     * @return {String} The short day name.
     */
    getShortDayName : function(day) {
        return MX.util.DateFormat.dayNames[day].substring(0, 3);
    },
    //</locale>

    //<locale type="function">
    /**
     * Get the zero-based javascript month number for the given short/full month name.
     * Override this function for international dates.
     * @param {String} name The short/full month name.
     * @return {Number} The zero-based javascript month number.
     */
    getMonthNumber : function(name) {
        // handle camel casing for english month names (since the keys for the MX.util.DateFormat.monthNumbers hash are case sensitive)
        return MX.util.DateFormat.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
    },
    //</locale>

    /**
     * Checks if the specified format contains hour information
     * @param {String} format The format to check
     * @return {Boolean} True if the format contains hour information
     * @method
     */
    formatContainsHourInfo : (function(){
        var stripEscapeRe = /(\\.)/g,
            hourInfoRe = /([gGhHisucUOPZ]|MS)/;
        return function(format){
            return hourInfoRe.test(format.replace(stripEscapeRe, ''));
        };
    }()),

    /**
     * Checks if the specified format contains information about
     * anything other than the time.
     * @param {String} format The format to check
     * @return {Boolean} True if the format contains information about
     * date/day information.
     * @method
     */
    formatContainsDateInfo : (function(){
        var stripEscapeRe = /(\\.)/g,
            dateInfoRe = /([djzmnYycU]|MS)/;

        return function(format){
            return dateInfoRe.test(format.replace(stripEscapeRe, ''));
        };
    }()),
    
    /**
     * Removes all escaping for a date format string. In date formats,
     * using a '\' can be used to escape special characters.
     * @param {String} format The format to unescape
     * @return {String} The unescaped format
     * @method
     */
    unescapeFormat: (function() { 
        var slashRe = /\\/gi;
        return function(format) {
            // Escape the format, since \ can be used to escape special
            // characters in a date format. For example, in a spanish
            // locale the format may be: 'd \\de F \\de Y'
            return format.replace(slashRe, '');
        }
    }()),

    /**
     * The base format-code to formatting-function hashmap used by the {@link #format} method.
     * Formatting functions are strings (or functions which return strings) which
     * will return the appropriate value when evaluated in the context of the Date object
     * from which the {@link #format} method is called.
     * Add to / override these mappings for custom date formatting.
     * Note: MX.util.DateFormat.format() treats characters as literals if an appropriate mapping cannot be found.
     * Example:
     * <pre><code>
MX.util.DateFormat.formatCodes.x = "MX.util.Format.leftPad(this.getDate(), 2, '0')";
console.log(MX.util.DateFormat.format(new Date(), 'X'); // returns the current day of the month
</code></pre>
     * @type Object
     */
    formatCodes : {
        d: "MX.util.Format.leftPad(this.getDate(), 2, '0')",
        D: "MX.util.DateFormat.getShortDayName(this.getDay())", // get localised short day name
        j: "this.getDate()",
        l: "MX.util.DateFormat.dayNames[this.getDay()]",
        N: "(this.getDay() ? this.getDay() : 7)",
        S: "MX.util.DateFormat.getSuffix(this)",
        w: "this.getDay()",
        z: "MX.util.DateFormat.getDayOfYear(this)",
        W: "MX.util.Format.leftPad(MX.util.DateFormat.getWeekOfYear(this), 2, '0')",
        F: "MX.util.DateFormat.monthNames[this.getMonth()]",
        m: "MX.util.Format.leftPad(this.getMonth() + 1, 2, '0')",
        M: "MX.util.DateFormat.getShortMonthName(this.getMonth())", // get localised short month name
        n: "(this.getMonth() + 1)",
        t: "MX.util.DateFormat.getDaysInMonth(this)",
        L: "(MX.util.DateFormat.isLeapYear(this) ? 1 : 0)",
        o: "(this.getFullYear() + (MX.util.DateFormat.getWeekOfYear(this) == 1 && this.getMonth() > 0 ? +1 : (MX.util.DateFormat.getWeekOfYear(this) >= 52 && this.getMonth() < 11 ? -1 : 0)))",
        Y: "MX.util.Format.leftPad(this.getFullYear(), 4, '0')",
        y: "('' + this.getFullYear()).substring(2, 4)",
        a: "(this.getHours() < 12 ? 'am' : 'pm')",
        A: "(this.getHours() < 12 ? 'AM' : 'PM')",
        g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)",
        G: "this.getHours()",
        h: "MX.util.Format.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",
        H: "MX.util.Format.leftPad(this.getHours(), 2, '0')",
        i: "MX.util.Format.leftPad(this.getMinutes(), 2, '0')",
        s: "MX.util.Format.leftPad(this.getSeconds(), 2, '0')",
        u: "MX.util.Format.leftPad(this.getMilliseconds(), 3, '0')",
        O: "MX.util.DateFormat.getGMTOffset(this)",
        P: "MX.util.DateFormat.getGMTOffset(this, true)",
        T: "MX.util.DateFormat.getTimezone(this)",
        Z: "(this.getTimezoneOffset() * -60)",

        c: function() { // ISO-8601 -- GMT format
            var c, code, i, l, e;
            for (c = "Y-m-dTH:i:sP", code = [], i = 0, l = c.length; i < l; ++i) {
                e = c.charAt(i);
                code.push(e == "T" ? "'T'" : utilDate.getFormatCode(e)); // treat T as a character literal
            }
            return code.join(" + ");
        },
        /*
        c: function() { // ISO-8601 -- UTC format
            return [
              "this.getUTCFullYear()", "'-'",
              "MX.util.Format.leftPad(this.getUTCMonth() + 1, 2, '0')", "'-'",
              "MX.util.Format.leftPad(this.getUTCDate(), 2, '0')",
              "'T'",
              "MX.util.Format.leftPad(this.getUTCHours(), 2, '0')", "':'",
              "MX.util.Format.leftPad(this.getUTCMinutes(), 2, '0')", "':'",
              "MX.util.Format.leftPad(this.getUTCSeconds(), 2, '0')",
              "'Z'"
            ].join(" + ");
        },
        */

        U: "Math.round(this.getTime() / 1000)"
    },

    /**
     * Checks if the passed Date parameters will cause a javascript Date "rollover".
     * @param {Number} year 4-digit year
     * @param {Number} month 1-based month-of-year
     * @param {Number} day Day of month
     * @param {Number} hour (optional) Hour
     * @param {Number} minute (optional) Minute
     * @param {Number} second (optional) Second
     * @param {Number} millisecond (optional) Millisecond
     * @return {Boolean} true if the passed parameters do not cause a Date "rollover", false otherwise.
     */
    isValid : function(y, m, d, h, i, s, ms) {
        // setup defaults
        h = h || 0;
        i = i || 0;
        s = s || 0;
        ms = ms || 0;

        // Special handling for year < 100
        var dt = utilDate.add(new Date(y < 100 ? 100 : y, m - 1, d, h, i, s, ms), utilDate.YEAR, y < 100 ? y - 100 : 0);

        return y == dt.getFullYear() &&
            m == dt.getMonth() + 1 &&
            d == dt.getDate() &&
            h == dt.getHours() &&
            i == dt.getMinutes() &&
            s == dt.getSeconds() &&
            ms == dt.getMilliseconds();
    },

    /**
     * Parses the passed string using the specified date format.
     * Note that this function expects normal calendar dates, meaning that months are 1-based (i.e. 1 = January).
     * The {@link #defaults} hash will be used for any date value (i.e. year, month, day, hour, minute, second or millisecond)
     * which cannot be found in the passed string. If a corresponding default date value has not been specified in the {@link #defaults} hash,
     * the current date's year, month, day or DST-adjusted zero-hour time value will be used instead.
     * Keep in mind that the input date string must precisely match the specified format string
     * in order for the parse operation to be successful (failed parse operations return a null value).
     * <p>Example:</p><pre><code>
//dt = Fri May 25 2007 (current date)
var dt = new Date();

//dt = Thu May 25 2006 (today&#39;s month/day in 2006)
dt = MX.util.DateFormat.parse("2006", "Y");

//dt = Sun Jan 15 2006 (all date parts specified)
dt = MX.util.DateFormat.parse("2006-01-15", "Y-m-d");

//dt = Sun Jan 15 2006 15:20:01
dt = MX.util.DateFormat.parse("2006-01-15 3:20:01 PM", "Y-m-d g:i:s A");

// attempt to parse Sun Feb 29 2006 03:20:01 in strict mode
dt = MX.util.DateFormat.parse("2006-02-29 03:20:01", "Y-m-d H:i:s", true); // returns null
</code></pre>
     * @param {String} input The raw date string.
     * @param {String} format The expected date string format.
     * @param {Boolean} strict (optional) True to validate date strings while parsing (i.e. prevents javascript Date "rollover")
                        (defaults to false). Invalid date strings will return null when parsed.
     * @return {Date} The parsed Date.
     */
    parse : function(input, format, strict) {
        var p = utilDate.parseFunctions;
        if (p[format] == null) {
            utilDate.createParser(format);
        }
        return p[format](input, MX.isDefined(strict) ? strict : utilDate.useStrict);
    },

    // Backwards compat
    parseDate: function(input, format, strict){
        return utilDate.parse(input, format, strict);
    },


    // private
    getFormatCode : function(character) {
        var f = utilDate.formatCodes[character];

        if (f) {
          f = typeof f == 'function'? f() : f;
          utilDate.formatCodes[character] = f; // reassign function result to prevent repeated execution
        }

        // note: unknown characters are treated as literals
        return f || ("'" + MX.util.Format.escape(character) + "'");
    },

    // private
    createFormat : function(format) {
        var code = [],
            special = false,
            ch = '',
            i;

        for (i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            } else if (special) {
                special = false;
                code.push("'" + MX.util.Format.escape(ch) + "'");
            } else {
                code.push(utilDate.getFormatCode(ch));
            }
        }
        utilDate.formatFunctions[format] = Function.prototype.constructor.apply(Function.prototype, ["return " + code.join('+')]);
    },

    // private
    createParser : (function() {
        var code = [
            "var dt, y, m, d, h, i, s, ms, o, z, zz, u, v,",
                "def = MX.util.DateFormat.defaults,",
                "results = String(input).match(MX.util.DateFormat.parseRegexes[{0}]);", // either null, or an array of matched strings

            "if(results){",
                "{1}",

                "if(u != null){", // i.e. unix time is defined
                    "v = new Date(u * 1000);", // give top priority to UNIX time
                "}else{",
                    // create Date object representing midnight of the current day;
                    // this will provide us with our date defaults
                    // (note: clearTime() handles Daylight Saving Time automatically)
                    "dt = MX.util.DateFormat.clearTime(new Date);",

                    // date calculations (note: these calculations create a dependency on MX.util.Format.from())
                    "y = MX.util.Format.from(y, MX.util.Format.from(def.y, dt.getFullYear()));",
                    "m = MX.util.Format.from(m, MX.util.Format.from(def.m - 1, dt.getMonth()));",
                    "d = MX.util.Format.from(d, MX.util.Format.from(def.d, dt.getDate()));",

                    // time calculations (note: these calculations create a dependency on MX.util.Format.from())
                    "h  = MX.util.Format.from(h, MX.util.Format.from(def.h, dt.getHours()));",
                    "i  = MX.util.Format.from(i, MX.util.Format.from(def.i, dt.getMinutes()));",
                    "s  = MX.util.Format.from(s, MX.util.Format.from(def.s, dt.getSeconds()));",
                    "ms = MX.util.Format.from(ms, MX.util.Format.from(def.ms, dt.getMilliseconds()));",

                    "if(z >= 0 && y >= 0){",
                        // both the year and zero-based day of year are defined and >= 0.
                        // these 2 values alone provide sufficient info to create a full date object

                        // create Date object representing January 1st for the given year
                        // handle years < 100 appropriately
                        "v = MX.util.DateFormat.add(new Date(y < 100 ? 100 : y, 0, 1, h, i, s, ms), MX.util.DateFormat.YEAR, y < 100 ? y - 100 : 0);",

                        // then add day of year, checking for Date "rollover" if necessary
                        "v = !strict? v : (strict === true && (z <= 364 || (MX.util.DateFormat.isLeapYear(v) && z <= 365))? MX.util.DateFormat.add(v, MX.util.DateFormat.DAY, z) : null);",
                    "}else if(strict === true && !MX.util.DateFormat.isValid(y, m + 1, d, h, i, s, ms)){", // check for Date "rollover"
                        "v = null;", // invalid date, so return null
                    "}else{",
                        // plain old Date object
                        // handle years < 100 properly
                        "v = MX.util.DateFormat.add(new Date(y < 100 ? 100 : y, m, d, h, i, s, ms), MX.util.DateFormat.YEAR, y < 100 ? y - 100 : 0);",
                    "}",
                "}",
            "}",

            "if(v){",
                // favour UTC offset over GMT offset
                "if(zz != null){",
                    // reset to UTC, then add offset
                    "v = MX.util.DateFormat.add(v, MX.util.DateFormat.SECOND, -v.getTimezoneOffset() * 60 - zz);",
                "}else if(o){",
                    // reset to GMT, then add offset
                    "v = MX.util.DateFormat.add(v, MX.util.DateFormat.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));",
                "}",
            "}",

            "return v;"
        ].join('\n');

        return function(format) {
            var regexNum = utilDate.parseRegexes.length,
                currentGroup = 1,
                calc = [],
                regex = [],
                special = false,
                ch = "",
                i = 0,
                len = format.length,
                atEnd = [],
                obj;

            for (; i < len; ++i) {
                ch = format.charAt(i);
                if (!special && ch == "\\") {
                    special = true;
                } else if (special) {
                    special = false;
                    regex.push(MX.util.Format.escape(ch));
                } else {
                    obj = utilDate.formatCodeToRegex(ch, currentGroup);
                    currentGroup += obj.g;
                    regex.push(obj.s);
                    if (obj.g && obj.c) {
                        if (obj.calcAtEnd) {
                            atEnd.push(obj.c);
                        } else {
                            calc.push(obj.c);
                        }
                    }
                }
            }
            
            calc = calc.concat(atEnd);

            utilDate.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$", 'i');
            utilDate.parseFunctions[format] = Function.prototype.constructor.apply(Function.prototype, ["input", "strict", xf(code, regexNum, calc.join(''))]);
        };
    }()),

    // private
    parseCodes : {
        /*
         * Notes:
         * g = {Number} calculation group (0 or 1. only group 1 contributes to date calculations.)
         * c = {String} calculation method (required for group 1. null for group 0. {0} = currentGroup - position in regex result array)
         * s = {String} regex pattern. all matches are stored in results[], and are accessible by the calculation mapped to 'c'
         */
        d: {
            g:1,
            c:"d = parseInt(results[{0}], 10);\n",
            s:"(3[0-1]|[1-2][0-9]|0[1-9])" // day of month with leading zeroes (01 - 31)
        },
        j: {
            g:1,
            c:"d = parseInt(results[{0}], 10);\n",
            s:"(3[0-1]|[1-2][0-9]|[1-9])" // day of month without leading zeroes (1 - 31)
        },
        D: function() {
            for (var a = [], i = 0; i < 7; a.push(utilDate.getShortDayName(i)), ++i); // get localised short day names
            return {
                g:0,
                c:null,
                s:"(?:" + a.join("|") +")"
            };
        },
        l: function() {
            return {
                g:0,
                c:null,
                s:"(?:" + utilDate.dayNames.join("|") + ")"
            };
        },
        N: {
            g:0,
            c:null,
            s:"[1-7]" // ISO-8601 day number (1 (monday) - 7 (sunday))
        },
        //<locale type="object" property="parseCodes">
        S: {
            g:0,
            c:null,
            s:"(?:st|nd|rd|th)"
        },
        //</locale>
        w: {
            g:0,
            c:null,
            s:"[0-6]" // javascript day number (0 (sunday) - 6 (saturday))
        },
        z: {
            g:1,
            c:"z = parseInt(results[{0}], 10);\n",
            s:"(\\d{1,3})" // day of the year (0 - 364 (365 in leap years))
        },
        W: {
            g:0,
            c:null,
            s:"(?:\\d{2})" // ISO-8601 week number (with leading zero)
        },
        F: function() {
            return {
                g:1,
                c:"m = parseInt(MX.util.DateFormat.getMonthNumber(results[{0}]), 10);\n", // get localised month number
                s:"(" + utilDate.monthNames.join("|") + ")"
            };
        },
        M: function() {
            for (var a = [], i = 0; i < 12; a.push(utilDate.getShortMonthName(i)), ++i); // get localised short month names
            return MX.applyIf({
                s:"(" + a.join("|") + ")"
            }, utilDate.formatCodeToRegex("F"));
        },
        m: {
            g:1,
            c:"m = parseInt(results[{0}], 10) - 1;\n",
            s:"(1[0-2]|0[1-9])" // month number with leading zeros (01 - 12)
        },
        n: {
            g:1,
            c:"m = parseInt(results[{0}], 10) - 1;\n",
            s:"(1[0-2]|[1-9])" // month number without leading zeros (1 - 12)
        },
        t: {
            g:0,
            c:null,
            s:"(?:\\d{2})" // no. of days in the month (28 - 31)
        },
        L: {
            g:0,
            c:null,
            s:"(?:1|0)"
        },
        o: function() {
            return utilDate.formatCodeToRegex("Y");
        },
        Y: {
            g:1,
            c:"y = parseInt(results[{0}], 10);\n",
            s:"(\\d{4})" // 4-digit year
        },
        y: {
            g:1,
            c:"var ty = parseInt(results[{0}], 10);\n"
                + "y = ty > MX.util.DateFormat.y2kYear ? 1900 + ty : 2000 + ty;\n", // 2-digit year
            s:"(\\d{1,2})"
        },
        /*
         * In the am/pm parsing routines, we allow both upper and lower case
         * even though it doesn't exactly match the spec. It gives much more flexibility
         * in being able to specify case insensitive regexes.
         */
        //<locale type="object" property="parseCodes">
        a: {
            g:1,
            c:"if (/(am)/i.test(results[{0}])) {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
            s:"(am|pm|AM|PM)",
            calcAtEnd: true
        },
        //</locale>
        //<locale type="object" property="parseCodes">
        A: {
            g:1,
            c:"if (/(am)/i.test(results[{0}])) {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
            s:"(AM|PM|am|pm)",
            calcAtEnd: true
        },
        //</locale>
        g: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(1[0-2]|[0-9])" //  12-hr format of an hour without leading zeroes (1 - 12)
        },
        G: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(2[0-3]|1[0-9]|[0-9])" // 24-hr format of an hour without leading zeroes (0 - 23)
        },
        h: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(1[0-2]|0[1-9])" //  12-hr format of an hour with leading zeroes (01 - 12)
        },
        H: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(2[0-3]|[0-1][0-9])" //  24-hr format of an hour with leading zeroes (00 - 23)
        },
        i: {
            g:1,
            c:"i = parseInt(results[{0}], 10);\n",
            s:"([0-5][0-9])" // minutes with leading zeros (00 - 59)
        },
        s: {
            g:1,
            c:"s = parseInt(results[{0}], 10);\n",
            s:"([0-5][0-9])" // seconds with leading zeros (00 - 59)
        },
        u: {
            g:1,
            c:"ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
            s:"(\\d+)" // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
        },
        O: {
            g:1,
            c:[
                "o = results[{0}];",
                "var sn = o.substring(0,1),", // get + / - sign
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),", // get hours (performs minutes-to-hour conversion also, just in case)
                    "mn = o.substring(3,5) % 60;", // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + MX.util.Format.leftPad(hr, 2, '0') + MX.util.Format.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
            ].join("\n"),
            s: "([+-]\\d{4})" // GMT offset in hrs and mins
        },
        P: {
            g:1,
            c:[
                "o = results[{0}];",
                "var sn = o.substring(0,1),", // get + / - sign
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),", // get hours (performs minutes-to-hour conversion also, just in case)
                    "mn = o.substring(4,6) % 60;", // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + MX.util.Format.leftPad(hr, 2, '0') + MX.util.Format.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
            ].join("\n"),
            s: "([+-]\\d{2}:\\d{2})" // GMT offset in hrs and mins (with colon separator)
        },
        T: {
            g:0,
            c:null,
            s:"[A-Z]{1,4}" // timezone abbrev. may be between 1 - 4 chars
        },
        Z: {
            g:1,
            c:"zz = results[{0}] * 1;\n" // -43200 <= UTC offset <= 50400
                  + "zz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
            s:"([+-]?\\d{1,5})" // leading '+' sign is optional for UTC offset
        },
        c: function() {
            var calc = [],
                arr = [
                    utilDate.formatCodeToRegex("Y", 1), // year
                    utilDate.formatCodeToRegex("m", 2), // month
                    utilDate.formatCodeToRegex("d", 3), // day
                    utilDate.formatCodeToRegex("H", 4), // hour
                    utilDate.formatCodeToRegex("i", 5), // minute
                    utilDate.formatCodeToRegex("s", 6), // second
                    {c:"ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"}, // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
                    {c:[ // allow either "Z" (i.e. UTC) or "-0530" or "+08:00" (i.e. UTC offset) timezone delimiters. assumes local timezone if no timezone is specified
                        "if(results[8]) {", // timezone specified
                            "if(results[8] == 'Z'){",
                                "zz = 0;", // UTC
                            "}else if (results[8].indexOf(':') > -1){",
                                utilDate.formatCodeToRegex("P", 8).c, // timezone offset with colon separator
                            "}else{",
                                utilDate.formatCodeToRegex("O", 8).c, // timezone offset without colon separator
                            "}",
                        "}"
                    ].join('\n')}
                ],
                i,
                l;

            for (i = 0, l = arr.length; i < l; ++i) {
                calc.push(arr[i].c);
            }

            return {
                g:1,
                c:calc.join(""),
                s:[
                    arr[0].s, // year (required)
                    "(?:", "-", arr[1].s, // month (optional)
                        "(?:", "-", arr[2].s, // day (optional)
                            "(?:",
                                "(?:T| )?", // time delimiter -- either a "T" or a single blank space
                                arr[3].s, ":", arr[4].s,  // hour AND minute, delimited by a single colon (optional). MUST be preceded by either a "T" or a single blank space
                                "(?::", arr[5].s, ")?", // seconds (optional)
                                "(?:(?:\\.|,)(\\d+))?", // decimal fraction of a second (e.g. ",12345" or ".98765") (optional)
                                "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?", // "Z" (UTC) or "-0530" (UTC offset without colon delimiter) or "+08:00" (UTC offset with colon delimiter) (optional)
                            ")?",
                        ")?",
                    ")?"
                ].join("")
            };
        },
        U: {
            g:1,
            c:"u = parseInt(results[{0}], 10);\n",
            s:"(-?\\d+)" // leading minus sign indicates seconds before UNIX epoch
        }
    },

    //Old MX.util.DateFormat prototype methods.
    // private
    dateFormat: function(date, format) {
        return utilDate.format(date, format);
    },

    /**
     * Compares if two dates are equal by comparing their values.
     * @param {Date} date1
     * @param {Date} date2
     * @return {Boolean} True if the date values are equal
     */
    isEqual: function(date1, date2) {
        // check we have 2 date objects
        if (date1 && date2) {
            return (date1.getTime() === date2.getTime());
        }
        // one or both isn't a date, only equal if both are falsey
        return !(date1 || date2);
    },

    /**
     * Formats a date given the supplied format string.
     * @param {Date} date The date to format
     * @param {String} format The format string
     * @return {String} The formatted date or an empty string if date parameter is not a JavaScript Date object
     */
    format: function(date, format) {
        var formatFunctions = utilDate.formatFunctions;

        if (!MX.isDate(date)) {
            return '';
        }

        if (formatFunctions[format] == null) {
            utilDate.createFormat(format);
        }

        return formatFunctions[format].call(date) + '';
    },

    /**
     * Get the timezone abbreviation of the current date (equivalent to the format specifier 'T').
     *
     * Note: The date string returned by the javascript Date object's toString() method varies
     * between browsers (e.g. FF vs IE) and system region settings (e.g. IE in Asia vs IE in America).
     * For a given date string e.g. "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)",
     * getTimezone() first tries to get the timezone abbreviation from between a pair of parentheses
     * (which may or may not be present), failing which it proceeds to get the timezone abbreviation
     * from the GMT offset portion of the date string.
     * @param {Date} date The date
     * @return {String} The abbreviated timezone name (e.g. 'CST', 'PDT', 'EDT', 'MPST' ...).
     */
    getTimezone : function(date) {
        // the following list shows the differences between date strings from different browsers on a WinXP SP2 machine from an Asian locale:
        //
        // Opera  : "Thu, 25 Oct 2007 22:53:45 GMT+0800" -- shortest (weirdest) date string of the lot
        // Safari : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone (same as FF)
        // FF     : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone
        // IE     : "Thu Oct 25 22:54:35 UTC+0800 2007" -- (Asian system setting) look for 3-4 letter timezone abbrev
        // IE     : "Thu Oct 25 17:06:37 PDT 2007" -- (American system setting) look for 3-4 letter timezone abbrev
        //
        // this crazy regex attempts to guess the correct timezone abbreviation despite these differences.
        // step 1: (?:\((.*)\) -- find timezone in parentheses
        // step 2: ([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?) -- if nothing was found in step 1, find timezone from timezone offset portion of date string
        // step 3: remove all non uppercase characters found in step 1 and 2
        return date.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
    },

    /**
     * Get the offset from GMT of the current date (equivalent to the format specifier 'O').
     * @param {Date} date The date
     * @param {Boolean} colon (optional) true to separate the hours and minutes with a colon (defaults to false).
     * @return {String} The 4-character offset string prefixed with + or - (e.g. '-0600').
     */
    getGMTOffset : function(date, colon) {
        var offset = date.getTimezoneOffset();
        return (offset > 0 ? "-" : "+")
            + MX.util.Format.leftPad(Math.floor(Math.abs(offset) / 60), 2, "0")
            + (colon ? ":" : "")
            + MX.util.Format.leftPad(Math.abs(offset % 60), 2, "0");
    },

    /**
     * Get the numeric day number of the year, adjusted for leap year.
     * @param {Date} date The date
     * @return {Number} 0 to 364 (365 in leap years).
     */
    getDayOfYear: function(date) {
        var num = 0,
            d = MX.util.DateFormat.clone(date),
            m = date.getMonth(),
            i;

        for (i = 0, d.setDate(1), d.setMonth(0); i < m; d.setMonth(++i)) {
            num += utilDate.getDaysInMonth(d);
        }
        return num + date.getDate() - 1;
    },

    /**
     * Get the numeric ISO-8601 week number of the year.
     * (equivalent to the format specifier 'W', but without a leading zero).
     * @param {Date} date The date
     * @return {Number} 1 to 53
     * @method
     */
    getWeekOfYear : (function() {
        // adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
        var ms1d = 864e5, // milliseconds in a day
            ms7d = 7 * ms1d; // milliseconds in a week

        return function(date) { // return a closure so constants get calculated only once
            var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d, // an Absolute Day Number
                AWN = Math.floor(DC3 / 7), // an Absolute Week Number
                Wyr = new Date(AWN * ms7d).getUTCFullYear();

            return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
        };
    }()),

    /**
     * Checks if the current date falls within a leap year.
     * @param {Date} date The date
     * @return {Boolean} True if the current date falls within a leap year, false otherwise.
     */
    isLeapYear : function(date) {
        var year = date.getFullYear();
        return !!((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
    },

    /**
     * Get the first day of the current month, adjusted for leap year.  The returned value
     * is the numeric day index within the week (0-6) which can be used in conjunction with
     * the {@link #monthNames} array to retrieve the textual day name.
     * Example:
     * <pre><code>
var dt = new Date('1/10/2007'),
    firstDay = MX.util.DateFormat.getFirstDayOfMonth(dt);
console.log(MX.util.DateFormat.dayNames[firstDay]); //output: 'Monday'
     * </code></pre>
     * @param {Date} date The date
     * @return {Number} The day number (0-6).
     */
    getFirstDayOfMonth : function(date) {
        var day = (date.getDay() - (date.getDate() - 1)) % 7;
        return (day < 0) ? (day + 7) : day;
    },

    /**
     * Get the last day of the current month, adjusted for leap year.  The returned value
     * is the numeric day index within the week (0-6) which can be used in conjunction with
     * the {@link #monthNames} array to retrieve the textual day name.
     * Example:
     * <pre><code>
var dt = new Date('1/10/2007'),
    lastDay = MX.util.DateFormat.getLastDayOfMonth(dt);
console.log(MX.util.DateFormat.dayNames[lastDay]); //output: 'Wednesday'
     * </code></pre>
     * @param {Date} date The date
     * @return {Number} The day number (0-6).
     */
    getLastDayOfMonth : function(date) {
        return utilDate.getLastDateOfMonth(date).getDay();
    },


    /**
     * Get the date of the first day of the month in which this date resides.
     * @param {Date} date The date
     * @return {Date}
     */
    getFirstDateOfMonth : function(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    },

    /**
     * Get the date of the last day of the month in which this date resides.
     * @param {Date} date The date
     * @return {Date}
     */
    getLastDateOfMonth : function(date) {
        return new Date(date.getFullYear(), date.getMonth(), utilDate.getDaysInMonth(date));
    },

    /**
     * Get the number of days in the current month, adjusted for leap year.
     * @param {Date} date The date
     * @return {Number} The number of days in the month.
     * @method
     */
    getDaysInMonth: (function() {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return function(date) { // return a closure for efficiency
            var m = date.getMonth();

            return m == 1 && utilDate.isLeapYear(date) ? 29 : daysInMonth[m];
        };
    }()),

    //<locale type="function">
    /**
     * Get the English ordinal suffix of the current day (equivalent to the format specifier 'S').
     * @param {Date} date The date
     * @return {String} 'st, 'nd', 'rd' or 'th'.
     */
    getSuffix : function(date) {
        switch (date.getDate()) {
            case 1:
            case 21:
            case 31:
                return "st";
            case 2:
            case 22:
                return "nd";
            case 3:
            case 23:
                return "rd";
            default:
                return "th";
        }
    },
    //</locale>

    /**
     * Creates and returns a new Date instance with the exact same date value as the called instance.
     * Dates are copied and passed by reference, so if a copied date variable is modified later, the original
     * variable will also be changed.  When the intention is to create a new variable that will not
     * modify the original instance, you should create a clone.
     *
     * Example of correctly cloning a date:
     * <pre><code>
//wrong way:
var orig = new Date('10/1/2006');
var copy = orig;
copy.setDate(5);
console.log(orig);  //returns 'Thu Oct 05 2006'!

//correct way:
var orig = new Date('10/1/2006'),
    copy = MX.util.DateFormat.clone(orig);
copy.setDate(5);
console.log(orig);  //returns 'Thu Oct 01 2006'
     * </code></pre>
     * @param {Date} date The date
     * @return {Date} The new Date instance.
     */
    clone : function(date) {
        return new Date(date.getTime());
    },

    /**
     * Checks if the current date is affected by Daylight Saving Time (DST).
     * @param {Date} date The date
     * @return {Boolean} True if the current date is affected by DST.
     */
    isDST : function(date) {
        // adapted from http://sencha.com/forum/showthread.php?p=247172#post247172
        // courtesy of @geoffrey.mcgill
        return new Date(date.getFullYear(), 0, 1).getTimezoneOffset() != date.getTimezoneOffset();
    },

    /**
     * Attempts to clear all time information from this Date by setting the time to midnight of the same day,
     * automatically adjusting for Daylight Saving Time (DST) where applicable.
     * (note: DST timezone information for the browser's host operating system is assumed to be up-to-date)
     * @param {Date} date The date
     * @param {Boolean} clone true to create a clone of this date, clear the time and return it (defaults to false).
     * @return {Date} this or the clone.
     */
    clearTime : function(date, clone) {
        if (clone) {
            return MX.util.DateFormat.clearTime(MX.util.DateFormat.clone(date));
        }

        // get current date before clearing time
        var d = date.getDate(),
            hr,
            c;

        // clear time
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        if (date.getDate() != d) { // account for DST (i.e. day of month changed when setting hour = 0)
            // note: DST adjustments are assumed to occur in multiples of 1 hour (this is almost always the case)
            // refer to http://www.timeanddate.com/time/aboutdst.html for the (rare) exceptions to this rule

            // increment hour until cloned date == current date
            for (hr = 1, c = utilDate.add(date, MX.util.DateFormat.HOUR, hr); c.getDate() != d; hr++, c = utilDate.add(date, MX.util.DateFormat.HOUR, hr));

            date.setDate(d);
            date.setHours(c.getHours());
        }

        return date;
    },

    /**
     * Provides a convenient method for performing basic date arithmetic. This method
     * does not modify the Date instance being called - it creates and returns
     * a new Date instance containing the resulting date value.
     *
     * Examples:
     * <pre><code>
// Basic usage:
var dt = MX.util.DateFormat.add(new Date('10/29/2006'), MX.util.DateFormat.DAY, 5);
console.log(dt); //returns 'Fri Nov 03 2006 00:00:00'

// Negative values will be subtracted:
var dt2 = MX.util.DateFormat.add(new Date('10/1/2006'), MX.util.DateFormat.DAY, -5);
console.log(dt2); //returns 'Tue Sep 26 2006 00:00:00'

     * </code></pre>
     *
     * @param {Date} date The date to modify
     * @param {String} interval A valid date interval enum value.
     * @param {Number} value The amount to add to the current date.
     * @return {Date} The new Date instance.
     */
    add : function(date, interval, value) {
        var d = MX.util.DateFormat.clone(date),
            Date = MX.util.DateFormat,
            day;
        if (!interval || value === 0) {
            return d;
        }

        switch(interval.toLowerCase()) {
            case MX.util.DateFormat.MILLI:
                d.setMilliseconds(d.getMilliseconds() + value);
                break;
            case MX.util.DateFormat.SECOND:
                d.setSeconds(d.getSeconds() + value);
                break;
            case MX.util.DateFormat.MINUTE:
                d.setMinutes(d.getMinutes() + value);
                break;
            case MX.util.DateFormat.HOUR:
                d.setHours(d.getHours() + value);
                break;
            case MX.util.DateFormat.DAY:
                d.setDate(d.getDate() + value);
                break;
            case MX.util.DateFormat.MONTH:
                day = date.getDate();
                if (day > 28) {
                    day = Math.min(day, MX.util.DateFormat.getLastDateOfMonth(MX.util.DateFormat.add(MX.util.DateFormat.getFirstDateOfMonth(date), MX.util.DateFormat.MONTH, value)).getDate());
                }
                d.setDate(day);
                d.setMonth(date.getMonth() + value);
                break;
            case MX.util.DateFormat.YEAR:
                day = date.getDate();
                if (day > 28) {
                    day = Math.min(day, MX.util.DateFormat.getLastDateOfMonth(MX.util.DateFormat.add(MX.util.DateFormat.getFirstDateOfMonth(date), MX.util.DateFormat.YEAR, value)).getDate());
                }
                d.setDate(day);
                d.setFullYear(date.getFullYear() + value);
                break;
        }
        return d;
    },

    /**
     * Checks if a date falls on or between the given start and end dates.
     * @param {Date} date The date to check
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Boolean} true if this date falls on or between the given start and end dates.
     */
    between : function(date, start, end) {
        var t = date.getTime();
        return start.getTime() <= t && t <= end.getTime();
    },

    //Maintains compatibility with old static and prototype window.Date methods.
    compat: function() {
        var nativeDate = window.Date,
            p, u,
            statics = ['useStrict', 'formatCodeToRegex', 'parseFunctions', 'parseRegexes', 'formatFunctions', 'y2kYear', 'MILLI', 'SECOND', 'MINUTE', 'HOUR', 'DAY', 'MONTH', 'YEAR', 'defaults', 'dayNames', 'monthNames', 'monthNumbers', 'getShortMonthName', 'getShortDayName', 'getMonthNumber', 'formatCodes', 'isValid', 'parseDate', 'getFormatCode', 'createFormat', 'createParser', 'parseCodes'],
            proto = ['dateFormat', 'format', 'getTimezone', 'getGMTOffset', 'getDayOfYear', 'getWeekOfYear', 'isLeapYear', 'getFirstDayOfMonth', 'getLastDayOfMonth', 'getDaysInMonth', 'getSuffix', 'clone', 'isDST', 'clearTime', 'add', 'between'],
            sLen    = statics.length,
            pLen    = proto.length,
            stat, prot, s;

        //Append statics
        for (s = 0; s < sLen; s++) {
            stat = statics[s];
            nativeDate[stat] = utilDate[stat];
        }

        //Append to prototype
        for (p = 0; p < pLen; p++) {
            prot = proto[p];
            nativeDate.prototype[prot] = function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(this);
                return utilDate[prot].apply(utilDate, args);
            };
        }
    }
};

var utilDate = MX.util.DateFormat;

MX.reg('dateformat', MX.util.DateFormat);

});
/**
 * @class MX.util.Collection
 * @alias collection
 * 
 * Collection类来自Ext3.4.0的源码
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    var escapeRe = function(s) {
        return s.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
    };
    
    X.util.Collection = Klass.define({
        // private
        alias: 'collection',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Boolean} allowFunctions Specify <tt>true</tt> if the {@link #addAll}
         * function should add function references to the collection. Defaults to
         * <tt>false</tt>.
         */
        allowFunctions: false,
        
        /**
         * @cfg {Function} getKey A function that can accept an item of the type(s) stored in this Collection
         * and return the key value for that item.  This is used when available to look up the key on items that
         * were passed without an explicit key parameter to a Collection method.  Passing this parameter is
         * equivalent to providing an implementation for the {@link #getKey} method.
         */
        
        // private
        init: function() {
            this.items = [];
            this.map = {};
            this.keys = [];
            this.length = 0;
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event clear
                 * Fires when the collection is cleared.
                 */
                'clear',
                /**
                 * @event add
                 * Fires when an item is added to the collection.
                 * @param {Number} index The index at which the item was added.
                 * @param {Object} o The item added.
                 * @param {String} key The key associated with the added item.
                 */
                'add',
                /**
                 * @event replace
                 * Fires when an item is replaced in the collection.
                 * @param {String} key he key associated with the new added.
                 * @param {Object} old The item being replaced.
                 * @param {Object} new The new item.
                 */
                'replace',
                /**
                 * @event remove
                 * Fires when an item is removed from the collection.
                 * @param {Object} o The item being removed.
                 * @param {String} key (optional) The key associated with the removed item.
                 */
                'remove',
                'sort'
            );
        },
        
        /**
         * Adds an item to the collection. Fires the {@link #add} event when complete.
         * @param {String} key <p>The key to associate with the item, or the new item.</p>
         * <p>If a {@link #getKey} implementation was specified for this Collection,
         * or if the key of the stored items is in a property called <tt><b>id</b></tt>,
         * the Collection will be able to <i>derive</i> the key for the new item.
         * In this case just pass the new item in this parameter.</p>
         * @param {Object} o The item to add.
         * @return {Object} The item added.
         */
        add: function(key, o) {
            if (arguments.length == 1) {
                o = arguments[0];
                key = this.getKey(o);
            }
            if (typeof key != 'undefined' && key !== null) {
                var old = this.map[key];
                if (typeof old != 'undefined') {
                    return this.replace(key, o);
                }
                this.map[key] = o;
            }
            this.length++;
            this.items.push(o);
            this.keys.push(key);
            this.fireEvent('add', this.length - 1, o, key);
            return o;
        },
    
        /**
         * Collection has a generic way to fetch keys if you implement getKey.  The default implementation
         * simply returns <b><code>item.id</code></b> but you can provide your own implementation
         * to return a different value as in the following examples:<pre><code>
         *     // normal way
         *     var mc = new MX.util.Collection();
         *     mc.add(someEl.dom.id, someEl);
         *     mc.add(otherEl.dom.id, otherEl);
         *     //and so on
         *     
         *     // using getKey
         *     var mc = new MX.util.Collection();
         *     mc.getKey = function(el){
         *        return el.dom.id;
         *     };
         *     mc.add(someEl);
         *     mc.add(otherEl);
         *     
         *     // or via the constructor
         *     var mc = new MX.util.Collection(false, function(el){
         *        return el.dom.id;
         *     });
         *     mc.add(someEl);
         *     mc.add(otherEl);
         * </code></pre>
         * @param {Object} item The item for which to find the key.
         * @return {Object} The key for the passed item.
         */
        getKey : function(o){
             return o.id;
        },
    
        /**
         * Replaces an item in the collection. Fires the {@link #replace} event when complete.
         * @param {String} key <p>The key associated with the item to replace, or the replacement item.</p>
         * <p>If you supplied a {@link #getKey} implementation for this Collection, or if the key
         * of your stored items is in a property called <tt><b>id</b></tt>, then the Collection
         * will be able to <i>derive</i> the key of the replacement item. If you want to replace an item
         * with one having the same key value, then just pass the replacement item in this parameter.</p>
         * @param o {Object} o (optional) If the first parameter passed was a key, the item to associate
         * with that key.
         * @return {Object}  The new item.
         */
        replace: function(key, o) {
            if (arguments.length == 1) {
                o = arguments[0];
                key = this.getKey(o);
            }
            var old = this.map[key];
            if (typeof key == 'undefined' || key === null || typeof old == 'undefined') {
                return this.add(key, o);
            }
            var index = this.indexOfKey(key);
            this.items[index] = o;
            this.map[key] = o;
            this.fireEvent('replace', key, old, o);
            return o;
        },
    
        /**
         * Adds all elements of an Array or an Object to the collection.
         * @param {Object/Array} objs An Object containing properties which will be added
         * to the collection, or an Array of values, each of which are added to the collection.
         * Functions references will be added to the collection if <code>{@link #allowFunctions}</code>
         * has been set to <tt>true</tt>.
         */
        addAll: function(objs) {
            if (arguments.length > 1 || X.isArray(objs)) {
                var args = arguments.length > 1 ? arguments : objs;
                for (var i = 0, len = args.length; i < len; i++) {
                    this.add(args[i]);
                }
            } else {
                for (var key in objs) {
                    if (this.allowFunctions || typeof objs[key] != 'function') {
                        this.add(key, objs[key]);
                    }
                }
            }
        },
    
        /**
         * Executes the specified function once for every item in the collection, passing the following arguments:
         * <div class="mdetail-params"><ul>
         * <li><b>item</b> : Mixed<p class="sub-desc">The collection item</p></li>
         * <li><b>index</b> : Number<p class="sub-desc">The item's index</p></li>
         * <li><b>length</b> : Number<p class="sub-desc">The total number of items in the collection</p></li>
         * </ul></div>
         * The function should return a boolean value. Returning false from the function will stop the iteration.
         * @param {Function} fn The function to execute for each item.
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current item in the iteration.
         */
        each: function(fn, scope) {
            var items = [].concat(this.items); // each safe for removal
            for (var i = 0, len = items.length; i < len; i++) {
                if (fn.call(scope || items[i], items[i], i, len) === false) {
                    break;
                }
            }
        },
    
        /**
         * Executes the specified function once for every key in the collection, passing each
         * key, and its associated item as the first two parameters.
         * @param {Function} fn The function to execute for each item.
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the browser window.
         */
        eachKey: function(fn, scope) {
            for (var i = 0, len = this.keys.length; i < len; i++) {
                fn.call(scope || window, this.keys[i], this.items[i], i, len);
            }
        },
    
        /**
         * Returns the first item in the collection which elicits a true return value from the
         * passed selection function.
         * @param {Function} fn The selection function to execute for each item.
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the browser window.
         * @return {Object} The first item in the collection which returned true from the selection function.
         */
        find: function(fn, scope) {
            for (var i = 0, len = this.items.length; i < len; i++) {
                if (fn.call(scope || window, this.items[i], this.keys[i])) {
                    return this.items[i];
                }
            }
            return null;
        },
    
        /**
         * Inserts an item at the specified index in the collection. Fires the {@link #add} event when complete.
         * @param {Number} index The index to insert the item at.
         * @param {String} key The key to associate with the new item, or the item itself.
         * @param {Object} o (optional) If the second parameter was a key, the new item.
         * @return {Object} The item inserted.
         */
        insert: function(index, key, o) {
            if (arguments.length == 2) {
                o = arguments[1];
                key = this.getKey(o);
            }
            if (this.containsKey(key)) {
                this.suspendEvents();
                this.removeKey(key);
                this.resumeEvents();
            }
            if (index >= this.length) {
                return this.add(key, o);
            }
            this.length++;
            this.items.splice(index, 0, o);
            if (typeof key != 'undefined' && key !== null) {
                this.map[key] = o;
            }
            this.keys.splice(index, 0, key);
            this.fireEvent('add', index, o, key);
            return o;
        },
    
        /**
         * Remove an item from the collection.
         * @param {Object} o The item to remove.
         * @return {Object} The item removed or false if no item was removed.
         */
        remove: function(o) {
            return this.removeAt(this.indexOf(o));
        },
    
        /**
         * Remove an item from a specified index in the collection. Fires the {@link #remove} event when complete.
         * @param {Number} index The index within the collection of the item to remove.
         * @return {Object} The item removed or false if no item was removed.
         */
        removeAt: function(index) {
            if (index < this.length && index >= 0) {
                this.length--;
                var o = this.items[index];
                this.items.splice(index, 1);
                var key = this.keys[index];
                if (typeof key != 'undefined') {
                    delete this.map[key];
                }
                this.keys.splice(index, 1);
                this.fireEvent('remove', o, key);
                return o;
            }
            return false;
        },
    
        /**
         * Removed an item associated with the passed key fom the collection.
         * @param {String} key The key of the item to remove.
         * @return {Object} The item removed or false if no item was removed.
         */
        removeKey: function(key) {
            return this.removeAt(this.indexOfKey(key));
        },
    
        /**
         * Returns the number of items in the collection.
         * @return {Number} the number of items in the collection.
         */
        getCount: function() {
            return this.length;
        },
    
        /**
         * Returns index within the collection of the passed Object.
         * @param {Object} o The item to find the index of.
         * @return {Number} index of the item. Returns -1 if not found.
         */
        indexOf: function(o) {
            return this.items.indexOf(o);
        },
    
        /**
         * Returns index within the collection of the passed key.
         * @param {String} key The key to find the index of.
         * @return {Number} index of the key.
         */
        indexOfKey: function(key) {
            return this.keys.indexOf(key);
        },
    
        /**
         * Returns the item associated with the passed key OR index.
         * Key has priority over index.  This is the equivalent
         * of calling {@link #key} first, then if nothing matched calling {@link #itemAt}.
         * @param {String/Number} key The key or index of the item.
         * @return {Object} If the item is found, returns the item.  If the item was not found, returns <tt>undefined</tt>.
         * If an item was found, but is a Class, returns <tt>null</tt>.
         */
        item: function(key) {
            var mk = this.map[key], item = mk !== undefined ? mk : (typeof key == 'number') ? this.items[key] : undefined;
            return typeof item != 'function' || this.allowFunctions ? item : null; // for prototype!
        },
    
        /**
         * Returns the item at the specified index.
         * @param {Number} index The index of the item.
         * @return {Object} The item at the specified index.
         */
        itemAt: function(index) {
            return this.items[index];
        },
    
        /**
         * Returns the item associated with the passed key.
         * @param {String/Number} key The key of the item.
         * @return {Object} The item associated with the passed key.
         */
        key: function(key) {
            return this.map[key];
        },
    
        /**
         * Returns true if the collection contains the passed Object as an item.
         * @param {Object} o  The Object to look for in the collection.
         * @return {Boolean} True if the collection contains the Object as an item.
         */
        contains: function(o) {
            return this.indexOf(o) != -1;
        },
    
        /**
         * Returns true if the collection contains the passed Object as a key.
         * @param {String} key The key to look for in the collection.
         * @return {Boolean} True if the collection contains the Object as a key.
         */
        containsKey: function(key) {
            return typeof this.map[key] != 'undefined';
        },
    
        /**
         * Removes all items from the collection.  Fires the {@link #clear} event when complete.
         */
        clear: function() {
            this.length = 0;
            this.items = [];
            this.keys = [];
            this.map = {};
            this.fireEvent('clear');
        },
    
        /**
         * Returns the first item in the collection.
         * @return {Object} the first item in the collection..
         */
        first: function() {
            return this.items[0];
        },
    
        /**
         * Returns the last item in the collection.
         * @return {Object} the last item in the collection..
         */
        last: function() {
            return this.items[this.length - 1];
        },
    
        /**
         * @private
         * Performs the actual sorting based on a direction and a sorting function. Internally,
         * this creates a temporary array of all items in the Collection, sorts it and then writes
         * the sorted array data back into this.items and this.keys
         * @param {String} property Property to sort by ('key', 'value', or 'index')
         * @param {String} dir (optional) Direction to sort 'ASC' or 'DESC'. Defaults to 'ASC'.
         * @param {Function} fn (optional) Comparison function that defines the sort order.
         * Defaults to sorting by numeric value.
         */
        _sort: function(property, dir, fn) {
            var i, len, dsc = String(dir).toUpperCase() == 'DESC' ? -1 : 1,

            //this is a temporary array used to apply the sorting function
            c = [], keys = this.keys, items = this.items;

            //default to a simple sorter function if one is not provided
            fn = fn || function(a, b) {
                return a - b;
            };

            //copy all the items into a temporary array, which we will sort
            for (i = 0, len = items.length; i < len; i++) {
                c[c.length] = {
                    key: keys[i],
                    value: items[i],
                    index: i
                };
            }

            //sort the temporary array
            c.sort(function(a, b) {
                var v = fn(a[property], b[property]) * dsc;
                if (v === 0) {
                    v = (a.index < b.index ? -1 : 1);
                }
                return v;
            });

            //copy the temporary array back into the main this.items and this.keys objects
            for (i = 0, len = c.length; i < len; i++) {
                items[i] = c[i].value;
                keys[i] = c[i].key;
            }

            this.fireEvent('sort', this);
        },
    
        /**
         * Sorts this collection by <b>item</b> value with the passed comparison function.
         * @param {String} direction (optional) 'ASC' or 'DESC'. Defaults to 'ASC'.
         * @param {Function} fn (optional) Comparison function that defines the sort order.
         * Defaults to sorting by numeric value.
         */
        sort: function(dir, fn) {
            this._sort('value', dir, fn);
        },
    
        /**
         * Reorders each of the items based on a mapping from old index to new index. Internally this
         * just translates into a sort. The 'sort' event is fired whenever reordering has occured.
         * @param {Object} mapping Mapping from old item index to new item index
         */
        reorder: function(mapping) {
            this.suspendEvents();

            var items = this.items, index = 0, length = items.length, order = [], remaining = [], oldIndex;

            //object of {oldPosition: newPosition} reversed to {newPosition: oldPosition}
            for (oldIndex in mapping) {
                order[mapping[oldIndex]] = items[oldIndex];
            }

            for (index = 0; index < length; index++) {
                if (mapping[index] == undefined) {
                    remaining.push(items[index]);
                }
            }

            for (index = 0; index < length; index++) {
                if (order[index] == undefined) {
                    order[index] = remaining.shift();
                }
            }

            this.clear();
            this.addAll(order);

            this.resumeEvents();
            this.fireEvent('sort', this);
        },
    
        /**
         * Sorts this collection by <b>key</b>s.
         * @param {String} direction (optional) 'ASC' or 'DESC'. Defaults to 'ASC'.
         * @param {Function} fn (optional) Comparison function that defines the sort order.
         * Defaults to sorting by case insensitive string.
         */
        keySort: function(dir, fn) {
            this._sort('key', dir, fn || function(a, b) {
                var v1 = String(a).toUpperCase(), v2 = String(b).toUpperCase();
                return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
            });
        },
    
        /**
         * Returns a range of items in this collection
         * @param {Number} startIndex (optional) The starting index. Defaults to 0.
         * @param {Number} endIndex (optional) The ending index. Defaults to the last item.
         * @return {Array} An array of items
         */
        getRange: function(start, end) {
            var items = this.items;
            if (items.length < 1) {
                return [];
            }
            start = start || 0;
            end = Math.min(typeof end == 'undefined' ? this.length - 1 : end, this.length - 1);
            var i, r = [];
            if (start <= end) {
                for (i = start; i <= end; i++) {
                    r[r.length] = items[i];
                }
            } else {
                for (i = start; i >= end; i--) {
                    r[r.length] = items[i];
                }
            }
            return r;
        },
    
        /**
         * Filter the <i>objects</i> in this collection by a specific property.
         * Returns a new collection that has been filtered.
         * @param {String} property A property on your objects
         * @param {String/RegExp} value Either string that the property values
         * should start with or a RegExp to test against the property
         * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning
         * @param {Boolean} caseSensitive (optional) True for case sensitive comparison (defaults to False).
         * @return {Collection} The new filtered collection
         */
        filter: function(property, value, anyMatch, caseSensitive) {
            if (X.isEmpty(value, false)) {
                return this.clone();
            }
            value = this.createValueMatcher(value, anyMatch, caseSensitive);
            return this.filterBy(function(o) {
                return o && value.test(o[property]);
            });
        },
    
        /**
         * Filter by a function. Returns a <i>new</i> collection that has been filtered.
         * The passed function will be called with each object in the collection.
         * If the function returns true, the value is included otherwise it is filtered.
         * @param {Function} fn The function to be called, it will receive the args o (the object), k (the key)
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this Collection.
         * @return {Collection} The new filtered collection
         */
        filterBy: function(fn, scope) {
            var r = new X.util.Collection();
            r.getKey = this.getKey;
            var k = this.keys, it = this.items;
            for (var i = 0, len = it.length; i < len; i++) {
                if (fn.call(scope || this, it[i], k[i])) {
                    r.add(k[i], it[i]);
                }
            }
            return r;
        },
    
        /**
         * Finds the index of the first matching object in this collection by a specific property/value.
         * @param {String} property The name of a property on your objects.
         * @param {String/RegExp} value A string that the property values
         * should start with or a RegExp to test against the property.
         * @param {Number} start (optional) The index to start searching at (defaults to 0).
         * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning.
         * @param {Boolean} caseSensitive (optional) True for case sensitive comparison.
         * @return {Number} The matched index or -1
         */
        findIndex: function(property, value, start, anyMatch, caseSensitive) {
            if (X.isEmpty(value, false)) {
                return -1;
            }
            value = this.createValueMatcher(value, anyMatch, caseSensitive);
            return this.findIndexBy(function(o) {
                return o && value.test(o[property]);
            }, null, start);
        },
    
        /**
         * Find the index of the first matching object in this collection by a function.
         * If the function returns <i>true</i> it is considered a match.
         * @param {Function} fn The function to be called, it will receive the args o (the object), k (the key).
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this Collection.
         * @param {Number} start (optional) The index to start searching at (defaults to 0).
         * @return {Number} The matched index or -1
         */
        findIndexBy: function(fn, scope, start) {
            var k = this.keys, it = this.items;
            for (var i = (start || 0), len = it.length; i < len; i++) {
                if (fn.call(scope || this, it[i], k[i])) {
                    return i;
                }
            }
            return -1;
        },
    
        /**
         * Returns a regular expression based on the given value and matching options. This is used internally for finding and filtering,
         * and by Ext.data.Store#filter
         * @private
         * @param {String} value The value to create the regex for. This is escaped using escapeRe
         * @param {Boolean} anyMatch True to allow any match - no regex start/end line anchors will be added. Defaults to false
         * @param {Boolean} caseSensitive True to make the regex case sensitive (adds 'i' switch to regex). Defaults to false.
         * @param {Boolean} exactMatch True to force exact match (^ and $ characters added to the regex). Defaults to false. Ignored if anyMatch is true.
         */
        createValueMatcher: function(value, anyMatch, caseSensitive, exactMatch) {
            if (!value.exec) { // not a regex
                value = String(value);

                if (anyMatch === true) {
                    value = escapeRe(value);
                } else {
                    value = '^' + escapeRe(value);
                    if (exactMatch === true) {
                        value += '$';
                    }
                }
                value = new RegExp(value, caseSensitive ? '' : 'i');
            }
            return value;
        },
    
        /**
         * Creates a shallow copy of this collection
         * @return {Collection}
         */
        clone: function() {
            var r = new X.util.Collection();
            var k = this.keys, it = this.items;
            for (var i = 0, len = it.length; i < len; i++) {
                r.add(k[i], it[i]);
            }
            r.getKey = this.getKey;
            return r;
        }
    });
});