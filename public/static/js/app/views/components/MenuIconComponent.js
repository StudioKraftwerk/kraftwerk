define([
    'superhero',
    'app/utils/EventBus',
    'app/utils/FileLoader',
    'app/manifests/MenuIconWhiteManifest',
    'app/manifests/MenuIconBlackManifest'
], function(Superhero, EventBus, FileLoader, MenuIconWhiteManifest, MenuIconBlackManifest) {

    return Superhero.Component.extend({

        _fps: 35,

        ui: {
            canvas: '.button-main-menu-icon'
        },

        events: {
            'mouseenter': '_mouseEnterHandler',
            'mouseleave': '_mouseLeaveHandler',
            'tap': '_tapHandler'
        },

        initialize: function() {

            _.bindAll(
                this,
                '_tickHandler',
                '_updateHandler',
                '_completeHandler',
                '_closeAnimationCompleteHandler'
            );

            this._fileLoader = new FileLoader();
            this._tweenObj = {cur: 0};

        },

        onInitialized: function() {

            this._getColor();
            this._setDimensions();
            this._createStage();
            this._createSprite();
            this._setupEventListeners();

        },

        onClose: function() {

            this._stage.close();
            this._removeEventListeners();

            if (this._hoverTimeline) this._hoverTimeline.kill();

        },

        _setupEventListeners: function() {

            this.listenTo(EventBus, 'menu:open', this._eventOpenHandler);
            this.listenTo(EventBus, 'menu:close', this._eventCloseHandler);
            this.listenTo(EventBus, 'menu:mouse:enter', this._eventMouseEnterHandler);
            this.listenTo(EventBus, 'menu:mouse:leave', this._eventMouseLeaveHandler);
            TweenMax.ticker.addEventListener('tick', this._tickHandler);

        },

        _removeEventListeners: function() {

            TweenMax.ticker.removeEventListener('tick', this._tickHandler);

        },

        _startMouseEnterAnimation: function() {

            if (this._isActive) {
                if (!this._isAnimating) {
                    TweenMax.fromTo(this.el, 0.35, {rotation: -90}, {rotation: 0, ease: Back.easeInOut});
                }
            } else {
                // this._isAnimating = true;
                TweenMax.to(this._tweenObj, 7 / this._fps, {cur: 7, ease: Power0.easeNone, roundProps: 'cur', onUpdate: this._updateHandler, onComplete: this._completeHandler});
            }

        },

        _startMouseLeaveAnimation: function() {

            if (!this._isActive) {
                // this._isAnimating = true;
                TweenMax.to(this._tweenObj, 5 / this._fps, {cur: 0, ease: Power0.easeNone, roundProps: 'cur', onUpdate: this._updateHandler, onComplete: this._completeHandler});
            }

        },

        _startOpenAnimation: function() {

            this._isAnimating = true;
            TweenMax.fromTo(this._tweenObj, 18 / this._fps, {cur: 7}, {cur: 25, ease: Power0.easeNone, roundProps: 'cur', onUpdate: this._updateHandler, onComplete: this._completeHandler});

        },

        _startCloseAnimation: function() {

            this._isAnimating = true;
            TweenMax.to(this._tweenObj, 15 / this._fps, {cur: 40, ease: Power0.easeNone, roundProps: 'cur', onUpdate: this._updateHandler, onComplete: this._closeAnimationCompleteHandler});

        },

        _getColor: function() {

            this._color = this.ui.canvas.dataset.color || 'white';

        },

        _setDimensions: function() {

            var data = this._getData();
            this.ui.canvas.width = data.dimensions.width;
            this.ui.canvas.height = data.dimensions.height;

        },

        _createStage: function() {

            this._stage = new createjs.Stage(this.ui.canvas);
            this._stage.enableDOMEvents(false);

        },

        _createSprite: function() {

            var spriteSheet = new createjs.SpriteSheet(this._getData());
            this._sprite = new createjs.Sprite(spriteSheet);
            this._sprite.x = 0;
            this._sprite.y = 0;

            this._stage.addChild(this._sprite);

            this._requestStageUpdate();

        },

        _updateSprite: function() {

            if (this._tweenObj.cur === this._tweenObj.prev) return false;

            this._sprite.gotoAndStop(this._tweenObj.cur);
            this._tweenObj.prev = this._tweenObj.cur;
            this._requestStageUpdate();

        },

        _getData: function() {

            var manifest = this._color === 'black' ? MenuIconBlackManifest : MenuIconWhiteManifest;
            return this._getPPI() > 1 ? manifest.retina : manifest.normal;

        },

        _getPPI: function() {

            var PPI = 1;
            var ratio = window.devicePixelRatio || 1;

            if (ratio > 2.5) PPI = 3;
            if (ratio > 1.5) PPI = 2;

            return PPI;

        },

        _updateHandler: function() {

            this._updateSprite();

        },

        _completeHandler: function() {

            this._isAnimating = false;

        },

        _mouseEnterHandler: function(e) {

            EventBus.trigger('menu:mouse:enter');

        },

        _mouseLeaveHandler: function(e) {

            EventBus.trigger('menu:mouse:leave');

        },

        _tapHandler: function(e) {

            if (this._isActive) {
                EventBus.trigger('menu:close');
            } else {
                EventBus.trigger('menu:open');
            }

        },

        _closeAnimationCompleteHandler: function(e) {

            this._tweenObj.cur = 0;
            this._isActive = false;
            this._isAnimating = false;

        },

        _eventOpenHandler: function(e) {

            this._isActive = true;
            this._startOpenAnimation();

        },

        _eventCloseHandler: function(e) {

            this._startCloseAnimation();

        },

        _eventMouseEnterHandler: function(e) {

            this._startMouseEnterAnimation();

        },

        _eventMouseLeaveHandler: function(e) {

            this._startMouseLeaveAnimation();

        },

        _requestStageUpdate: function() {

            this._updateStage = true;

        },

        _tickHandler: function(e) {

            if (this._stage && this._updateStage) {
                this._updateStage = false;
                this._stage.update();
            }

        }

    });

});
