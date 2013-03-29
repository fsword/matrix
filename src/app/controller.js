/**
 * @class MX.app.Controller
 */
MX.kindle('klass', function(X, Klass) {
    "use strict";
    
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
                'pagehide'
            );
            
            this.mon(this.view, 'render', function() {
                if (this.delegates) {
                    this.delegateEvent(this.view.container, this.delegates);
                    delete this.delegates;
                }
            });
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
        beforePageShow: X.emptyFn,
        
        // private
        onPageShow: X.emptyFn,
        
        // private
        beforePageHide: X.emptyFn,
        
        // private
        onPageHide: X.emptyFn,
        
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
        
        // private
        onDestroy: function() {
            this.view = null;
            this.models = this.stores = null;
        }
    });
});