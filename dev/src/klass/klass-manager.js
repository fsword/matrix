/**
 * @class MX.klass.KlassManager
 * @alias klassmanager
 *
 * 类管理器，管理类对象与alias的映射关系
 *
 * Matrix框架的几个依赖库的alias分别是：
 *      jQuery对应'$'或'jquery'
 *      artTemplate对应'arttemplate'
 *
 */
MX.kindle(function(X) {
    X.klass.KlassManager = function() {
        var classes = {};
        
        var pub = {
            /**
             * 为一个类对象注册一个alias
             * @param {String} alias 别名
             * @param {Class} klass 类对象
             */
            register: function(alias, klass) {
                classes[alias] = klass;
            },

            /**
             * 通过alias获取类对象
             * @param {String} alias 别名
             * @return {Class} 类对象
             */
            get: function(alias) {
                return X.isString(alias) ? classes[alias] : alias;
            },

            /**
             * 实例化一个类对象
             * @param {String} alias 别名
             * @param {Object} config 配置参数
             * @returns {Object} 实例对象
             */
            create: function(alias, config) {
                var cls = pub.get(alias);
                return new cls(config);
            }
        };
        
        return pub;
    }();
    
    /**
     * @memberOf MX
     * 为MX对象增加KlassManager.register()映射函数，使用MX.reg快速访问register函数
     * @param {String} alias 别名
     * @param {Class} klass 类对象
     */
    X.reg = X.klass.KlassManager.register;

    /**
     * @memberOf MX
     * 为MX对象增加KlassManager.get()映射函数，使用MX.getClass快速访问get函数
     * @param {String} alias 别名
     * @return {Class} 类对象
     */
    X.getClass = X.klass.KlassManager.get;
    
    /**
     * @memberOf MX
     * 为MX对象增加KlassManager.create()映射函数，使用MX.create快速访问create函数
     * @param {String} alias 别名
     * @param {Object} config 配置参数
     * @returns {Object} 实例对象
     */
    X.create = X.klass.KlassManager.create;

    // 注册几个MX框架依赖库的alias
    X.reg('$', X.lib.jQuery);
    X.reg('jquery', X.lib.jQuery);
    X.lib.artTemplate && X.reg('arttemplate', X.lib.artTemplate);

    X.reg('klassmanager', X.klass.KlassManager);
});