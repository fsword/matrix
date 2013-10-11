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
    }
    
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
                var listener, eName;
                scope = eventName.scope;
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