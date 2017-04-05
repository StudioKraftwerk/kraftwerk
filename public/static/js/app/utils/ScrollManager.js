define([
    'underscore',
    'superhero',
    'app/utils/ResizeManager'
    //'iscroll',
], function(_, Superhero, ResizeManager) {

    var ScrollManager = Superhero.Module.extend({

        DIRECTION_DOWN: 'direction:down',
        DIRECTION_UP: 'direction:up',

        PIXEL_STEP: 20,
        LINE_HEIGHT: 40,
        PAGE_HEIGHT: 800,

        _isScrollEnabled: true,

        _scrollTop: 0,

        _previousScrollTop: 0,

        _registeredScrollNotifications: [],

        _mousewheelEvent: (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel",

        initialize: function() {

            _.bindAll(this, '_scrollHandler', '_mousewheelHandler', '_scrollEndTimeoutHandler', '_checkElementScrolledIntoView', '_tickHandler', '_animatedScrollCompleteHandler', '_applyScrollTop');

            this._offsetCalculationsTick = 0;
            this._offsetCalculationsInterval = 200;

            this.scrollTop(0);
            this.setupEventListeners();

            window.scroll = this;

        },

        setupEventListeners:function() {
            window.addEventListener('scroll', this._scrollHandler);

            TweenMax.ticker.addEventListener("tick", this._tickHandler);
        },

        enableMousewheel:function(element) {
            this._mousewheelElement = element;
            this._mousewheelElement.addEventListener(this._mousewheelEvent, this._mousewheelHandler);
        },

        disableMousewheel:function() {
            this._mousewheelElement.removeEventListener(this._mousewheelEvent, this._mousewheelHandler);
        },

        enableScroll:function() {
            this._isScrollEnabled = true;
        },

        disableScroll:function() {
            this._isScrollEnabled = false;
        },

        calculateScrollDuration:function(x,y) {

            var duration = Math.min(ResizeManager.viewportHeight(), Math.abs(Math.abs(y) - Math.abs(this._scrollTop))) / 1000;
            return duration;
        },

        scrollTo:function(x, y, duration) {

            if(this._isAnimating) return;

            if (duration === undefined) {
                duration = this.calculateScrollDuration(x, y);
            }

            this._isAnimating = true;

            this._scrollTween = TweenMax.to(this, duration, {
                animatedScrollTop:-y,
                ease:Power1.easeInOut,
                onComplete: this._animatedScrollCompleteHandler
            });
        },

        getScrollTop: function() {
            return this._scrollTop;
        },

        _animatedScrollCompleteHandler: function() {

            var _this = this;

            setTimeout(function() {
                _this._isAnimating = false;
            },300);
        },

        _endAnimatedScroll: function() {
            if(this._isAnimating) this._scrollTween.kill();
            this._isAnimating = false;
        },

        _applyScrollTop:function(value) {

            if(value !== undefined) {
                document.body.scrollTop = document.documentElement.scrollTop = value;
            }

            return this._scrollTop;
        },

        animatedScrollTop: function(value) {
            this._isAnimating = true;
            return this._applyScrollTop(value);
        },

        scrollTop:function(value) {
            this._endAnimatedScroll();
            return this._applyScrollTop(value);
        },

        registerElementScrollNotification: function(element, callback, offset) {

            offset = offset || 0;

            this._registeredScrollNotifications.push({element:element, userOffset:offset, callback:callback});

            this._scrollNotificationsAdded = true;

            this.rafID = requestAnimationFrame(this._checkElementScrolledIntoView);
        },

        resetElementScrollNotifications: function() {

            if(this.rafID) cancelAnimationFrame(this.rafID);

            this._offsetCalculationsTick = 0;
            this._offsetCalculationsInterval = 200;

            this._registeredScrollNotifications = [];
        },

        _calculateElementOffsets:function () {
            if(this._scrollNotificationsAdded || this._offsetCalculationsTick % this._offsetCalculationsInterval === 0) {

                for(var i = 0, limit = this._registeredScrollNotifications.length; i < limit; i++) {
                    var notification = this._registeredScrollNotifications[i];
                    notification.offsetTop = this._getElementGlobalOffsetTop(notification.element) + notification.userOffset;
                }

                this._registeredScrollNotifications.sort(function(a,b) {
                    return a.offsetTop - b.offsetTop;
                });

                this._offsetCalculationsInterval *= 2;
            }

            this._scrollNotificationsAdded = false;

            this._offsetCalculationsTick++;
        },

        _checkElementScrolledIntoView: function() {

            this._calculateElementOffsets();

            var fold = this._scrollTop + ResizeManager.viewportHeight();

            for(var i = 0, limit = this._registeredScrollNotifications.length; i < limit; i++) {
                var notification = this._registeredScrollNotifications[i];

                if(notification && (fold > notification.offsetTop)) {
                    notification.callback(notification.element);
                } else {
                    break; //Don't bother looking for other elements
                }
            }

            this._registeredScrollNotifications.splice(0, i); //Remove all elements that have been called
        },

        _getElementGlobalOffsetTop: function(element, root) {

            var y = 0;
            while(true) {
                y += element.offsetTop;
                if(element.offsetParent === null || element.offsetParent === root){
                    break;
                }
                element = element.offsetParent;
            }

            return y;
        },

        _determineScrollDirection: function(scrollTop) {

            var direction = (this._previousScrollTop > scrollTop) ? this.DIRECTION_UP : this.DIRECTION_DOWN;

            this._previousScrollTop = scrollTop;

            return direction;

        },

        _determineMouseWheelDirection: function(spinY) {
            return (spinY < 0) ? this.DIRECTION_UP : this.DIRECTION_DOWN;
        },

        _updateValues: function() {
            this._scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

            this._scrollDirectionY = this._determineScrollDirection(this._scrollTop);
        },

        _normalizeMousewheelEvent: function(e) {
          var sX = 0,
              sY = 0,
              // spinX, spinY
              pX = 0,
              pY = 0; // pixelX, pixelY

          // Legacy
          if ('detail' in e) {
            sY = e.detail;
          }
          if ('wheelDelta' in e) {
            sY = -e.wheelDelta / 120;
          }
          if ('wheelDeltaY' in e) {
            sY = -e.wheelDeltaY / 120;
          }
          if ('wheelDeltaX' in e) {
            sX = -e.wheelDeltaX / 120;
          }

          // side scrolling on FF with DOMMouseScroll
          if ('axis' in e && e.axis === e.HORIZONTAL_AXIS) {
            sX = sY;
            sY = 0;
          }

          pX = sX * this.PIXEL_STEP;
          pY = sY * this.PIXEL_STEP;

          if ('deltaY' in e) {
            pY = e.deltaY;
          }
          if ('deltaX' in e) {
            pX = e.deltaX;
          }

          if ((pX || pY) && e.deltaMode) {
            if (e.deltaMode == 1) {
              // delta in LINE units
              pX *= this.LINE_HEIGHT;
              pY *= this.LINE_HEIGHT;
            } else {
              // delta in PAGE units
              pX *= this.PAGE_HEIGHT;
              pY *= this.PAGE_HEIGHT;
            }
          }

          // Fall-back if spin cannot be determined
          if (pX && !sX) {
            sX = pX < 1 ? -1 : 1;
          }
          if (pY && !sY) {
            sY = pY < 1 ? -1 : 1;
          }

            return {
                spinX: sX,
                spinY: sY,
                deltaX: pX,
                deltaY: pY
            };
        },

        _scrollHandler:function(e) {
            this._updateValues();
            this._requestScrollUpdate();
        },

        _mousewheelHandler: function(e) {

            e.preventDefault();

            if(!this._isScrollEnabled) return;

            var normalizedMousewheelEvent = this._normalizeMousewheelEvent(e);

            normalizedMousewheelEvent.direction = this._determineMouseWheelDirection(normalizedMousewheelEvent.spinY);
            normalizedMousewheelEvent.animating = this._isAnimating;

            this.trigger('mousewheel', normalizedMousewheelEvent);

        },

        _scrollEndTimeoutHandler:function(e) {
            this.trigger('scroll:end', {target:this, y:this._scrollTop});
        },

        _requestScrollUpdate: function() {
            this._scrollUpdateRequested = true;
        },

        _resetScrollEndDetection: function() {
            if(this._scrollEndTimeout) clearTimeout(this._scrollEndTimeout);
            if(!this._isAnimating) this._scrollEndTimeout = setTimeout(this._scrollEndTimeoutHandler, 500);
        },

        _tickHandler: function() {

            if(this._scrollUpdateRequested) {
                this._scrollUpdateRequested = false;

                this.trigger('scroll', {target:this,  y: this._scrollTop, directionY: this._scrollDirectionY, directionX: this._scrollDirectionX, animating:this._isAnimating});

                this._checkElementScrolledIntoView();

                this._resetScrollEndDetection();
            }

        }

    });

    return new ScrollManager();
});
