/**
 * @class MX.app.Pagelet
 * @alias pagelet
 *
 * Pagelet是Appliaction的一个内部对象，一般情况下不会被外部调用，
 * 在业务系统中只会使用View或Controller提供的接口
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
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
         * @cfg {String} url pagelet绑定的url
         * 当页面hash发生改变时，使用url匹配hash创建对应的pagelet，然后实现页面跳转
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

        /**
         * @cfg {String/Object} transition 页面切换过渡动画效果
         * 当值为string时，仅仅表示设置了“页面进入效果”
         *  transition: 'fade'
         *
         * 如果要设置页面离开效果，使用下面这种方式:
         *  transition: {
         *      in: 'fade',
         *      out: 'slideup'
         *  }
         *
         * 还可以通过设置reverse属性，使动画反向
         *  transition: {
         *      in: 'fade',
         *      out: {
         *          effect: 'slideup',
         *          reverse: true
         *      }
         *  }
         */
        
        // private
        init: function() {
            // 匹配URL中包含的参数名
            this.urlParamNames = this.url.match(paramNameRe);
            
            // 解析URL中包含的参数值
            this.parseParams();

            // 这里必须严格按照下面的顺序初始化
            this.initTransition();
            this.initView();
            this.initModels();
            this.initStores();
            this.initController();
        },

        /*
         * @private
         * 将hash中包含的参数解析出来
         *
         * 比如：
         *  pagelet配置参数设置的url为'c/:id/:page'
         *
         * 那么，当访问页面'http://localhost/mx/examples/msohu/index.html#/c/0/1'时，
         * 解析的params为：
         *  {
         *      id: '0',
         *      page: '1'
         *  }
         */
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
        initTransition: function() {
            this.transition = this.transition || '';
            if (X.isString(this.transition)) {
                this.transition = {
                    in: this.transition,
                    out: ''
                }
            }
            if (X.isString(this.transition.in)) {
                this.transition.in = {
                    effect: this.transition.in
                }
            }
            if (X.isString(this.transition.out)) {
                this.transition.out = {
                    effect: this.transition.out
                }
            }
        },

        // private
        initModels: function() {
            this.models = this.models || {};
            X.each(this.models, function(i, model) {
                model.params = this.params;
                if (model.bindTo === 'header' && this.view.headerTmpl) {
                    this.view.headerTmpl.bindStore(model);
                } else if (model.bindTo === 'footer' && this.view.footerTmpl) {
                    this.view.footerTmpl.bindStore(model);
                } else if (model.bindTo === 'body' && this.view.bodyTmpl) {
                    this.view.bodyTmpl.bindStore(model);
                }
            }, this);
        },

        // private
        initStores: function() {
            this.stores = this.stores || {};
            X.each(this.stores, function(i, store) {
                store.params = this.params;
                if (store.bindTo === 'header' && this.view.headerTmpl) {
                    this.view.headerTmpl.bindStore(store);
                } else if (store.bindTo === 'footer' && this.view.footerTmpl) {
                    this.view.footerTmpl.bindStore(store);
                } else if (store.bindTo === 'body' && this.view.bodyTmpl) {
                    this.view.bodyTmpl.bindStore(store);
                }
            }, this);
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event beforerender
                 * 当pagelet渲染之前触发，返回false，终止pagelet渲染
                 * @param {Pagelet} this
                 */
                'beforerender',
                /**
                 * @event render
                 * 当pagelet渲染时触发
                 * @param {Pagelet} this
                 */
                'render'
            );
        },
        
        // private
        initView: function() {
            /**
             * @property {Object} view
             * 绑定的view实例对象
             */
            this.view = X.create(this.view || 'view', {
                params: this.params
            });
            this.mon(this.view, 'render', this.onViewRender);
        },
        
        // private
        initController: function() {
            /**
             * @property {Object} controller
             * 绑定的controller实例对象
             */
            this.controller = X.create(this.controller || 'controller', {
                view: this.view,
                models: this.models,
                stores: this.stores,
                params: this.params
            });
        },
        
        // private
        render: function(container) {
            if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
                this.rendered = true;

                /**
                 * @property {Element} container
                 * pagelet container jquery element
                 */
                this.container = container = $(container);

                /**
                 * @property {Element} el
                 * pagelet el jquery element
                 */
                this.el = $(document.createElement('div'));
                this.el.attr('id', 'mx-app-page-' + this.id)
                       .attr('data-' + $.mobile.ns + 'role', 'page')
                       .attr('data-' + $.mobile.ns + 'url', '#/' + this.hash);
                if (this.cls) {
                    this.el.addClass(this.cls);
                }
                container.append(this.el);
                
                if (this.view) {
                    this.view.render(this.el);
                }

                // pagelet代理page事件
                this.mon(this.el, {
                    'pagebeforeshow': this.beforePageShow,
                    'pageshow': this.onPageShow,
                    'pagebeforehide': this.beforePageHide,
                    'pagehide': this.onPageHide
                });
                
                this.onRender(container);
                this.fireEvent('render', this, container);
            }
        },
        
        // private
        onRender: X.emptyFn,

        // private
        onViewRender: function() {
            if (this.controller) {
                this.controller.onViewRender();
            }
        },
        
        // private
        beforePageShow: function() {
            if (this.controller) {
                this.controller.beforePageShow();
                this.controller.fireEvent('pagebeforeshow', this.controller);
            }
        },
        
        // private
        onPageShow: function() {
            /*
             * 在页面进入时，自动加载配置了autoLoad属性的model、store
             */
            this.loadModelOrStore(this.models);
            this.loadModelOrStore(this.stores);
            if (this.controller) {
                this.controller.onPageShow();
                this.controller.fireEvent('pageshow', this.controller);
            }
        },

        // private
        beforePageHide: function() {
            /*
             * 当页面离开时，中断当前页面的所有model、store的AJAX请求操作
             * 防止页面离开之后，Pagelet的DOM被刷新
             */
            this.cancelFetch();
            if (this.controller) {
                this.controller.beforePageHide();
                this.controller.fireEvent('pagebeforehide', this.controller);
            }
        },

        // private
        onPageHide: function() {
            if (this.controller) {
                this.controller.onPageHide();
                this.controller.fireEvent('pagehide', this.controller);
            }
        },

        // private
        onOrientationChange: function() {
            if (this.controller) {
                this.controller.onOrientationChange();
                this.controller.fireEvent('orientationchange', this.controller);
            }
        },
        
        // private 取消所有model、store的AJAX请求操作
        cancelFetch: function() {
            X.each(this.models, function(id, model) {
                model.cancelFetch();
            }, this);
            X.each(this.stores, function(id, store) {
                store.cancelFetch();
            }, this);
        },

        // private
        loadModelOrStore: function(objects) {
            X.each(objects, function(i, obj) {
                if (obj.autoLoad === true) {
                    obj.load();
                }
            }, this);
        },
        
        /**
         * 获得view对象
         * @return {Object} view
         */
        getView: function() {
            return this.view;
        },
        
        /**
         * 获得controller对象
         * @return {Object} controller
         */
        getController: function() {
            return this.controller;
        },
        
        // private
        onDestroy: function() {
            if (this.models && X.isObject(this.models)) {
                X.each(this.models, function(i, model) {
                    model.destroy();
                });
            }
            if (this.stores && X.isObject(this.stores)) {
                X.each(this.stores, function(i, store) {
                    store.destroy();
                });
            }
            if (this.controller) {
                this.controller.destroy();
                this.controller = null;
            }
            if (this.view) {
                this.view.destroy();
                this.view = null;
            }
            if (this.el) {
                this.el.remove();
                this.el = null;
            }
            this.container = null;
        }
    });
});