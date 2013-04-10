/**
 * @class MX.app.Controller
 * @alias controller
 */
MX.kindle('klass', function(X, Klass) {
    X.app.Controller = Klass.define({
        // private
        alias: 'controller',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Object} delegates 委托事件
         */
        
        // private
        init: function() {
            this.relayMethod(this.view, 'getTemplate', 'getComponent');
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event pagecreate
                 */
                'pagecreate',
                /**
                 * @event pagebeforeshow
                 */
                'pagebeforeshow',
                /**
                 * @event pageshow
                 */
                'pageshow',
                /**
                 * @event pagebeforehide
                 */
                'pagebeforehide',
                /**
                 * @event pagehide
                 */
                'pagehide',
                /**
                 * @event orientationchange
                 */
                'orientationchange'
            );
        },
        
        /**
         * 绑定委托事件
         * 
         * delegateEvent(root, eventName)
         *  {
         *      scope: scope,
         *      'click ul > li': callbackFn
         *  }
         * 
         * delegateEvent(root, eventName, selector, callbackFn)
         * 
         * delegateEvent(root, eventName, selector, callbackFn, scope)
         * 
         */
        delegateEvent: function(root, eventName, selector, callbackFn, scope) {
            var len = arguments.length;
            
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

        // private
        onPageCreate: X.emptyFn,
        
        // private
        beforePageShow: X.emptyFn,
        
        // private
        onPageShow: X.emptyFn,
        
        // private
        beforePageHide: X.emptyFn,
        
        // private
        onPageHide: X.emptyFn,

        // private
        onOrientationChange: X.emptyFn,
        
        /**
         * 获取Model
         * @param {String} modelId
         */
        getModel: function(id) {
            return this.models[id];
        },
        
        /**
         * 获取Store
         * @param {String} storeId
         */
        getStore: function(id) {
            return this.stores[id];
        },
        
        /**
         * 获取header element
         */
        getHeader: function() {
            return this.view.header;
        },
        
        /**
         * 获取footer element
         */
        getFooter: function() {
            return this.view.footer;
        },
        
        /**
         * 获取body element
         */
        getBody: function() {
            return this.view.body;
        },
        
        /**
         * 获取container element
         */
        getContainer: function() {
            return this.view.container;
        },
        
        /**
         * 获取container element
         */
        getCt: function() {
            return this.getContainer();
        },

        /**
         * 获取hash中包含的参数
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