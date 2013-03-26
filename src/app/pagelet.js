/**
 * @class MX.app.Pagelet
 */
MX.kindle('jquery', 'klass', 'klassmanager', function(X, $, Klass, KlassManager) {
    "use strict";
    
    var paramNameRe = /(:|\*)\w+/g; // 匹配URL中的参数名
    
    X.app.Pagelet = Klass.define({
        // private
        alias: 'pagelet',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Boolean} singleton true单例，默认false
         */
        singleton: false,
        
        /**
         * @cfg {Boolean} noCache true缓存pagelet实例，false当退出页面时立即销毁pagelet，默认false
         */
        noCache: false,
        
        /**
         * @cfg {String} hash pagelet绑定的hash
         */
        
        /**
         * @cfg {String/View} view 绑定View
         */
        
        /**
         * @cfg {String/Controller} controller 绑定Controller
         */
        
        /**
         * @cfg {Array/Model} models 绑定model，允许绑定多个model
         */
        
        /**
         * @cfg {Array/Store} stores 绑定store，允许绑定多个store
         */
        
        /**
         * @cfg {String} cls 添加到el元素上的扩展CSS样式
         */
        
        // private
        init: function() {
            // 匹配URL中包含的参数名
            this.urlParamNames = this.url.match(paramNameRe);
            
            // 解析URL中包含的参数值
            this.parseParams();
            
            this.initView();
            this.initController();
        },
        
        // private 将hash中包含的参数解析出来
        parseParams: function() {
            var values = this.urlRe.exec(this.hash).slice(1),
                params = {};
            
            X.each(this.urlParamNames, function(i, param) {
                params[param.substr(1)] = values[i];
            }, this);
            
            this.params = params;
            return params;
        },
        
        // private
        initEvent: function() {
            this.addEvents(
                /**
                 * @event beforerender
                 */
                'beforerender',
                
                /**
                 * @event render
                 */
                'render'
            );
        },
        
        // private
        initView: function() {
            this.view = KlassManager.create(this.view || 'view', {});
        },
        
        // private
        initController: function() {
            this.controller = KlassManager.create(this.controller || 'controller', {
                pagelet: this,
                view: this.view,
                models: this.models,
                stores: this.stores
            });
        },
        
        // private
        render: function(container) {
            if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
                this.rendered = true;
                
                this.container = container = $(container);
                
                this.el = $(document.createElement('div'));
                this.el.attr('id', 'mx-app-page-' + this.id).data('role', 'page');
                if (this.cls) {
                    this.el.css(this.cls);
                }
                container.append(this.el);
                
                if (this.view) {
                    this.view.render(this.el);
                }
                
                this.onRender(container);
                this.fireEvent('render', this, container);
            }
        },
        
        // private
        onRender: X.emptyFn
        
        
    });
});