define([
    'underscore',
    'easeljs',
    'superhero',

    // UTILS
    'app/utils/ResizeManager',
    'app/utils/FileLoader',

    // COMPONENTS
    'app/views/components/CaseLazyComponent'

], function(_, Easeljs, Superhero, ResizeManager, FileLoader, CaseLazyComponent) {


    return CaseLazyComponent.extend({

        MAX_HEIGHT : 950,
        MIN_HEIGHT : 500,

        ui: {
            // imageContainer : '.fullscreen-image-container',
            image : '.image-fullscreen',
        },


        initialize: function() {

            CaseLazyComponent.prototype.initialize.apply(this, arguments);

        },

        onInitializedLazy: function(options) {

            _.bindAll(
                this,
                '_readSizes',
                '_onImageLoaded'
                );

            this._onImageLoaded();
        },

        _onImageLoaded : function () {

            this.el.style.visibility = '';

            this.moduleHeight = 0;
            this.imageHeight = 0;
            this.imageWidth = 0;

            this.originalImageSize = {
                width: this.ui.image.width,
                height: this.ui.image.height,
                ratio: 0
            }
            this.originalImageSize.ratio = this.originalImageSize.width / this.originalImageSize.height;


            this._readSizes();
            this.setPositions();
            this.addEventListeners();
        },

        _onResize : function () {
            this._readSizes();
            this.setPositions();
        },

        addEventListeners : function () {
            this.listenTo(ResizeManager, 'resize', this._onResize);
        },

        _readSizes : function () {
            this.moduleHeight = Math.max(this.MIN_HEIGHT, Math.min(this.MAX_HEIGHT, ResizeManager.viewportWidth())) ;
            this.moduleWidth  = ResizeManager.viewportWidth();


            this.imageWidth  = this.moduleWidth;
            this.imageHeight = this.imageWidth / this.originalImageSize.ratio;

            if(this.imageHeight < this.moduleHeight) {

                this.imageHeight = this.moduleHeight;
                this.imageWidth  = this.moduleHeight * this.originalImageSize.ratio;
            }
            // console.log({
            //     'imageHeight'  : this.imageHeight,
            //     'imageWidth'   : this.imageWidth,
            //     'moduleHeight' : this.moduleHeight,
            //     'moduleWidt'   : this.moduleWidth
            //     });
        },

        setPositions : function () {


            TweenMax.set(this.el, {
                height : this.moduleHeight
            });
            TweenMax.set(this.ui.image, {
                width      : this.imageWidth,
                height     : this.imageHeight,
                marginTop  : -(this.imageHeight / 2),
                marginLeft : -(this.imageWidth / 2)
            });
        }
    });
});






