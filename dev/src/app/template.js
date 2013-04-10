/**
 * @class MX.app.Template
 * @alias template
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
            if (this.store) {
                this.bindStore(this.store, true);
                delete this.store;
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

            // getData()与this.params这两个接口是从View中调用
            // 在View.render()中会设置
            data = this.getData(this.params, data || {});

            container.html(this.applyTemplate(data));
        },

        // private
        getData: function(params, data) {
            return data;
        },

        /**
         * 绑定store
         */
        bindStore: function(store, /*private*/initial) {
            if (initial !== true) {
                this.unbindStore();
            }
            if (store) {
                this.store = store;
                // TODO 是否应当绑定datachanged事件？实时响应数据更改，刷新页面
                this.mon(this.store, 'load', this.onStoreLoad);
            }
        },

        /**
         * 移除绑定store
         */
        unbindStore: function() {
            if (this.store) {
                this.mun(this.store, 'load', this.onStoreLoad);
                this.store = null;
            }
        },

        // private
        onStoreLoad: function() {
            var data, store = this.store;
            if (store.isModel) {
                data = store.get();
            } else {
                data = {};
                data[store.dataProperty] = store.get();
            }
            this.render(data);
        },

        // private
        onDestroy: function() {
            this.unbindStore();
        }
    });
});