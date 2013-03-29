/**
 * @class MX
 */

window.MX = {
    /**
     * The version of the framework
     */
    version: '0.1.1'
};

(function(X) {
    "use strict";
    
    var slice = Array.prototype.slice,
        toString = Object.prototype.toString,
        $ = window.jQuery,
        artTemplate = window.template,
        iScroll = window.iScroll,
        ua = window.navigator.userAgent,
        webkit = ua.match(/WebKit\/([\d.]+)/),
        android = ua.match(/(Android)[\/\s+]([\d.]+)/),
        ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
        iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
        webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
        touchpad = webos && ua.match(/TouchPad/),
        kindle = ua.match(/Kindle\/([\d.]+)/),
        blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
        os;
    
    /**
     * 声明命名空间
     */
    X.namespace = function() {
        var len1 = arguments.length,
            i = 0,
            len2,
            j,
            main,
            ns,
            sub,
            current;
        
        for(; i < len1; ++i) {
            main = arguments[i];
            ns = arguments[i].split('.');
            current = window[ns[0]];
            if (current === undefined) {
                current = window[ns[0]] = {};
            }
            sub = ns.slice(1);
            len2 = sub.length;
            for(j = 0; j < len2; ++j) {
                current = current[sub[j]] = current[sub[j]] || {};
            }
        }
        return current;
    };
    
    // 命名空间函数的简写
    X.ns = X.namespace;
    X.ns('MX.lib', 'MX.klass', 'MX.app', 'MX.lib', 'MX.util');
    
    $.extend(X.lib, {
        jQuery: $,
        artTemplate: artTemplate,
        iScroll: iScroll
    });
    if (artTemplate) {
        artTemplate.openTag = '<#';
        artTemplate.closeTag = '#>';
    }
    
    $.extend(X, {
        /**
         * A reusable empty function
         */
        emptyFn: $.noop,

        /**
         * Returns true if the passed value is defined.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isDefined: function(value) {
            return typeof value !== 'undefined';
        },

        /**
         * Returns true if the passed value is a JavaScript 'primitive', a string, number or boolean.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isPrimitive: function(value) {
            var type = typeof value;

            return type === 'string' || type === 'number' || type === 'boolean';
        },
        
        /**
         * Returns true if the passed value is empty, false otherwise. The value is deemed to be empty if it is either:
         *
         * - `null`
         * - `undefined`
         * - a zero-length array
         * - a zero-length string (Unless the `allowEmptyString` parameter is set to `true`)
         *
         * @param {Object} value The value to test
         * @param {Boolean} allowEmptyString (optional) true to allow empty strings (defaults to false)
         * @return {Boolean}
         */
        isEmpty: function(value, allowEmptyString) {
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (X.isArray(value) && value.length === 0);
        },

        /**
         * Returns true if the passed value is a JavaScript Array, false otherwise.
         *
         * @param {Object} target The target to test
         * @return {Boolean}
         */
        isArray: $.isArray,

        /**
         * Returns true if the passed value is a JavaScript Date object, false otherwise.
         * @param {Object} object The object to test
         * @return {Boolean}
         */
        isDate: function(value) {
            return $.type(value) === 'date';
        },

        /**
         * Returns true if the passed value is a JavaScript Object, false otherwise.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isObject: $.isPlainObject,

        /**
         * Returns true if the passed value is a JavaScript Function, false otherwise.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isFunction: $.isFunction,

        /**
         * Returns true if the passed value is a number. Returns false for non-finite numbers.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isNumber: function(value) {
            return $.type(value) === 'number';
        },

        /**
         * Validates that a value is numeric.
         * @param {Object} value Examples: 1, '1', '2.34'
         * @return {Boolean} True if numeric, false otherwise
         */
        isNumeric: $.isNumeric,

        /**
         * Returns true if the passed value is a string.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isString: function(value) {
            return $.type(value) === 'string';
        },

        /**
         * Returns true if the passed value is a boolean.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isBoolean: function(value) {
            return $.type(value) === 'boolean';
        },

        /**
         * Returns true if the passed value is an HTMLElement
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isElement: function(value) {
            return value ? value.nodeType === 1 : false;
        },

        /**
         * Returns true if the passed value is a TextNode
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isTextNode: function(value) {
            return value ? value.nodeName === "#text" : false;
        }
    });
    
    os = {};
    if (android) {
        os.android = true;
        os.version = android[2];
    }
    if (iphone) {
        os.ios = os.iphone = true;
        os.version = iphone[2].replace(/_/g, '.');
    }
    if (ipad) {
        os.ios = os.ipad = true;
        os.version = ipad[2].replace(/_/g, '.');
    }
    if (webos) {
        os.webos = true;
        os.version = webos[2];
    }
    if (touchpad) {
        os.touchpad = true;
    }
    if (blackberry) {
        os.blackberry = true;
        os.version = blackberry[2];
    }
    if (kindle) {
        os.kindle = true;
        os.version = kindle[1];
    }
    
    $.extend(X, {
        /**
         * 操作系统信息
         */
        os: os,
        
        /**
         * 将config包含的属性，合并到object对象，如果object已存在相同的属性名，则忽略合并
         * @param {Object} object
         * @param {Object} config
         */
        applyIf: function(object, config) {
            var property;

            if (object) {
                for (property in config) {
                    if (object[property] === undefined) {
                        object[property] = config[property];
                    }
                }
            }

            return object;
        },
        
        /**
         * 将对象转换成数组
         */
        toArray: function(obj) {
            if (!obj) {
                return [];
            } else if (X.isArray(obj)) {
                return slice.call(obj);
            } else if (toString.call(obj) == '[object Arguments]') {
                return slice.call(obj);
            } else {
                return slice.call(arguments, 0);
            }
        },
        
        /**
         * 遍历一个$.each的封装类，允许指定回调函数的作用域
         * 
         * @param {Element/Array} obj 遍历的对象或数组
         * @param {Function} fn 遍历对象的回调函数
         * @param {Object} scope 回调函数作用域
         */
        each: function(obj, fn, scope) {
            if (!obj || !fn) {
                return;
            }
            if (X.isDefined(scope)) {
                $.each(obj, $.proxy(fn, scope));
            } else {
                $.each(obj, fn);
            }
        },
        
        /**
         * Calls this function after the number of millseconds specified, optionally in a specific scope. Example usage:
         * <pre><code>
         *  var sayHi = function(name){
         *      alert('Hi, ' + name);
         *  }
         *  
         *  // executes immediately:
         *  sayHi('max');
         *  
         *  // executes after 2 seconds:
         *  MX.defer(sayHi, 2000, this, ['max']);
         * </code></pre>
         * @param {Function} fn The function to defer.
         * @param {Number} millis The number of milliseconds for the setTimeout call (if less than or equal to 0 the function is executed immediately)
         * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the function is executed.
         * <b>If omitted, defaults to the browser window.</b>
         * @return {Number} The timeout id that can be used with clearTimeout
         */
        defer: function(fn, millis, scope, args) {
            scope = scope || window;
            if (millis > 0) {
                return setTimeout(function() {
                    fn.apply(scope, args);
                }, millis);
            }
            fn.apply(scope, args);
            return 0;
        }
    });
    
    $.extend(X, {
        /**
         * Specify a function to execute
         */
        kindle: function() {
            var args = X.toArray(arguments),
                len = args.length,
                fnArgs = args.slice(0, len - 1),
                fn = args[len - 1];
            
            fnArgs.forEach(function(alias, i) {
                fnArgs[i] = X.klass.KlassManager.get(alias);
            });
            fn.apply(window, [X].concat(fnArgs));
        },
        
        /**
         * 代理$.ready()函数
         */
        ready: function() {
            var args = X.toArray(arguments);
            $(document).ready(function() {
                X.kindle.apply(window, args);
            });
        }
    });
})(MX);
/**
 * @class MX.klass.KlassManager
 */
