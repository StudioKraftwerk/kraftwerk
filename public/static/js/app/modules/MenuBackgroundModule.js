define([
    'superhero',
    'app/manifests/MenuBackgroundManifest',
    'app/utils/ResizeManager',
    'app/utils/FileLoader',
], function(Superhero, MenuBackgroundManifest, ResizeManager, FileLoader) {

    var _constructor = {
        FPS: 25
    };

    return Superhero.Module.extend({

        initialize: function(options) {

            options = options || {};
            this._canvas = options.canvas || undefined;

            _.bindAll(
                this,
                'show',
                '_tickHandler',
                '_updateHandler'
            );

            this._fileLoader = new FileLoader();

            this._setup();
            this._setupEventListeners();

        },

        onClose: function() {

            this._stage.close();
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

        show: function() {

            this._showTween = TweenMax.fromTo(this._tweenObj, 43 / this.constructor.FPS, {cur: 0}, {
                cur: 43,
                ease: Power0.easeNone,
                roundProps: 'cur',
                onUpdate: this._updateHandler
            });

        },

        hideInstantly: function() {

            this._showTween.pause();
            this._tweenObj.cur = 0;
            this._updateSprite();

        },

        _setDimensions: function() {

            this._canvas.width = MenuBackgroundManifest.dimensions.width;
            this._canvas.height = MenuBackgroundManifest.dimensions.height;

        },

        _createStage: function() {

            this._stage = new createjs.Stage(this._canvas);
            this._stage.enableDOMEvents(false);

        },

        _createSprite: function() {

            MenuBackgroundManifest.images = [
                this._fileLoader.getFile('menu-background-0'),
                this._fileLoader.getFile('menu-background-1'),
                this._fileLoader.getFile('menu-background-2'),
                this._fileLoader.getFile('menu-background-3'),
                this._fileLoader.getFile('menu-background-4'),
                this._fileLoader.getFile('menu-background-5')
            ];

            var spriteSheet = new createjs.SpriteSheet(MenuBackgroundManifest);
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
