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