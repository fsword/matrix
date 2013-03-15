/**
 * @author max<zhandaiping@gmail.com>
 * @class MX
 */
(function() {
    "use strict";
    
    var arrayProto = Array.prototype,
        slice = arrayProto.slice,
        splice = arrayProto.splice,
        objectPrototype = Object.prototype,
        toString = objectPrototype.toString;
    
    if (typeof MX === 'undefined') {
        window.MX = {};
    }
    
    /**
     * The version of the framework
     */
    MX.version = '@VERSION';
    
    /**
     * 声明命名空间
     */
    MX.namespace = function() {
        var len1 = arguments.length,
            i = 0,
            len2,
            j,
            main,
            ns,
            sub,
            current;
        
        for(; i < len1; ++i) {
            main = arguments[i];
            ns = arguments[i].split('.');
            current = window[ns[0]];
            if (current === undefined) {
                current = window[ns[0]] = {};
            }
            sub = ns.slice(1);
            len2 = sub.length;
            for(j = 0; j < len2; ++j) {
                current = current[sub[j]] = current[sub[j]] || {};
            }
        }
        return current;
    };
    
    /**
     * 
     */
    MX.ns = MX.namespace;
    
    MX.ns('MX.klass', 'MX.app', 'MX.lib', 'MX.util');
    
    MX.kindle = function() {
        
    
    };
    
})();