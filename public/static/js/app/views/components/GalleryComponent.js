define([
    'superhero',
    'app/utils/ResizeManager',
    'app/views/components/CaseLazyComponent',
], function(Superhero, ResizeManager, CaseLazyComponent) {

    return CaseLazyComponent.extend({

        MARGIN_SLIDE: 64,

        _currentSlideId: 0,
        _isAnimating: false,
        _slidesArray: [],
        _timeline: null,

        ui: {
            slides: '.list-item'
        },

        initialize: function() {

            this._currentSlideId = 0;
            this._isAnimating = false;
            this._slidesArray = [];
            this._timeline = new TimelineMax({paused: true});

            _.bindAll(
                this,
                '_animateOnCompleteHandler'
            );

        },

        onInitializedLazy: function(options) {

            this._setupEventListerners();

            this._reorderSlides();
            this._resize();

        },

        _setupEventListerners: function() {

            this.listenTo(ResizeManager, 'resize', this._resizeHandler);
            this.listenTo(ResizeManager, 'resize:complete', this._resizeHandler);

        },


        goto: function(index) {

            if (index > this._currentSlideId) this.next(index - this._currentSlideId);
            if (index < this._currentSlideId) this.previous(this._currentSlideId - index);

        },

        next: function(steps) {

            if (this._isAnimating) return;

            steps = steps || 1;

            this._timeline.clear();
            for (var i = 0; i < steps; i++) {
                this._slidesArray.push(this._slidesArray.shift());
                this._addStepToTimeline(1, i);
                this._currentSlideId++;

                if (this._currentSlideId >= this._slidesArray.length) this._currentSlideId = 0;
            }

            this._animate();

        },

        previous: function(steps) {

            if (this._isAnimating) return;

            steps = steps || 1;

            this._timeline.clear();
            for (var i = 0; i < steps; i++) {
                this._slidesArray.unshift(this._slidesArray.pop());
                this._addStepToTimeline(-1, i);
                this._currentSlideId--;

                if (this._currentSlideId < 0) this._currentSlideId = this._slidesArray.length - 1;
            }

            this._animate();

        },

        _addStepToTimeline: function(direction, step) {

            var duration = 0.75;

            for (var i = 0, len = this._slidesArray.length; i < len; i++) {
                this._timeline.fromTo(this._slidesArray[i], duration, {x: (i + (1 * direction)) * this._widthSlide}, {ease: Linear.easeNone, force3D: true, x: i * this._widthSlide}, duration * step);
            }

        },

        _animate: function() {

            this._isAnimating = true;
            this.trigger('transition:start', {id: this._currentSlideId});

            TweenMax.to(this._timeline, 0.75, {ease: Power2.easeInOut, progress: 1, onComplete: this._animateOnCompleteHandler});

        },

        _reorderSlides: function() {

            // Convert to array
            for (var i = 0, len = this.ui.slides.length; i < len; i++) {
                this._slidesArray.push(this.ui.slides[i]);
            }

            // Reorder
            var centerSlideId = 2;
            for(var j = 0; j < centerSlideId; j++) {
               this._slidesArray.unshift(this._slidesArray.pop());
            }

        },

        _positionSlides: function() {

            for (var i = 0, len = this._slidesArray.length; i < len; i++) {
                TweenMax.set(this._slidesArray[i], {x: i * this._widthSlide});
            }

        },

        _getWidthSlide: function() {

            this._widthSlide = this.ui.slides[0].offsetWidth + this.MARGIN_SLIDE || 0;

        },

        _setOffsetSlider: function() {

            this.el.style.left = (-this._widthSlide * 2) + 'px';

        },

        _resize: function() {

            this._getWidthSlide();
            this._setOffsetSlider();
            this._positionSlides();

        },

        _resizeHandler: function() {

            this._resize();

        },

        _animateOnCompleteHandler: function(direction) {

            this._isAnimating = false;
            this.trigger('transition:complete');

        },

    });
});
