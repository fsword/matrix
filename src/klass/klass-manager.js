/**
 * @class MX.klass.KlassManager
 */
(function(X) {
    X.klass.KlassManager = function() {
        var classes = {};
        
        var pub = {
            register: function(alias, klass) {
                classes[alias] = klass;
            },
            
            get: function(alias) {
                return X.isString(alias) ? classes[alias] : alias;
            },
            
            create: function(alias, config) {
                var cls = pub.get(alias);
                return new cls(config);
            }
        };
        
        return pub;
    }();
    
    /**
     * @memberOf MX
     */
    X.reg = X.klass.KlassManager.register;

    /**
     * @memberOf MX
     */
    X.getClass = X.klass.KlassManager.get;
    
    /**
     * @memberOf MX
     */
    X.create = X.klass.KlassManager.create;
    
    X.reg('$', X.lib.jQuery);
    X.reg('jquery', X.lib.jQuery);
    X.lib.artTemplate && X.reg('arttemplate', X.lib.artTemplate);
    X.lib.iScroll && X.reg('iscroll', X.lib.iScroll);
    
    X.reg('klassmanager', X.klass.KlassManager);
})(MX);