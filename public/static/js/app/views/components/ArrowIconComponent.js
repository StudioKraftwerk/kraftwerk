define([
    'superhero',
    'app/utils/FileLoader',
    'app/manifests/ArrowIconWhiteManifest',
    'app/manifests/ArrowIconBlackManifest',
], function(Superhero, FileLoader, ArrowIconWhiteManifest, ArrowIconBlackManifest) {

    return Superhero.Component.extend({

        _fps: 25,

        initialize: function() {

            this._options = {};
            this._options.color = this.el.dataset.color || 'white';

            _.bindAll(
                this,
                'show',
                'pulse',
                '_tickHandler',
                '_updateHandler',
                '_hoverTimelineCompleteHandler'
            );

            this._tweenObj = {cur: 0};

            this._fileLoader = new FileLoader();

        },

        onInitialized: function() {

            this._setDimensions();
            this._createStage();
            this._createSprite();
            this._createTimelines();
            this._setupEventListeners();

        },

        onClose: function() {

            this._stage.close();
            this._removeEventListeners();

            if (this._pulseTimeline) this._pulseTimeline.kill();
            if (this._hoverTimeline) this._hoverTimeline.kill();

        },

        _setupEventListeners: function() {

            TweenMax.ticker.addEventListener('tick', this._tickHandler);

        },

        _removeEventListeners: function() {

            TweenMax.ticker.removeEventListener('tick', this._tickHandler);

        },

        show: function() {

            TweenMax.fromTo(this._tweenObj, 14 / this._fps, {cur: 0}, {cur: 14, ease: Power0.easeNone, roundProps: 'cur', onUpdate: this._updateHandler});

        },

        stop: function() {

            if (this._pulseTimeline) {
                this._pulseTimeline.pause();
                this._pulseTimeline.progress(0);
                this._requestStageUpdate();
            }

        },

        pulse: function() {

            this._pulseTimeline.play(0);

        },

        hover: function() {

            if (this._isHoverAnimating) return;
            this._isHoverAnimating = true;

            this._hoverTimeline.play(0);

        },

        _createTimelines: function() {

            this._hoverTimeline = new TimelineMax({paused: true, onComplete: this._hoverTimelineCompleteHandler});
            this._hoverTimeline.fromTo(this._tweenObj, 13 / this._fps, {cur: 13}, {cur: 27, ease: Power0.easeNone, roundProps: 'cur', onUpdate: this._updateHandler});
            this._hoverTimeline.fromTo(this._tweenObj, 14 / this._fps, {cur: 0}, {cur: 14, ease: Power0.easeNone, roundProps: 'cur', onUpdate: this._updateHandler});

            this._pulseTimeline = new TimelineMax({paused: true, repeat: -1, repeatDelay: 0.3});
            this._pulseTimeline.fromTo(this._tweenObj, 14 / this._fps, {cur: 0}, {cur: 14, ease: Power0.easeNone, roundProps: 'cur', onUpdate: this._updateHandler});
            this._pulseTimeline.fromTo(this._tweenObj, 13 / this._fps, {cur: 13}, {cur: 27, ease: Power0.easeNone, roundProps: 'cur', onUpdate: this._updateHandler}, 2.5);

        },

        _setDimensions: function() {

            var data = this._getData();
            this.el.width = data.dimensions.width;
            this.el.height = data.dimensions.height;

        },

        _createStage: function() {

            this._stage = new createjs.Stage(this.el);
            this._stage.enableDOMEvents(false);

        },

        _createSprite: function() {

            var spriteSheet = new createjs.SpriteSheet(this._getData());
            this._sprite = new createjs.Sprite(spriteSheet);
            this._sprite.x = 0;
            this._sprite.y = 0;

            this._stage.addChild(this._sprite);
            this._stage.update();

        },

        _updateSprite: function() {

            if (this._tweenObj.cur === this._tweenObj.prev) return false;

            this._sprite.gotoAndStop(this._tweenObj.cur);
            this._tweenObj.prev = this._tweenObj.cur;
            this._requestStageUpdate();

        },

        _getData: function() {

            var manifest = this._options.color === 'black' ? ArrowIconBlackManifest : ArrowIconWhiteManifest;
            manifest = this._getPPI() > 1 ? manifest.retina : manifest.normal;

            if (this._options.color === 'white') manifest.images = [this._fileLoader.getFile('arrow-white')];
            if (this._options.color === 'black') manifest.images = [this._fileLoader.getFile('arrow-black')];

            return manifest;

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

        _hoverTimelineCompleteHandler: function(e) {

            this._isHoverAnimating = false;

        },

        _requestStageUpdate: function() {

            this._updateStage = true;

        },

        _tickHandler: function(e) {

            if (this._stage && this._updateStage) {
                this._updateStage = false;
                this._stage.update();
                // console.log('tick', this.cid);
            }

        }

    });

});
