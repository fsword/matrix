/**
 * @class MX.app.Controller
 */
MX.kindle('klass', function(X, Klass) {
    "use strict";
    
    X.app.Controller = Klass.define({
        // private
        alias: 'controller',
        
        // private
        extend: 'utility',
        
        // private
        initEvents: function() {
            this.addEvents(
                /**
                 * @event pagebeforeshow
                 */
                'pagebeforeshow',
                /**
                 * @event pageshow
                 */
                'pageshow',
                /**
                 * @event pagebeforehide
                 */
                'pagebeforehide',
                /**
                 * @event pagehide
                 */
                'pagehide'
            );
        },
        
        // private
        beforePageShow: X.emptyFn,
        
        // private
        onPageShow: X.emptyFn,
        
        // private
        beforePageHide: X.emptyFn,
        
        // private
        onPageHide: X.emptyFn
    });
});