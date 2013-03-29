/**
 * @class MX.app.View
 */
MX.kindle('jquery', 'klass', function(X, $, Klass) {
    "use strict";
    
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
                
                this.header = $(document.createElement('div'));
                this.header.attr('id', 'mx-app-page-header-' + this.id)
                           .attr('data' + $.mobile.ns + '-role', 'header');
                if (this.headerCls) {
                    this.header.css(this.headerCls);
                }
                
                this.footer = $(document.createElement('div'));
                this.footer.attr('id', 'mx-app-page-footer-' + this.id)
                           .attr('data' + $.mobile.ns + '-role', 'footer');
                if (this.footerCls) {
                    this.footer.css(this.footerCls);
                }
                
                this.body = $(document.createElement('div'));
                this.body.attr('id', 'mx-app-page-body-' + this.id)
                         .attr('data' + $.mobile.ns + '-role', 'content');
                if (this.bodyCls) {
                    this.body.css(this.bodyCls);
                }
                
                container.append(this.header);
                container.append(this.body);
                container.append(this.footer);
                
                this.initTemplate();
                X.each(this.autoRenderTmpl, function(i, tmpl) {
                    tmpl.render();
                }, this);
                
                this.onRender(container);
                this.fireEvent('render', this, container);
            }
        },
        
        // private
        onRender: X.emptyFn,
        
        // private
        initTemplate: function() {
            var templates = {}, tmpl;
            this.autoRenderTmpl = [];
            X.each(this.templates, function(i, config) {
                tmpl = X.create('template', $.extend({}, config));
                if (tmpl.renderToBody) {
                    tmpl.container = this.body;
                    this.autoRenderTmpl.push(tmpl);
                } else if (tmpl.renderToHeader) {
                    tmpl.container = this.header;
                    this.autoRenderTmpl.push(tmpl);
                } else if (tmpl.renderToFooter) {
                    tmpl.container = this.footer;
                    this.autoRenderTmpl.push(tmpl);
                }
                templates[tmpl.id] = tmpl;
            }, this);
            this.templates = templates; 
        },
        
        // private
        onDestory: function() {
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