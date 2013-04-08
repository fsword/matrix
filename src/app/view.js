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
            var templates = {}, tmpl;
            if (this.templates) {
                if (!X.isArray(this.templates)) {
                    this.templates = [this.templates];
                }
                X.each(this.templates, function(i, config) {
					tmpl = X.create('template', $.extend({}, config));
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

				var tmpl;
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
					if (this.headerCfg.template) {
						tmpl = this.addTemplate(X.isString(this.headerCfg.template) ? { id: this.headerCfg.template } : $.extend({}, this.headerCfg.template));
						tmpl.container = this.header;
						tmpl.render(this.headerCfg.getData && this.headerCfg.getData(this.params));
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
				if (bodyCfg.template) {
					tmpl = this.addTemplate(X.isString(bodyCfg.template) ? { id: bodyCfg.template } : $.extend({}, bodyCfg.template));
					tmpl.container = this.body;
					tmpl.render(bodyCfg.getData && bodyCfg.getData(this.params));
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
					if (this.footerCfg.template) {
						tmpl = this.addTemplate(X.isString(this.footerCfg.template) ? { id: this.footerCfg.template } : $.extend({}, this.footerCfg.template));
						tmpl.container = this.footer;
						tmpl.render(this.footerCfg.getData && this.footerCfg.getData(this.params));
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
        }
    });
});