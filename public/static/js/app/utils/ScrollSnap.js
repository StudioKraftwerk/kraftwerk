define([
    'underscore',
    'superhero',
    'app/utils/ScrollManager'
], function(_, Superhero, ScrollManager) {

    return Superhero.Module.extend({

        INPUT_TOUCH: 'touch',
        INPUT_SCROLL: 'scroll',

        _activeSnapPoint: 0,

        //intialize and setup

        initialize: function(options) {

            _.bindAll(this, '_calculateDraggableSnap', '_onDragHandler', 'snapToCurrentPoint');

            this.el = options.el;
            this._mousewheelContainer = options.mousewheelContainer || this.el;
            this._inputType = options.inputType || this.INPUT_SCROLL;

            this.updateSnapPoints(options.snapPoints || []);
            this.updateFreeScrollRanges(options.freeScrollRanges || []);

            (this._inputType === this.INPUT_SCROLL) ? this._setupScroll() : this._setupTouch();

        },

        _setupScroll: function() {

            if (Settings.isDesktop) ScrollManager.enableMousewheel(this._mousewheelContainer);
            this._setupScrollEventListeners();
            
        },

        _setupTouch: function() {
            // console.log('setup touch', this.el);

            var settings = {
                type:'y', 
                edgeResistance:0.5, 
                throwProps:true, 
                bounds: this.el.parentNode, 
                onDrag: this._onDragHandler, 
                onThrowUpdate:this._onDragHandler, 
                zIndexBoost: false, 
                minimumMovement: 6
            };

            if(!Settings.isMobile) {
                settings.snap = this._calculateDraggableSnap;
            }

            Draggable.create(this.el, settings);
            this._draggable = Draggable.get(this.el);
        },

        _setupScrollEventListeners: function() {

            this.listenTo(ScrollManager, 'scroll', this._scrollManagerScrollHandler);
            this.listenTo(ScrollManager, 'scroll:end', this._scrollManagerScrollEndHandler);
            this.listenTo(ScrollManager, 'mousewheel', this._scrollManagerMousewheelHandler);

        },

        //Public methods

        onClose: function() {
            //TODO: implemement

            if(this._draggable) {
                this._draggable.kill();
                this._draggable = null;
            }

            if (Settings.isDesktop) ScrollManager.disableMousewheel();

        },

        updateSnapPoints: function(snapPoints) {
            this._snapPoints = snapPoints;
            this._hasSnapPoints = this._snapPoints.length > 0;
        },

        updateFreeScrollRanges: function(freeScrollRanges) {
            this._freeScrollRanges = freeScrollRanges;
            this._hasFreeScrollRanges = this._freeScrollRanges.length > 0;
        },

        snapToNextPoint: function() {
            var index = Math.min(this._activeSnapPoint+1, this._snapPoints.length-1);
            this.snapToPoint(index);
        },

        snapToPreviousPoint: function() {
            var index = Math.max(this._activeSnapPoint-1, 0);
            this.snapToPoint(index);
        },

        snapToClosestPoint: function(y) {
            var index = this._findClosestSnapPoint(y);

            this.snapToPoint(index);
        },

        snapToCurrentPoint: function() {
            this.snapToPoint(this._activeSnapPoint);
        },

        snapToPoint: function(index) {
            this.moveToPosition(this._snapPoints[index]);
        },

        moveToPosition: function(y, duration) {

            if(this._inputType === this.INPUT_SCROLL) {
                ScrollManager.scrollTo(0, y || 0, duration);
            } else {
                duration = (duration === undefined) ? 1 : duration;
                TweenMax.killTweensOf(this.el);

                var _this = this;
                TweenMax.to(this.el, duration, {y: y, onUpdate:function(){
                   _this._draggable.update();
                   _this._triggerUpdateEvent(-_this._draggable.y);
                }}); //TODO: untested!
            }

            this._activeSnapPoint = this._findClosestSnapPoint(-y);

        },

        getScrollHeight: function() {
            return this.el.scrollHeight; //TODO: cache?
        },

        //Private methods

        _scrollOrSnap: function(direction, deltaY) {
            var y = ScrollManager.getScrollTop() + deltaY;
            // var y = ScrollManager.scrollTop() + deltaY;

            if(this._isInScrollableSection(y) || !this._hasSnapPoints) {
                ScrollManager.scrollTop(y);
            } else if(Math.abs(deltaY) > 20) {
                if(direction === ScrollManager.DIRECTION_DOWN) {
                   this.snapToNextPoint();
                } else {
                   this.snapToPreviousPoint();
                }
            }
        },

        _findClosestSnapPoint: function (y){

            var snapPoint, distance, ans;
            var closest = -1;

            for(var i = 0, limit = this._snapPoints.length; i < limit; i++) {
                snapPoint = this._snapPoints[i];
                distance = Math.abs(-snapPoint - y);

                if(distance < closest || closest === -1) {
                    closest = distance;
                    ans = i;
                }
            }

            return ans;
        },

        _calculateDraggableSnap: function(endValue) {
            if(this._isInScrollableSection(-this._draggable.y) && this._isInScrollableSection(-endValue)) return endValue;

            return this._snapPoints[this._findClosestSnapPoint(-endValue)];
        },

        _isInScrollableSection:function(y) {
            var range;

            for(var i = 0, limit = this._freeScrollRanges.length; i < limit; i++) {
                range = this._freeScrollRanges[i];
                if(-y < range.start && -y > range.end) return true;
            }

            return false;
        },

        _applyScroll: function(y) {
            // this.el.style.transform = 'translate3d(0,'+ -y + 'px, 0)'; //TODO implement crossbrowser property
            TweenMax.set(this.el, {y: -y});
        },

        _triggerUpdateEvent: function(y) {
            this._activeSnapPoint = this._findClosestSnapPoint(y);
            this.trigger('update', {y:y});
        },

        //Event handlers and callbacks

        _scrollManagerScrollHandler: function(e) {
            this._applyScroll(e.y);
            this._triggerUpdateEvent(e.y);
        },

        _scrollManagerScrollEndHandler: function(e) {
            if(this._hasSnapPoints && !this._isInScrollableSection(e.y)) this.snapToClosestPoint(e.y);
        },

        _scrollManagerMousewheelHandler: function(e) {
            if(!e.animating) this._scrollOrSnap(e.direction, e.deltaY);
        },

        _onDragHandler: function(e) {
            this._triggerUpdateEvent(-this._draggable.y);
        }


    });
});
