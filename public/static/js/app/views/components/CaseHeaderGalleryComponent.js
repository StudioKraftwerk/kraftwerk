define([
    'superhero',
    'app/utils/FileLoader',
    'app/utils/ResizeManager',
    'app/utils/GlitchFilter',
    'app/utils/DistortFilter',
    'app/models/CaseCollection',
], function(Superhero, FileLoader, ResizeManager, GlitchFilter, DistortFilter, CaseCollection) {

    return Superhero.Component.extend({

        GLITCH_REFRESHRATE: 4,
        GLITCH_LINES_X: 4,
        GLITCH_LINES_Y: 30,

        DISTORT_REFRESHRATE: 2,
        DISTORT_LINES_X: 1,
        DISTORT_LINES_Y: 300,

        ui: {
            background: '.case-header-background',
            content: '.case-header-list-item',
            titles: '.case-header-copy-title-label',
            titleLines: '.case-header-copy-title-line',
            taglines: '.case-header-copy-tagline',
            arrows: '.sprite-animation-arrow'
        },

        initialize: function(options) {

            _.bindAll(
                this,
                'show',
                '_requestStageUpdate',
                '_tickHandler',
                // '_assetLoadComplete',
                '_transitionCompleteHandler',
                '_showCompleteHandler'
            );

            this._options = options || {};
            this._options.useDefaultAnimation = (this._options.useDefaultAnimation === false) ? false : true;

            this._isAnimating = false;

            this._previousSlideId = null;
            this._currentSlideId = 0;

            this._fileLoader = new FileLoader();

        },

        onInitialized: function() {

            this._width = ResizeManager.viewportWidth();
            this._height = ResizeManager.viewportHeight();

            this.glitchFilter = new createjs.GlitchFilter(this.GLITCH_REFRESHRATE, this.GLITCH_LINES_X, this.GLITCH_LINES_Y); // amount and strength
            this.distortFilter = new createjs.DistortFilter(this.DISTORT_REFRESHRATE, this.DISTORT_LINES_X, this._height); // amount and strength

            this._setupEventListeners();

            this._createStage();
            this._createStageSlider();
            this._createSlides();
            this._addSlider();
            this._resize();

            this._gotoActiveSlide();

        },

        onClose: function() {

            this._removeEventListeners();
            this._stage.close();

        },

        show: function() {

            this._sliderWithGlitch.cache(0, 0, this._width, this._height, 0.4); // last number = quality
            this._sliderContainer.cache(0, 0, this._width, this._height, 0.5); // last number = quality

            TweenMax.fromTo(this._slider, 0.5, {scaleX: 1.4, scaleY: 1.4}, {scaleX: 1, scaleY: 1, ease: Power3.easeOut, onUpdate: this._requestStageUpdate});

            if(this._sliderWithGlitch) TweenMax.fromTo(this._sliderWithGlitch, 0.4, {alpha:0}, { alpha:1, repeat:1, yoyo:true, ease: Power1.easeIn, onUpdate:this._requestStageUpdate, onComplete: this._showCompleteHandler});
            if(this._sliderNoise) TweenMax.fromTo(this._sliderNoise, 0.4, {alpha:0}, { alpha:1, repeat:1, yoyo:true, ease: Power1.easeIn, onUpdate:this._requestStageUpdate});

        },

        next: function() {

            if(this._isAnimating) return;

            this._swapSlideIds();

            this._currentSlideId++;
            if(this._currentSlideId > this._slider.children.length-1) {
                this._currentSlideId = 0;
            }

            this._animate({
                direction: -1
            });

        },

        previous: function() {

            if(this._isAnimating) return;

            this._swapSlideIds();

            this._currentSlideId--;
            if(this._currentSlideId < 0) {
                this._currentSlideId = this._slider.children.length-1;
            }

            this._animate({
                direction: 1
            });

        },

        gotoAndPlay: function(id) {

            if(this._isAnimating || id > this._slider.children.length-1 || id < 0) return;

            this._swapSlideIds();

            this._currentSlideId = id;

            this._animate();

        },

        gotoInstantly: function(id) {

            this._swapSlideIds();
            this._currentSlideId = id;

            this._previousSlide = this._slider.getChildAt(this._previousSlideId);
            this._currentSlide = this._slider.getChildAt(this._currentSlideId);

            this._previousSlideContent = this.ui.content[this._previousSlideId];
            this._currentSlideContent = this.ui.content[this._currentSlideId];

            if (this._previousSlideContent) TweenMax.set(this._previousSlideContent, {alpha: 0, x: this._width});
            if (this._currentSlideContent) TweenMax.set(this._currentSlideContent, {alpha: 1, x: 0});

            if (this._previousSlide) TweenMax.set(this._previousSlide, {x: this._width});
            if (this._currentSlide) TweenMax.set(this._currentSlide, {x: 0});

            this._requestStageUpdate();

        },

        _setupEventListeners : function() {

            TweenMax.ticker.addEventListener('tick', this._tickHandler);
            this.listenTo(ResizeManager, 'resize', this._resizeHandler);
            this.listenTo(ResizeManager, 'resize:complete', this._resizeHandler);

        },

        _removeEventListeners : function() {

            TweenMax.ticker.removeEventListener('tick', this._tickHandler);

        },

        _resize: function() {

            this._width  = ResizeManager.viewportWidth();
            this._height = ResizeManager.viewportHeight();

            this._defaultResize();

            this._resizeStage();
            this._resizeSlides();
            this._resizeSliderNoise();

            this._requestStageUpdate();

            this._swapSlideIds();

        },


        // Carousel

        _animate: function(options) {

            this._sliderWithGlitch.cache(0, 0, this._width, this._height, 0.4); // last number = quality
            this._sliderContainer.cache(0, 0, this._width, this._height, 0.5); // last number = quality


            if(this._isAnimating || this._currentSlideId === this._previousSlideId) return;
            this._isAnimating = true;

            options = options || {};
            options.direction = options.direction || this._direction();

            this._previousSlide = this._slider.getChildAt(this._previousSlideId);
            this._currentSlide = this._slider.getChildAt(this._currentSlideId);

            this._previousSlideContent = this.ui.content[this._previousSlideId];
            this._currentSlideContent = this.ui.content[this._currentSlideId];

            // this.trigger('transition:start', {
            //     currentSlideId: this._currentSlideId,
            //     previousSlideId: this._previousSlideId,
            //
            //     currentSlide: this._currentSlide,
            //     previousSlide: this._previousSlide,
            //
            //     direction: options.direction
            // });

            this._defaultTransition(options);

        },

        _direction: function() {

            return (this._currentSlideId > this._previousSlideId) ? -1 : 1;

        },

        _swapSlideIds: function() {

            this._previousSlideId = this._currentSlideId;

        },

        _transitionCompleteHandler: function(options) {

            this._isAnimating = false;

            this.trigger('transition:complete', {
                currentSlideId  : this._currentSlideId,
                previousSlideId : this._previousSlideId,
                direction       : options.direction
            });

            this._sliderWithGlitch.uncache();
            this._sliderContainer.uncache();
            this._requestStageUpdate();

        },

        _defaultTransition: function(options) {

            if(!this._options.useDefaultAnimation) return;

            var timeline = new TimelineMax();
            timeline.timeScale(2);
            
            if(this._previousSlide) timeline.fromTo(this._previousSlide, 1.2, {x: 0}, { x: this._width*options.direction, ease: Power2.easeInOut, onUpdate:this._requestStageUpdate}, 0);
            if(this._currentSlide) timeline.fromTo(this._currentSlide, 1.2, {x: this._width*-options.direction}, { x: 0, ease: Power2.easeInOut, onUpdate:this._requestStageUpdate}, 0);

            if(this._previousSlideContent) {
                timeline.fromTo(this._previousSlideContent, 1.2, {x: 0}, { x: this._width*options.direction, ease: Power2.easeInOut}, 0);
                timeline.fromTo(this._previousSlideContent, 0.6, {alpha: 1}, {alpha: 0, ease: Power0.easeNone}, 0);
            }

            if(this._currentSlideContent) {
                // var timeline = new TimelineMax({delay: 1.1});
                var delay = 1.1;
                timeline.set(this._currentSlideContent, {alpha: 1, x: 0}, delay);
                timeline.fromTo(this.ui.titleLines[this._currentSlideId], 0.3, {scaleX: 0}, {scale: 1, ease: Power1.easeOut}, delay);
                timeline.fromTo(this.ui.titleLines[this._currentSlideId], 0.2, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, delay);
                timeline.fromTo(this.ui.titles[this._currentSlideId], 0.3, {x: -30}, {x: 0, ease: Power1.easeOut}, delay);
                timeline.fromTo(this.ui.titles[this._currentSlideId], 0.2, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, delay);
                timeline.fromTo(this.ui.taglines[this._currentSlideId], 0.35, {x: -50}, {x: 0, ease: Power1.easeNone}, delay);
                timeline.fromTo(this.ui.taglines[this._currentSlideId], 0.35, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, delay);
                timeline.fromTo(this.ui.arrows[this._currentSlideId], 0.35, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, delay+0.3);
            }

            if(this._sliderWithGlitch) timeline.fromTo(this._sliderWithGlitch, 1.2/2, {alpha:0}, { alpha:1, repeat:1, yoyo:true, ease: Power1.easeIn, onUpdate:this._requestStageUpdate}, 0);
            if(this._sliderNoise) timeline.fromTo(this._sliderNoise, 1.2/2, {alpha:0}, { alpha:1, repeat:1, yoyo:true, ease: Power1.easeIn, onUpdate:this._requestStageUpdate}, 0);

            timeline.addCallback(this._transitionCompleteHandler, 1.2+0.5, [options]);

        },

        _defaultResize: function() {

            if(!this._options.useDefaultAnimation) return;

            var i, len, slide, content;
            for(i=0, len=this._slider.children.length; i<len; i++) {
                slide = this._slider.getChildAt(i);
                content = this.ui.content[i];

                if(i !== this._currentSlideId) {
                    TweenMax.set(slide, {x: this._width});
                    TweenMax.set(content, {x: this._width});
                }
            }

        },



        // Slider and slides


        _createStage: function() {

            this._stage = new createjs.Stage(this.ui.background);
            this._stage.enableDOMEvents(false);

        },

        _createStageSlider: function() {

            this._canvasSlider = document.createElement('canvas');

            this._stageSlider = new createjs.Stage(this._canvasSlider);
            this._stageSlider.enableDOMEvents(false);

        },

        _resizeStage: function() {

            this.ui.background.width = this._width;
            this.ui.background.height = this._height;
            this.ui.background.style.width = this._width + 'px';
            this.ui.background.style.height = this._height + 'px';

            this._canvasSlider.width = this._width;
            this._canvasSlider.height = this._height;
            this._canvasSlider.style.width = this._width + 'px';
            this._canvasSlider.style.height = this._height + 'px';

        },

        _requestStageUpdate: function() {

            this._stageUpdateRequest = true;

        },

        _createSlides: function() {

            this._slider = new createjs.Container();
            this._slider.regX = this._width * 0.5;
            this._slider.regY = this._height * 0.5;
            this._slider.x = this._width * 0.5;
            this._slider.y = this._height * 0.5;
            this._slider.scaleX = 1.3;
            this._slider.scaleY = 1.3;

            this._stageSlider.addChild(this._slider);

            var slide;
            for (var i = 0, len = CaseCollection.length; i < len; i++) {
                slide = this._createSlide(CaseCollection.at(i));
                this._slider.addChild(slide);
            }

            this._requestStageUpdate();

        },

        _addSlider: function() {

            var slider = new createjs.Bitmap(this._canvasSlider);

            this._sliderWithGlitch = new createjs.Bitmap(this._canvasSlider);
            this._sliderWithGlitch.filters = [this.glitchFilter];
            this._sliderWithGlitch.alpha = 0;

            this._sliderNoise = new createjs.Bitmap(this._fileLoader.getFile('noise'));
            this._sliderNoise.alpha = 0;

            this._sliderContainer = new createjs.Container();
            this._sliderContainer.filters = [this.distortFilter];
            this._sliderContainer.addChild(slider, this._sliderWithGlitch, this._sliderNoise);

            this._stage.addChild(this._sliderContainer);

        },

        _createSlide: function(model) {

            var slide = new createjs.Container();
            slide.name = model.get('slug');

            var mask = new createjs.Shape();
            mask.graphics.beginFill('#00FF00');
            mask.graphics.drawRect(0, 0, this._width, this._height);

            var backgroundImage = this._fileLoader.getFile(model.get('slug') + '-background');
            var backgroundBitmap = new createjs.Bitmap(backgroundImage);
            backgroundBitmap.name = 'backgroundBitmap';
            backgroundBitmap.regX = backgroundBitmap.image.width/2;
            backgroundBitmap.regY = backgroundBitmap.image.height/2;
            this._positionBackgroundBitmap(backgroundBitmap);
            this._scaleBitmap(backgroundBitmap);
            slide.addChild(backgroundBitmap);

            if (model.get('header_image')) {
                var foregroundImage = this._fileLoader.getFile(model.get('slug'));
                var foregroundBitmap = new createjs.Bitmap(foregroundImage);
                foregroundBitmap.name = 'foregroundBitmap';
                foregroundBitmap.regX = foregroundBitmap.image.width;
                foregroundBitmap.regY = foregroundBitmap.image.height/2;
                this._positionForegroundBitmap(foregroundBitmap);
                slide.addChild(foregroundBitmap);
            }

            return slide;

        },

        _gotoActiveSlide: function() {

            var activeModel = CaseCollection.getActiveModel();
            var index = CaseCollection.indexOf(activeModel);
            this.gotoInstantly(index);

        },

        _positionBackgroundBitmap: function(bitmap) {

            var mask = new createjs.Shape();
            mask.graphics.beginFill('#00FF00');
            mask.graphics.drawRect(0, 0, this._width, this._height);

            bitmap.x = ResizeManager.viewportWidth()/2;
            bitmap.y = this._height/2;
            bitmap.mask = mask;

        },

        _positionForegroundBitmap: function(bitmap) {

            var width = Math.min(this._width, 1440);
            bitmap.x = Math.round(width + ((this._width - width) / 2) - (width * 0.1));
            bitmap.y = Math.round(this._height * 0.5);

            if (this._width <= Settings.breakpoints.small) {
                bitmap.scaleX = bitmap.scaleY = 0;
            } else if (this._width <= Settings.breakpoints.medium) {
                bitmap.scaleX = bitmap.scaleY = 0.8;
            } else {
                bitmap.scaleX = bitmap.scaleY = 1;
            }

        },

        _resizeSlides: function() {

            for(var i=0, len=this._slider.children.length; i<len; i++) {
                this._resizeSlide(this._slider.getChildAt(i));
            }

        },

        _resizeSlide: function(slide) {

            if (slide.getChildByName('backgroundBitmap')) {
                var backgroundBitmap = slide.getChildByName('backgroundBitmap');
                this._positionBackgroundBitmap(backgroundBitmap);
                this._scaleBitmap(backgroundBitmap);
            }

            if (slide.getChildByName('foregroundBitmap')) {
                var foregroundBitmap = slide.getChildByName('foregroundBitmap');
                this._positionForegroundBitmap(foregroundBitmap);
            }

        },

        _resizeSliderNoise: function(slide) {

            if(!this._sliderNoise) return;

            this._sliderNoise.regX = this._sliderNoise.image.width/2;
            this._sliderNoise.regY = this._sliderNoise.image.height/2;

            this._sliderNoise.x = ResizeManager.viewportWidth()/2;
            this._sliderNoise.y = this._height/2;

            var scale = Math.max(this._width/this._sliderNoise.image.width, this._height/this._sliderNoise.image.height);
            this._sliderNoise.scaleX = this._sliderNoise.scaleY = scale;

        },

        _scaleBitmap: function(bitmap) {

            var scale = Math.max(this._width/bitmap.image.width, this._height/bitmap.image.height);
            bitmap.scaleX = bitmap.scaleY = scale;

        },

        _resizeHandler: function() {

            this._resize();

        },

        _showCompleteHandler: function() {

            this._sliderWithGlitch.uncache();
            this._sliderContainer.uncache();
            this._requestStageUpdate();

        },

        _tickHandler: function() {

            if(this._stageUpdateRequest) {

                // console.time('raf');

                this._stageUpdateRequest = false;

                if(this._sliderWithGlitch.cacheCanvas) {
                    this._sliderWithGlitch.updateCache();
                }

                if(this._sliderContainer.cacheCanvas) {
                    this._sliderContainer.updateCache();
                }

                this._stageSlider.update();
                this._stage.update();

                // console.timeEnd('raf');

            }

        }



    });

});
