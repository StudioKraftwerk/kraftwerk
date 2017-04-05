define([
    'superhero',
    'app/manifests/PreloaderEyeIconManifest',
    'app/manifests/PreloaderHandIconManifest',
    'app/manifests/PreloaderLightingIconManifest',
    'app/utils/ResizeManager',
], function(Superhero, PreloaderEyeIconManifest, PreloaderHandIconManifest, PreloaderLightingIconManifest, ResizeManager) {

    var _constructor = {
        FPS: 25
    };

    return Superhero.Module.extend({

        _triggerComplete: true,

        initialize: function(options) {

            options = options || {};
            this._canvas = options.canvas || undefined;
            this._manifest = this._getManifest(options.type);

            _.bindAll(
                this,
                '_tickHandler',
                '_playCompleteHandler',
                '_updateHandler'
            );

            this._setup();
            this._setupEventListeners();

        },

        onClose: function() {

            this._stage.close();
            if (this._tween) this._tween.kill();
            this._removeEventListeners();

        },

        _setup: function() {

            this._tweenObj = {cur: 0};

            this._setDimensions();
            this._createStage();
            this._createSprite();

        },

        _setupEventListeners: function() {

            TweenMax.ticker.addEventListener('tick', this._tickHandler);

        },

        _removeEventListeners: function() {

            TweenMax.ticker.removeEventListener('tick', this._tickHandler);

        },

        play: function() {

            var totalFrames = this._manifest.animation.endFrame;

            this._tween = TweenMax.fromTo(this._tweenObj, totalFrames / this.constructor.FPS, {cur: 0}, {
                cur: totalFrames,
                ease: Power0.easeNone,
                roundProps: 'cur',
                onUpdate: this._updateHandler,
                onComplete: this._playCompleteHandler
            });

            TweenMax.fromTo(this._canvas, 0.5, {alpha: 0}, {alpha: 1, ease: Power0.easeNone});

        },

        hideInstantly: function() {

            this._tween.pause();
            this._tweenObj.cur = 0;
            this._updateSprite();

        },

        _getManifest: function(type) {

            type = type || 'eye';

            var manifests = {
                eye: PreloaderEyeIconManifest,
                hand: PreloaderHandIconManifest,
                lighting: PreloaderLightingIconManifest,
            };

            return manifests[type];

        },

        _setDimensions: function() {

            var scale = 1;
            if (Settings.isTablet) scale = 0.75;
            if (Settings.isMobile) scale = 0.5;

            this._canvas.width = this._manifest.dimensions.width;
            this._canvas.height = this._manifest.dimensions.height;

            this._canvas.style.width = this._manifest.dimensions.width * scale + 'px';
            this._canvas.style.height = this._manifest.dimensions.height * scale + 'px';

        },

        _createStage: function() {

            this._stage = new createjs.Stage(this._canvas);
            this._stage.enableDOMEvents(false);

        },

        _createSprite: function() {

            var spriteSheet = new createjs.SpriteSheet(this._manifest);
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

        _playCompleteHandler: function() {

            this.trigger('animation:complete');

        },

        _updateHandler: function() {

            this._updateSprite();

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

    }, _constructor);

});