(function(X) {
    "use strict";
    
    X.klass.KlassManager = function() {
        var classes = {};
        
        var pub = {
            register: function(alias, klass) {
                classes[alias] = klass;
            },
            
            get: function(alias) {
                return X.isString(alias) ? classes[alias] : alias;
            },
            
            create: function(alias, config) {
                var cls = pub.get(alias);
                return new cls(config);
            }
        };
        
        return pub;
    }();
    
    /**
     * @memberOf MX
     */
    X.reg = X.klass.KlassManager.register;
    
    /**
     * @memberOf MX
     */
    X.create = X.klass.KlassManager.create;
    
    X.reg('$', X.lib.jQuery);
    X.reg('jquery', X.lib.jQuery);
    X.lib.artTemplate && X.reg('arttemplate', X.lib.artTemplate);
    X.lib.iScroll && X.reg('iscroll', X.lib.iScroll);
    
    X.reg('klassmanager', X.klass.KlassManager);
})(MX);
/**
 * @class MX.klass.Base
 * 
 * 所有使用Class.define()方法声明类的基类
 */
MX.kindle('jquery', function(X, $) {
    "use strict";
    
    var enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'],
        noArgs = [],
        TemplateClass = function() {},
        chain = function(object) {
            TemplateClass.prototype = object;
            var result = new TemplateClass();
            TemplateClass.prototype = null;
            return result;
        };
    
    var Base = function() {};
    $.extend(Base, {
        $isClass: true,
        
        addMembers: function(members) {
            var prototype = this.prototype,
                names = [],
                i, ln, name, member;

            for (name in members) {
                names.push(name);
            }

            if (enumerables) {
                names.push.apply(names, enumerables);
            }

            for (i = 0,ln = names.length; i < ln; i++) {
                name = names[i];

                if (members.hasOwnProperty(name)) {
                    member = members[name];

                    if (typeof member == 'function' && !member.$isClass) {
                        member.$owner = this;
                        member.$name = name;
                    }

                    prototype[name] = member;
                }
            }

            return this;
        },
        
        extend: function(SuperClass) {
            var superPrototype = SuperClass.prototype,
                basePrototype, prototype, name;

            prototype = this.prototype = chain(superPrototype);
            this.superclass = prototype.superclass = superPrototype;

            if (!SuperClass.$isClass) {
                basePrototype = Base.prototype;
                for (name in basePrototype) {
                    if (name in prototype) {
                        prototype[name] = basePrototype[name];
                    }
                }
            }
        }
    });
    
    // Base类的prototype属性
    $.extend(Base.prototype, {
        $isInstance: true,
        
        /**
         * 调用当前方法的父类方法，例子：
         * <code>
         *  var Cls1 = Klass.define({
         *      constructor: function(name) {
         *          this.name = name;
         *      },
         *      
         *      say: function() {
         *          alert(this.name + ' say: hello, world!');
         *      }
         *  });
         *  
         *  var Cls2 = Klass.define({
         *      extend: Cls1,
         *      
         *      constructor: function() {
         *          thia.callParent(['Max']); // 调用父类的构造函数
         *      }
         *  });
         *  
         *  var cls2 = new Cls2();
         *  cls2.say(); // 输出 'Max say: hello, world!'
         * </code>
         * 
         * @param {Array/Arguments} args 传递给父类方法的形参
         * @return {Object} 返回父类方法的执行结果
         */
        callParent: function(args) {
            var method,
                superMethod = (method = this.callParent.caller) && 
                              (method = method.$owner ? method : method.caller) &&
                               method.$owner.superclass[method.$name];
            
            return superMethod.apply(this, X.toArray(args) || noArgs);
        },
        
        // Default constructor, simply returns `this`
        constructor: function() {
            return this;
        }
    });
    
    X.klass.Base = Base;
    X.reg('base', Base);
});
/**
 * @class MX.klass.Klass
 * 
 * 声明类，类的继承，重写类方法
 */
