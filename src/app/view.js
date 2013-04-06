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
         * @cfg {String} headerCls 添加到header元素上的扩展CSS样式
         */
        
        /**
         * @cfg {String} footerCls 添加到footer元素上的扩展CSS样式
         */
        
        /**
         * @cfg {String} bodyCls 添加到body元素上的扩展CSS样式
         */
        
        // private
        init: function() {
            this.initTemplate();
        },
        
        // private
        initTemplate: function() {
            var templates = {}, tmpl;
            if (this.templates) {
                if (!X.isArray(this.templates)) {
                    this.templates = [this.templates];
                }
                X.each(this.templates, function(i, config) {
                    tmpl = X.create('template', $.extend({}, config));
                    if (tmpl.renderToBody) {
                        this.renderBodyTmpl = tmpl;
                    } else if (tmpl.renderToHeader) {
                        this.renderHeaderTmpl = tmpl;
                    } else if (tmpl.renderToFooter) {
                        this.renderFooterTmpl = tmpl;
                    }
                    templates[tmpl.id] = tmpl;
                }, this);
            }
            this.templates = templates;
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
                
                if (this.renderHeaderTmpl) {
                    this.header = $(document.createElement('div'));
                    this.header.attr('id', 'mx-app-page-header-' + this.id)
                               .attr('data' + $.mobile.ns + '-role', 'header');
                    if (this.headerCls) {
                        this.header.addClass(this.headerCls);
                    }
                    this.renderHeaderTmpl.container = this.header;
                    this.renderHeaderTmpl.render(this.renderHeaderTmpl.getData(this.params));
                    container.append(this.header);
                }
                
                this.body = $(document.createElement('div'));
                this.body.attr('id', 'mx-app-page-body-' + this.id)
                         .attr('data' + $.mobile.ns + '-role', 'content');
                if (this.bodyCls) {
                    this.body.addClass(this.bodyCls);
                }
                if (this.renderBodyTmpl) {
                    this.renderBodyTmpl.container = this.body;
                    this.renderBodyTmpl.render(this.renderBodyTmpl.getData(this.params));
                }
                container.append(this.body);

                if (this.renderFooterTmpl) {
                    this.footer = $(document.createElement('div'));
                    this.footer.attr('id', 'mx-app-page-footer-' + this.id)
                        .attr('data' + $.mobile.ns + '-role', 'footer');
                    if (this.footerCls) {
                        this.footer.addClass(this.footerCls);
                    }
                    this.renderFooterTmpl.container = this.footer;
                    this.renderFooterTmpl.render(this.renderFooterTmpl.getData(this.params));
                    container.append(this.footer);
                }
                
                this.onRender(container);
                this.fireEvent('render', this, container);
            }
        },
        
        // private
        onRender: X.emptyFn,
        
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
        }
    });
});