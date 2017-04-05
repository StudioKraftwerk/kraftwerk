define([
    'underscore',
    'superhero',
], function(_, Superhero) {

    var TouchManager = Superhero.Module.extend({

        SCROLLDIRECTION_UP    : 'up',
        SCROLLDIRECTION_DOWN  : 'down',
        SCROLLDIRECTION_LEFT  : 'left',
        SCROLLDIRECTION_RIGHT : 'right',

        touchStartX: 0,
        touchX: 0,
        swipeDistanceX: 0,

        touchStartY: 0,
        touchY: 0,
        swipeDistanceY: 0,

        currentTouch : null,

        initialize:function() {
           _.bindAll(this, '_windowTouchEndHandler', '_windowTouchStartHandler', '_windowTouchEndHandler', '_windowTouchMoveHandler');

           this.setupEventListeners();
        },

        setupEventListeners:function() {
            this.events = Modernizr.touch ? {
                    start  : 'touchstart',
                    move   : 'touchmove',
                    end    : 'touchend',
                    cancel : 'touchcancel'
                } : {
                    start  : 'mousedown',
                    move   : 'mousemove',
                    end    : 'mouseup',
                    cancel : 'mouseup'
                };

            if(Modernizr.touch) {
                document.addEventListener(this.events.move, this._windowTouchMoveHandler);
            }
            document.addEventListener(this.events.start, this._windowTouchStartHandler);
            document.addEventListener(this.events.end, this._windowTouchEndHandler);
            document.addEventListener(this.events.cancel, this._windowTouchEndHandler);
        },

        _windowTouchStartHandler: function(e) {
            e.preventDefault();
            this.currentTouch = Modernizr.touch ? e.changedTouches[0] : e;

            this.touchStartX = this.currentTouch.clientX;
            this.touchStartY = this.currentTouch.clientY;

            this.trigger('touchstart', {
                x : this.touchStartX,
                y : this.touchStartY,
                target : this.currentTouch.target
            });

            if(!Modernizr.touch) {
                document.addEventListener(this.events.move, this._windowTouchMoveHandler);
            }
        },

        _windowTouchMoveHandler: function(e) {

            this.currentTouch = Modernizr.touch ? e.changedTouches[0] : e;

            this.touchX = this.currentTouch.clientX;
            this.touchY = this.currentTouch.clientY;

            var properties = {
                distanceX : this.touchStartX - this.touchX,
                distanceY : this.touchStartY - this.touchY,
                target    : this.currentTouch.target
            };

            this.trigger('drag', properties);
        },

        _windowTouchEndHandler: function(e) {
            this.currentTouch = Modernizr.touch ? e.changedTouches[0] : e;

            this.touchX = this.currentTouch.clientX;
            this.touchY = this.currentTouch.clientY;

            this._triggerSwipeEvent(this.currentTouch.target);

            if(!Modernizr.touch) {
                document.removeEventListener(this.events.move, this._windowTouchMoveHandler);
            }
        },

        _triggerSwipeEvent: function(target) {
            this._updateSwipeDistance();

            var parameters = {
                direction : 'none',
                distance  : 0,
                target    : target
            };

            if(this.swipeDistanceX > this.swipeDistanceY) {
                parameters.distance = this.swipeDistanceX;

                if(this.touchStartX > this.touchX) {
                    parameters.direction = this.SCROLLDIRECTION_LEFT;
                } else {
                    parameters.direction = this.SCROLLDIRECTION_RIGHT;
                }

            } else {
                parameters.distance = this.swipeDistanceY;

                if(this.touchStartY > this.touchY) {
                    parameters.direction = this.SCROLLDIRECTION_UP
                } else {
                    parameters.direction = this.SCROLLDIRECTION_DOWN;
                }
            }

            this.trigger('touchend', parameters);

        },

        _updateSwipeDistance: function() {
            this.swipeDistanceY = Math.max(this.touchStartY, this.touchY) - Math.min(this.touchStartY, this.touchY);
            this.swipeDistanceX = Math.max(this.touchStartX, this.touchX) - Math.min(this.touchStartX, this.touchX);

            // console.log(this.swipeDistanceX, this.swipeDistanceY);
        }



    });

    return new TouchManager();

});
