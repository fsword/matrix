MX.ready('jquery', function(X, $) {
    X.util.iScrollUtil = {
        createScroll: function(type, wrapper, options) {
            var hScroll = (type == 'h' || type == 'horizontal'),
                config;
            
            options = options || {};
            config = {
                hScroll: hScroll,
                vScroll: !hScroll,
                hScrollbar: options.hScrollbar,
                vScrollbar: options.vScrollbar,
                useTransform: true,
                useTransition: true,
                handleClick: false,
                checkDOMChanges: false,
                topOffset: options.topOffset || 0,
                x: options.x || 0,
                y: options.y || 0,
                onRefresh: options.onRefresh,
                onBeforeScrollStart: function(e) {
                    var that = this;
                    delete that.touchMoveVertical;
                    that.touchCoords = {};
                    that.touchCoords.startX = e.touches[0].pageX;
                    that.touchCoords.startY = e.touches[0].pageY;
                    options.onBeforeScrollStart && options.onBeforeScrollStart.call(that, e);
                },
                onBeforeScrollMove: function(e) {
                    var that = this;
                    if (!that.touchCoords) {
                        return false;
                    }
                    
                    that.touchCoords.stopX = e.touches[0].pageX;
                    that.touchCoords.stopY = e.touches[0].pageY;
                    
                    var offsetX = that.touchCoords.startX - that.touchCoords.stopX,
                        offsetY = that.touchCoords.startY - that.touchCoords.stopY,
                        absX = Math.abs(offsetX),
                        absY = Math.abs(offsetY),
                        isPreventDefault;
            
                    if (options.beforeScrollPreventDefault === false) {
                        var nodeType = e.explicitOriginalTarget ? e.explicitOriginalTarget.nodeName.toLowerCase() : (e.target ? e.target.nodeName.toLowerCase() : '');
                        if (nodeType != 'select' && nodeType != 'option' && nodeType != 'input' && nodeType != 'textarea') {
                            isPreventDefault = true;
                        }
                    } else {
                        isPreventDefault = true;
                    }
                            
                    if (typeof that.touchMoveVertical !== 'undefined') {
                        if (that.options.hScroll) {
                            if (offsetX != 0 && isPreventDefault) {
                                e.preventDefault();
                            }
                        } else {
                            if (offsetY != 0 && isPreventDefault) {
                                e.preventDefault();
                            }
                        }
                    } else {
                        if (that.options.hScroll) {
                            if (absX > absY) {
                                that.touchMoveVertical = false;
                                if (offsetX != 0 && isPreventDefault) {
                                    e.preventDefault();
                                }
                            } else {
                                delete that.touchCoords;
                                return false;
                            }
                        } else {
                            if (absY > absX) {
                                that.touchMoveVertical = true;
                                if (offsetY != 0 && isPreventDefault) {
                                    e.preventDefault();
                                }
                            } else {
                                delete that.touchCoords;
                                return false;
                            }
                        }
                    }
                    
                    options.onBeforeScrollMove && options.onBeforeScrollMove.call(that, e);
                },
                onBeforeScrollEnd: function() {
                    var that = this;
                    if (!that.touchCoords) {
                        return false;
                    }
                },
                onScrollMove: options.onScrollMove,
                onScrollEnd: options.onScrollEnd,
                onTouchEnd: options.onTouchEnd
            };
            
            return new iScroll(wrapper[0] || wrapper, $.extend({}, options, config));
        }
    };
    
    X.reg('iscrollutil', X.util.iScrollUtil);
});