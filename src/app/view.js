/**
 * @class MX.app.View
 */
MX.kindle('jquery', 'klass', 'klassmanager', function(X, $, Klass, KlassManager) {
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
                this.header.attr('id', 'mx-app-page-header-' + this.id).data('role', 'header');
                if (this.headerCls) {
                    this.header.css(this.headerCls);
                }
                
                this.footer = $(document.createElement('div'));
                this.footer.attr('id', 'mx-app-page-footer-' + this.id).data('role', 'footer');
                if (this.footerCls) {
                    this.footer.css(this.footerCls);
                }
                
                this.body = $(document.createElement('div'));
                this.body.attr('id', 'mx-app-page-body-' + this.id).data('role', 'content');
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
                tmpl = KlassManager.create('template', $.extend({}, config, {id: null}));
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
        }
        
    });
});