MX.kindle('base', 'klassmanager', function(X, Base, KlassManager) {
    "use strict";
    
    var makeCtor = function() {
        function constructor() {
            return this.constructor.apply(this, arguments) || null;
        }
        return constructor;
    };
    
    var extend = function(newClass, overrides) {
        var basePrototype = Base.prototype,
            newClassExtend = overrides.extend,
            SuperClass, superPrototype, name;

        delete overrides.extend;
        if (X.isString(newClassExtend)) {
            newClassExtend = KlassManager.get(newClassExtend);
        }
        if (newClassExtend && newClassExtend !== Object) {
            SuperClass = newClassExtend;
        } else {
            SuperClass = Base;
        }

        superPrototype = SuperClass.prototype;

        if (!SuperClass.$isClass) {
            for (name in basePrototype) {
                if (!superPrototype[name]) {
                    superPrototype[name] = basePrototype[name];
                }
            }
        }

        newClass.extend(SuperClass);
    };
    
    X.klass.Klass = {
        /**
         * 声明一个类，或继承自一个父类，子类拥有父类的所有prototype定义的特性，
         * 如未定义extend属性，默认继承class.Base类，例子：
         * <code>
         *  var Cls1 = Klass.define({
         *      constructor: function(name) {
         *          this.name = name;
         *      },
         *      
         *      say: function() {
         *          alert(this.name + ' say: hello, world!');
         *      }
         *  });
         *  
         *  var Cls2 = Klass.define({
         *      extend: Cls1,
         *      
         *      constructor: function() {
         *          thia.callParent(['Max']); // 调用父类的构造函数
         *      }
         *  });
         *  
         *  var cls2 = new Cls2();
         *  cls2.say(); // 输出 'Max say: hello, world!'
         * </code>
         * 
         * @param {Object} overrides 类的属性和方法
         * @return {Klass} The new class
         */
        define: function(overrides) {
            var newClass, name;
            
            if (!overrides) {
                overrides = {};
            }
            
            newClass = makeCtor();
            for (name in Base) {
                newClass[name] = Base[name];
            }
            
            extend(newClass, overrides);
            newClass.addMembers(overrides);
            
            if (overrides.alias) {
                X.reg(overrides.alias, newClass);
            }
            
            return newClass;
        },
        
        /**
         * 重写类的属性或方法，例子：
         * <code>
         *  var Cls1 = Klass.define({
         *      constructor: function(name) {
         *          this.name = name;
         *      },
         *      
         *      say: function() {
         *          alert(this.name + ' say: hello, world!');
         *      }
         *  });
         *  
         *  Klass.override(Cls1, {
         *      say: function() {
         *          alert(this.name + ' say: hello, I'm Max, nice to meet you!');
         *      },
         *      
         *      sayHello: function() {
         *          alert('hello, world!');
         *      }
         *  });
         *  
         *  var cls1 = new Cls1();
         *  cls1.say(); // 输出 'Max say: hello, I'm Max, nice to meet you!'
         *  cls1.sayHello(); // 输出 'hello world!'
         * </code>
         * 
         * 如果要为函数的某个方法定义别名，切忌使用override，应该像下面这样处理：
         * <code>
         *  $.extend(Cls1.prototype, {
         *      speak: Cls1.prototype.say
         *  });
         *  
         *  var cls1 = new Cls1();
         *  cls1.speak(); // 输出 'Max  say: hello, I'm Max, nice to meet you!'
         * </code>
         * 
         * @param {Klass} Cls
         * @param {Object} overrides 被添加到类的属性或方法 
         */
        override: function(Cls, overrides) {
            Cls.addMembers(overrides);
        }
    };
    
    X.reg('klass', X.klass.Klass);
});