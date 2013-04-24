/**
 * @class MX
 */
window.MX = {};

(function(X, $, artTemplate) {
    var slice = Array.prototype.slice,
        toString = Object.prototype.toString,
        ua = window.navigator.userAgent,
        android = ua.match(/(Android)[\/\s+]([\d.]+)/),
        ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
        iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
        webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
        touchpad = webos && ua.match(/TouchPad/),
        kindle = ua.match(/Kindle\/([\d.]+)/),
        blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
        os;

    /**
     * The version of the framework
     */
    X.version = '0.0.10';

    /**
     * 声明命名空间，用法如下：
     *
     * <code>
     *  MX.namespace('NS.core', 'NS.util');
     *
     *  alert(typeof NS.core); // alert 'object'
     *
     *  alert(typeof NS.util); // alert 'object'
     *
     *  //有了命名空间之后，就可以直接在命名空间下声明类
     *  NS.util.Format = {
     *
     *      // ...
     *
     *  };
     * </code>
     *
     * @param {String} namespace1
     * @param {String...} namespace2...n
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

    /**
     * 命名空间函数的缩写方法名
     * @param {String} namespace1
     * @param {String...} namespace2...n
     */
    X.ns = X.namespace;
    X.ns('MX.lib', 'MX.klass', 'MX.lib', 'MX.util', 'MX.app');

    $.extend(X.lib, {
        jQuery: $,
        artTemplate: artTemplate
    });

    // 重写artTemplate代码标签的（开口/闭合）标签符号，默认的标签为'<%'和'%>'，%太通用了，很容易与其他技术的页面标签冲突，如JSP等
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
         * 移动设备操作系统信息，可能会包含一下属性:
         *
         * true表示为当前操作系统
         *  Boolean : ios
         *  Boolean : android
         *  Boolean : webos
         *  Boolean : touchpad
         *  Boolean : blackberry
         *  Boolean : kindle
         *
         *  String : version 系统版本号
         *
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
         * 将对象转换成数组，包含以下几种参数传递方式：
         *
         * <code>
         *  var arr = MX.toArray('a', 'b', 'c');
         *
         *  // 输出 ['a', 'b', 'c']
         *  alert(arr);
         *
         *
         *  arr = MX.toArray();
         *
         *  // 输出 []
         *  alert(arr);
         *
         *
         *  function fn() {
         *      return MX.toArray(arguments);
         *  }
         *
         *  arr = fn('a', 'b', 'c');
         *
         *  // 输出 ['a', 'b', 'c']
         *  alert(arr);
         *
         * </code>
         *
         */
        toArray: function(obj) {
            var args, i, len;
            if (!X.isDefined(obj)) {
                args = [];
            } else if (X.isArray(obj)) {
                args = slice.call(obj, 0);
            } else if (toString.call(obj) == '[object Arguments]') {
                args = slice.call(obj, 0);
            } else {
                // 为了兼容IE8以下浏览器，IE8不支持Arguments对象
                args = [];
                for (i = 0, len = arguments.length; i < len; i++) {
                    args.push(arguments[i]);
                }
            }
            return args;
        },

        /**
         * 遍历一个对象或数组，$.each的封装类，允许指定回调函数的作用域
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
         * @param {Array} args (optionls) 回调函数的形参
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
         * 声明一个匿名函数工作空间，并执行。同时进行类依赖管理，将依赖类对象作为参数传给回调函数
         *
         * 回调函数形参的第一个参数默认为MX，例如：
         * <code>
         *  // 不依赖任何类，直接执行回调，第一个参数为MX对象
         *  MX.kindle(function(X) {
         *      // 输出true
         *      alert(X.isBoolean(true));
         *  });
         * </code>
         *
         * 处理类的依赖关系，类依赖使用alias属性，也可以直接是一个对象：
         * <code>
         *  MX.kindle('jquery', function(X, $) {
         *      // 输出true
         *      alert(window.jQuery == $;
         *  });
         *
         *  // 又或者是
         *
         *  MX.kindle('jquery', 'klass', function(X, $, Klass) {
         *
         *      var Cls1 = Klass.define({
         *          say: function() {
         *              alert('hello');
         *          }
         *      });
         *
         *      // 输出'hello'
         *      new Cls1().say();
         *  });
         *
         *  // 直接依赖对象
         *  MX.kindle('jquery', MX.klass.Klass, function(X, $, Klass) {
         *
         *      var Cls1 = Klass.define({
         *          say: function() {
         *              alert('hello');
         *          }
         *      });
         *
         *      // 输出'hello'
         *      new Cls1().say();
         *  });
         * </code>
         *
         * @param {String} alias 类对象的别名
         * @param {String} alias1...n {optional}
         * @param {Function} callback 回调函数
         */
        kindle: function() {
            var args = X.toArray.apply(X, arguments),
                len = args.length,
                fnArgs = args.slice(0, len - 1),
                fn = args[len - 1];

            X.each(fnArgs, function(i, alias) {
                fnArgs[i] = X.klass.KlassManager.get(alias);
            });
            fn.apply(window, [X].concat(fnArgs));
        },

        /**
         * 代理$.ready()函数，并具备MX.kindle()的特性
         *
         * MX.kindle()是立即执行回调函数
         *
         * MX.ready()是当DOM准备就绪时，才执行回调函数
         *
         * 基本用法：
         * <code>
         *  MX.ready('jquery', function(X, $) {
         *      // 输出true
         *      alert(window.jQuery == $;
         *  });
         * </code>
         *
         * @param {String} alias 类对象的别名
         * @param {String} alias1...n {optional}
         * @param {Function} callback 回调函数
         */
        ready: function() {
            var args = X.toArray.apply(X, arguments);
            $(document).ready(function() {
                X.kindle.apply(window, args);
            });
        }
    });
})(window.MX, window.jQuery, window.template);
/**
 * @class MX.klass.KlassManager
 * @alias klassmanager
 *
 * 类管理器，管理类对象与alias的映射关系
 *
 * Matrix框架的几个依赖库的alias分别是：
 *      jQuery对应'$'或'jquery'
 *      artTemplate对应'arttemplate'
 *
 */
