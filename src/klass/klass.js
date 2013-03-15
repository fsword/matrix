/**
 * @author max<daipingzhang@sohu-inc.com>
 * @class MX.clazz.Class
 * 
 * 声明类，类的继承，重写类方法
 */
(function() {
    var Base = MX.clazz.Base,
        makeCtor = function() {
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
    
    MX.clazz.Class = {
        /**
         * 声明一个类，或继承自一个父类，子类拥有父类的所有prototype定义的特性，
         * 如未定义extend属性，默认继承class.Base类，例子：
         * <code>
         *  var Cls1 = Class.define({
         *      constructor: function(name) {
         *          this.name = name;
         *      },
         *      
         *      say: function() {
         *          alert(this.name + ' say: hello, world!');
         *      }
         *  });
         *  
         *  var Cls2 = Class.define({
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
         * @return {Class} The new class
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
            
            return newClass;
        },
        
        /**
         * 重写类的属性或方法，例子：
         * <code>
         *  var Cls1 = Class.define({
         *      constructor: function(name) {
         *          this.name = name;
         *      },
         *      
         *      say: function() {
         *          alert(this.name + ' say: hello, world!');
         *      }
         *  });
         *  
         *  Class.override(Cls1, {
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
         *  LangObject.apply(Cls1.prototype, {
         *      speak: Cls1.prototype.say
         *  });
         *  
         *  var cls1 = new Cls1();
         *  cls1.speak(); // 输出 'Max  say: hello, I'm Max, nice to meet you!'
         * </code>
         * 
         * @param {Class} Cls
         * @param {Object} overrides 被添加到类的属性或方法 
         */
        override: function(Cls, overrides) {
            Cls.addMembers(overrides);
        }
    };
})();