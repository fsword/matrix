/**
 * @class MX.app.Template
 * @alias template
 *
 * 模版封装类，Matrix框架使用了高速模版引擎artTemplate，主要用来支持View视图的页面渲染
 *
 * Matrix框架Appliaction在启动时，会自动加载模版文件，模版内容会生成一个DOM元素插入到body中
 * 模版代码格式如下：
 *  <script id="index-body-template" type="text/tmpl">
 *      <div>
 *          <#= value #>
 *      </div>
 *  </script>
 *
 * 每一个模版片段都必须要有唯一的id标识
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
         * @cfg {String} target 绑定目标模版DOM的id
         */
        
        /**
         * @cfg {String} template 模版HTML String
         * 如果未设置target，那么，也可以直接传入一个HTML字符串
         */

        /**
         * @cfg {Function} getData 获取模版中应用的数据
         * 包含参数：
         *  - Object : data 传入的原始data
         *
         * <code>
         *  var tmpl = new Template({
         *      template: '<div><#= value #></div>',
         *      getData: function(data) {
         *          // 这里将原始的data重新包装并返回
         *          return {
         *              value: 'Max say: ' + data.value
         *          };
         *      }
         *  });
         *
         *  var html = tmpl.applyTemplate({
         *      value: 'hello world'
         *  });
         *
         *  // 输出'<div>Max say: hello world</div>'
         *  alert(html);
         * <//code>
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
         * 获得模版生成的HTML代码片段
         * 例如，模版为：
         *  <script id="index-body-template" type="text/tmpl">
         *      <div>
         *          <#= value #>
         *      </div>
         *  </script>
         *
         * 调用接口:
         * <code>
         *   template.applyTemplate({
         *       value: 'hello world'
         *   });
         * </code>
         *
         * 返回字符串:
         *  <div>
         *      hello world
         *  </div>
         *
         * @param {Object} data 模版中应用的数据
         * @return {String} html碎片
         */
        applyTemplate: function(data) {
            if (this.template) {
                // getData()与this.params这两个接口是从View中调用
                // 在View.render()中会设置
                data = this.getData(this.params, data || {});

                return this.template(data || {});
            }
            return '';
        },
        
        /**
         * 将模版生成的html，直接渲染到绑定的容器element中
         * @param {Object/Element} container (optional) 模版容器
         * @param {Object} data (optional) 模版中应用的数据
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
        getData: function(params, data) {
            return data;
        },

        /**
         * 为模版绑定一个model或store实例对象，监听store的'load'事件，
         * 当store加载数据成功时，自动将模版渲染到容器中
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
         * 移除已绑定的store
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