MX.kindle(function(X) {
    X.klass.KlassManager = function() {
        var classes = {};
        
        var pub = {
            /**
             * 为一个类对象注册一个alias
             * @param {String} alias 别名
             * @param {Class} klass 类对象
             */
            register: function(alias, klass) {
                classes[alias] = klass;
            },

            /**
             * 通过alias获取类对象
             * @param {String} alias 别名
             * @return {Class} 类对象
             */
            get: function(alias) {
                return X.isString(alias) ? classes[alias] : alias;
            },

            /**
             * 实例化一个类对象
             * @param {String} alias 别名
             * @param {Object} config 配置参数
             * @returns {Object} 实例对象
             */
            create: function(alias, config) {
                var cls = pub.get(alias);
                return new cls(config);
            }
        };
        
        return pub;
    }();
    
    /**
     * @memberOf MX
     * 为MX对象增加KlassManager.register()映射函数，使用MX.reg快速访问register函数
     * @param {String} alias 别名
     * @param {Class} klass 类对象
     */
    X.reg = X.klass.KlassManager.register;

    /**
     * @memberOf MX
     * 为MX对象增加KlassManager.get()映射函数，使用MX.getClass快速访问get函数
     * @param {String} alias 别名
     * @return {Class} 类对象
     */
    X.getClass = X.klass.KlassManager.get;
    
    /**
     * @memberOf MX
     * 为MX对象增加KlassManager.create()映射函数，使用MX.create快速访问create函数
     * @param {String} alias 别名
     * @param {Object} config 配置参数
     * @returns {Object} 实例对象
     */
    X.create = X.klass.KlassManager.create;

    // 注册几个MX框架依赖库的alias
    X.reg('$', X.lib.jQuery);
    X.reg('jquery', X.lib.jQuery);
    X.lib.artTemplate && X.reg('arttemplate', X.lib.artTemplate);

    X.reg('klassmanager', X.klass.KlassManager);
});
/**
 * @class MX.klass.Base
 * @alias base
 *
 * Class基类，使用Klass.define()方法声明类继承的顶级父类
 */
MX.kindle('jquery', function(X, $) {
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
 * @alias klass
 *
 * 声明类，类的继承，重写类方法
 */
MX.kindle('base', 'klassmanager', function(X, Base, KlassManager) {
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
         * 如未定义extend属性，默认继承MX.klass.Base类，例子：
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
         * 如果想为类的方法定义一个新的别名，应该使用下面的方式，不能使用override函数：
         * <code>
         *  Cls1.prototype.speak = Cls1.prototype.say;
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