/**
 * @class MX.app.Template
 */
MX.kindle('jquery', 'arttemplate', 'klass', function(X, $, artTemplate, Klass) {
    X.app.Template = Klass.define({
        // private
        alias: 'template',
        
        // private
        extend: 'utility',
        
        /**
         * @cfg {String} container 模版渲染的容器
         */
        
        /**
         * @cfg {String} target 获取模版的Selector
         */
        
        /**
         * @cfg {String} template 模版HTML String
         */
        
        // private
        init: function() {
            if (!this.template) {
                this.template = artTemplate($(this.target || ('#' + this.id)).html());
            } else if (X.isString(this.template)) {
                this.template = artTemplate(this.template);
            }
        },
        
        /**
         * 获得应用模版生成的HTML代码片段
         */
        applyTemplate: function(data) {
            if (this.template) {
                return this.template(data || {});
            }
            return '';
        },
        
        /**
         * 渲染模版
         */
        render: function(container, data) {
            if (X.isObject(container)) {
                data = container;
                container = null;
            }
            container = container || this.container;
            container.html(this.applyTemplate(data));
        },

        // private
        getData: X.emptyFn
    });
});