/**
 * @class MX.app.View
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    X.app.View = Klass.define({
        // private
        alias: 'view',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {String} headerCfg
         * String : cls 添加到header元素上的扩展CSS样式
         * String : template 模版
         */
        
        /**
         * @cfg {String} footerCfg
         * String : cls 添加到footer元素上的扩展CSS样式
         * String : template 模版
         */
        
        /**
         * @cfg {String} bodyCfg
         * String : cls 添加到body元素上的扩展CSS样式
         * String : template 模版
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
                this.headerTmpl = this.addTemplate(X.isString(this.headerCfg.template) ? { id: this.headerCfg.template } : $.extend({}, this.headerCfg.template));
            }
            if (this.footerCfg && this.footerCfg.template) {
                this.footerTmpl = this.addTemplate(X.isString(this.footerCfg.template) ? { id: this.footerCfg.template } : $.extend({}, this.footerCfg.template));
            }
            if (this.bodyCfg && this.bodyCfg.template) {
                this.bodyTmpl = this.addTemplate(X.isString(this.bodyCfg.template) ? { id: this.bodyCfg.template } : $.extend({}, this.bodyCfg.template));
            }
        },
        
        // private
        initEvents: function() {
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
        render: function(container) {
            if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
                this.rendered = true;

                this.container = container = $(container);

                if (this.headerCfg) {
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
                        !this.headerTmpl.store && this.headerTmpl.render();
                    }
                    container.append(this.header);
                }

                var bodyCfg = this.bodyCfg || {};
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
                    !this.bodyTmpl.store && this.bodyTmpl.render();
                }
                container.append(this.body);

                if (this.footerCfg) {
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
         * 获取模版
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