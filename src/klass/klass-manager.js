/**
 * @class MX.klass.KlassManager
 */
(function(X) {
    "use strict";
    
    X.klass.KlassManager = function() {
        var classes = {};
        
        return {
            register: function(alias, klass) {
                classes[alias] = klass;
            },
            
            get: function(alias) {
                return X.isString(alias) ? classes[alias] : alias;
            },
            
            create: function(alias, config) {
                var cls = this.get(alias);
                return new cls(config);
            }
        };
    }();
    
    /**
     * @memberOf MX
     */
    X.reg = X.klass.KlassManager.register;
    
    X.reg('$', X.lib.jQuery);
    X.reg('jquery', X.lib.jQuery);
    X.lib.artTemplate && X.reg('arttemplate', X.lib.artTemplate);
    X.lib.iScroll && X.reg('iscroll', X.lib.iScroll);
    
    X.reg('klassmanager', X.klass.KlassManager);
})(MX);