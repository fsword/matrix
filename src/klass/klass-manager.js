/**
 * @author max<zhandaiping@gmail.com>
 * @class MX.klass.KlassManager
 */
(function() {
    "use strict";
    
    MX.klass.KlassManager = function() {
        var classes = {};
        
        return {
            register: function(alias, klass) {
                classes[alias] = klass;
            },
            
            create: function(alias, config) {
                return new classes[alias](config);
            }
        };
    };
    
    /**
     * @memberOf MX
     */
    MX.reg = MX.klass.KlassManager.register;
    
    MX.reg('$', window.jQuery);
    MX.reg('jquery', window.jQuery);
    MX.reg('template', window.template);
})();