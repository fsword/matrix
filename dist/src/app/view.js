/**
 * @class MX.app.View
 * @alias view
 *
 * 页面视图类，负责渲染页面
 *
 * 一般情况下，一个页面由三部分组成：header、body、footer
 * header和footer，只有在设置了headerCfg、footerCfg的时候才会被渲染到页面上
 *
 * 页面视图的完全使用jquery mobile的page structure样式，页面至少必须引入structure.css，页面结构才能正常显示
 *  <link rel="stylesheet" href="../../resources/jquerymobile/1.3.0/lite/structure.css" media="all" />
 *  或包含皮肤样式
 *  <link rel="stylesheet" href="../../resources/jquerymobile/1.3.0/lite.css" media="all" />
 *
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    X.app.View = Klass.define({
        // private
        alias: 'view',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {Object} headerCfg header配置参数，如果未设置，则不渲染header element
         * headerCfg可以用的参数：
         *  String : cls 添加到header元素上的扩展CSS样式
         *  String/Object : template 绑定模版，值为string时表示模版id，值为object时表示模版配置参数
         *  Boolean : fixed true表示fixed定位
         */
        
        /**
         * @cfg {Object} footerCfg footer配置参数，如果未设置，则不渲染header element
         * footerCfg可以用的参数：
         *  String : cls 添加到footer元素上的扩展CSS样式
         *  String/Object : template 绑定模版，值为string时表示模版id，值为object时表示模版配置参数
         *  Boolean : fixed true表示fixed定位
         */
        
        /**
         * @cfg {Object} bodyCfg body配置参数
         * bodyCfg可以用的参数：
         *  String : cls 添加到body元素上的扩展CSS样式
         *  String : template 模版
         */

        /**
         * @cfg {String/Object/Array} templates View绑定的模版
         * <code>
         *  // 模版的几种配置方式，更多模版配置参数参见{Template}的API
         *  // 第一种
         *  templates: 'tmpl1'
         *
         *  // 第二种
         *  templates: {
         *      id:  'tmpl1',
         *      getData: function(params, data) {
         *          // ...
         *      }
         *  }
         *
         *  // 第三种
         *  templates: ['tmpl1', 'tmpl2', 'tmpl3']
         *
         *  // 第四种
         *  templates: ['tmpl1', {
         *      id:  'tmpl1',
         *      getData: function(params, data) {
         *          // ...
         *      }
         *  }, 'tmpl3']
         * </code>
         */
        
        // private
        init: function() {
            this.initTemplate();
        },
        
        // private
        initTemplate: function() {
            var templates = this.templates;
            this.templates = [];
            if (templates) {
                if (!X.isArray(templates)) {
                    templates = [templates];
                }
                X.each(templates, function(i, config) {
                    this.addTemplate($.extend({}, config));
                }, this);
            }
            if (this.headerCfg && this.headerCfg.template) {
                /**
                 * @property {Template} headerTmpl
                 * header模版实例对象
                 */
                this.headerTmpl = this.addTemplate(X.isString(this.headerCfg.template) ? { id: this.headerCfg.template } : $.extend({}, this.headerCfg.template));
            }
            if (this.footerCfg && this.footerCfg.template) {
                /**
                 * @property {Template} footerTmpl
                 * footer模版实例对象
                 */
                this.footerTmpl = this.addTemplate(X.isString(this.footerCfg.template) ? { id: this.footerCfg.template } : $.extend({}, this.footerCfg.template));
            }
            if (this.bodyCfg && this.bodyCfg.template) {
                /**
                 * @property {Template} bodyTmpl
                 * body模版实例对象
                 */
                this.bodyTmpl = this.addTemplate(X.isString(this.bodyCfg.template) ? { id: this.bodyCfg.template } : $.extend({}, this.bodyCfg.template));
            }
        },
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event beforerender
                 * 当View渲染之前调用，返回false则终止View渲染
                 * @param {View} this
                 */
                'beforerender',
                /**
                 * @event render
                 * 当View渲染完成调用
                 * @param {View} this
                 */
                'render'
            );
        },
        
        // private
        render: function(container) {
            if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
                /**
                 * @property {Boolean} rendered
                 * true表示View已经渲染
                 */
                this.rendered = true;

                /**
                 * @property {Boolean} container
                 * View渲染容器
                 */
                this.container = container = $(container);

                if (this.headerCfg) {
                    /**
                     * @property {Element} header
                     * header jquery element
                     */
                    this.header = $(document.createElement('div'));
                    this.header.attr('id', 'mx-app-page-header-' + this.id)
                               .attr('data-' + $.mobile.ns + 'role', 'header');
                    if (this.headerCfg.fixed) {
                        this.header.attr('data-' + $.mobile.ns + 'position', 'fixed');
                    }
                    if (this.headerCfg.cls) {
                        this.header.addClass(this.headerCfg.cls);
                    }
                    if (this.headerTmpl) {
                        this.headerTmpl.container = this.header;
                        // 如果header模版绑定了Model或Store时，header的渲染应当在Store加载完成之后进行
                        // 如果未绑定，就可以在View渲染时一起渲染
                        !this.headerTmpl.store && this.headerTmpl.render();
                    }
                    container.append(this.header);
                }

                var bodyCfg = this.bodyCfg || {};
                /**
                 * @property {Element} body
                 * body jquery element
                 */
                this.body = $(document.createElement('div'));
                this.body.attr('id', 'mx-app-page-body-' + this.id)
                         .attr('data-' + $.mobile.ns + 'role', 'content');
                if (bodyCfg.fixed) {
                    this.body.attr('data-' + $.mobile.ns + 'position', 'fixed');
                }
                if (bodyCfg.cls) {
                    this.body.addClass(bodyCfg.cls);
                }
                if (this.bodyTmpl) {
                    this.bodyTmpl.container = this.body;
                    // 如果body模版绑定了Model或Store时，body的渲染应当在Store加载完成之后进行
                    // 如果未绑定，就可以在View渲染时一起渲染
                    !this.bodyTmpl.store && this.bodyTmpl.render();
                }
                container.append(this.body);

                if (this.footerCfg) {
                    /**
                     * @property {Element} footer
                     * footer jquery element
                     */
                    this.footer = $(document.createElement('div'));
                    this.footer.attr('id', 'mx-app-page-footer-' + this.id)
                               .attr('data-' + $.mobile.ns + 'role', 'footer');

                    if (this.footerCfg.fixed) {
                        this.footer.attr('data-' + $.mobile.ns + 'position', 'fixed');
                    }
                    if (this.footerCfg.cls) {
                        this.footer.addClass(this.footerCfg.cls);
                    }
                    if (this.footerTmpl) {
                        this.footerTmpl.container = this.footer;
                        // 如果footer模版绑定了Model或Store时，footer的渲染应当在Store加载完成之后进行
                        // 如果未绑定，就可以在View渲染时一起渲染
                        !this.footerTmpl.store && this.footerTmpl.render();
                    }
                    container.append(this.footer);
                }
                
                this.onRender(container);
                this.fireEvent('render', this, container);
            }
        },
        
        // private
        onRender: X.emptyFn,

        // private
        addTemplate: function(config) {
            config = config || {};
            config.params = this.params;
            var tmpl = X.create('template', config);
            this.templates[tmpl.id] = tmpl;
            return tmpl;
        },
        
        /**
         * 根据模版id获取模版
         * @param {String} id
         * @return {Object} template
         */
        getTemplate: function(id) {
            return this.templates[id];
        },
        
        // private
        onDestroy: function() {
            if (this.header) {
                this.header.remove();
                this.header = null;
            }
            if (this.footer) {
                this.footer.remove();
                this.footer = null;
            }
            if (this.body) {
                this.body.remove();
                this.body = null;
            }
            this.container = null;

            X.each(this.templates, function(i, tmpl) {
                tmpl.destroy();
            });
            this.templates = null;
        }
    });
});