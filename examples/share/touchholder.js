MX.ready('jquery', 'klass', function(X, $, Klass) {
    
    X.util.TouchHolder = Klass.define({
        alias: 'touchholder',
        
        extend: 'utility',
        
        type: 'h',
        
        initEvents: function() {
            this.addEvents('touchstart', 'touchmove', 'touchend');
            this.mon(this.target, 'touchstart', this.onTouchStart);
        },
        
        onTouchStart: function(e) {
            this.mun(this.target, 'touchmove', this.onTouchMove);
            this.mun(this.target, 'touchend', this.onTouchEnd);
            this.mon(this.target, 'touchmove', this.onTouchMove);
            this.mon(this.target, 'touchend', this.onTouchEnd);
            
            delete this.touchMoveVertical;
            
            this.touchCoords = {};
            this.touchCoords.startX = e.originalEvent.touches[0].pageX;
            this.touchCoords.startY = e.originalEvent.touches[0].pageY;
            this.touchCoords.timeStamp = e.timeStamp;
            
            this.handleTouchStart && this.handleTouchStart.call(this.scope || window, this);
            this.fireEvent('touchstart', this);
        },
        onTouchMove: function(e) {
            if (!this.touchCoords) {
                return;
            }
            
            this.touchCoords.stopX = e.originalEvent.touches[0].pageX;
            this.touchCoords.stopY = e.originalEvent.touches[0].pageY;
            
            var offsetX = this.touchCoords.startX - this.touchCoords.stopX,
                offsetY = this.touchCoords.startY - this.touchCoords.stopY,
                absX = Math.abs(offsetX),
                absY = Math.abs(offsetY);
            
            if (X.isDefined(this.touchMoveVertical)) {
                if (this.type == 'h') {
                    if (offsetX != 0) {
                        e.preventDefault();
                    }
                } else {
                    if (offsetY != 0) {
                        e.preventDefault();
                    }
                }
            } else {
                if (this.type == 'h') {
                    if (absX > absY) {
                        this.touchMoveVertical = false;
                        if (offsetX != 0) {
                            e.preventDefault();
                        }
                        if ((this.swept && this.swept === 'left' && offsetX > 0) ||
                            (this.swept && this.swept === 'right' && offsetX < 0) ||
                            (!this.swept && offsetX != 0)) {
                            e.preventDefault();
                        }
                    } else {
                        delete this.touchCoords;
                        return;
                    }
                } else {
                    if (absY > absX) {
                        this.touchMoveVertical = true;
                        if ((this.swept && this.swept === 'up' && offsetY > 0) ||
                            (this.swept && this.swept === 'down' && offsetY < 0) ||
                            (!this.swept && offsetY != 0)) {
                            e.preventDefault();
                        }
                    } else {
                        delete this.touchCoords;
                        return;
                    }
                }
            }
            
            this.handleTouchMove && this.handleTouchMove.call(this.scope || window, this);
            this.fireEvent('touchmove', this);
        },
        
        onTouchEnd: function(e) {
            this.mun(this.target, 'touchmove', this.onTouchMove);
            this.mun(this.target, 'touchend', this.onTouchEnd);
            if (!this.touchCoords) {
                return;
            }
            this.handleTouchEnd && this.handleTouchEnd.call(this.scope || window, this);
            this.fireEvent('touchend', this);
        },
        
        onDestroy: function() {
            this.mun(this.target, 'touchstart', this.onTouchStart);
            this.mun(this.target, 'touchmove', this.onTouchMove);
            this.mun(this.target, 'touchend', this.onTouchEnd);
            this.target = null;
        }
    });
    
});