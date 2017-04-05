define([
    'superhero',
    'app/utils/GestureManager',
    'app/utils/ResizeManager',
    'app/views/components/CaseLazyComponent',
    'app/views/components/PaginatorComponent',
    'app/views/components/GalleryComponent',
], function(Superhero, GestureManager, ResizeManager, CaseLazyComponent, PaginatorComponent, GalleryComponent) {

    return CaseLazyComponent.extend({

        MARGIN_SLIDE: 64,

        ui: {
            buttons: '.button-gallery-navigation',
            slides: '.list-item'
        },

        events: {
            'click .button-paginator' : '_buttonClickHandler',
            'click .button-gallery-navigation--next': '_clickNavigationNextHandler',
            'click .button-gallery-navigation--previous': '_clickNavigationPreviousHandler'
        },

        components: {
            gallery: {selector: '.section-image-gallery-slider-list', module: GalleryComponent},
            paginator: {selector: '.section-image-gallery-slider-paginator', module: PaginatorComponent},
        },

        onInitializedLazy: function() {

            this._gestureManager = new GestureManager({el: this.el});
            this._resize();

            this._setupEventListerners();

        },

        _setupEventListerners: function() {

            this.listenTo(ResizeManager, 'resize', this._resizeHandler);
            this.listenTo(this._gestureManager, 'swipe:left', this._swipeLeftHandler);
            this.listenTo(this._gestureManager, 'swipe:right', this._swipeRightHandler);
            this.listenTo(this.components.gallery, 'transition:start', this._galleryTransitionStartHandler);
            this.listenTo(this.components.gallery, 'transition:complete', this._galleryTransitionCompleteHandler);

        },

        _next: function() {

            this.components.gallery.next();

        },

        _previous: function() {

            this.components.gallery.previous();

        },

        _resize: function() {

            this._setWidthNavigationButtons();

        },

        _setWidthNavigationButtons: function() {

            var width = ((ResizeManager.viewportWidth() - this.ui.slides[0].offsetWidth) / 2) - this.MARGIN_SLIDE;

            for (var i = 0, len = this.ui.buttons.length; i < len; i++) {
                this.ui.buttons[i].style.width = width + 'px';
            }

        },

        _buttonClickHandler: function(e) {

            var index = parseInt(e.currentTarget.dataset.index);
            this.components.paginator.select(index);
            this.components.gallery.goto(index);

        },

        _clickNavigationNextHandler: function() {

            this._next();

        },

        _clickNavigationPreviousHandler: function() {

            this._previous();

        },

        _swipeLeftHandler: function() {

            this._next();

        },

        _swipeRightHandler: function() {

            this._previous();

        },

        _resizeHandler: function() {

            this._resize();

        },

        _galleryTransitionStartHandler: function(e) {

            this.components.paginator.select(e.id);
            this.components.paginator.lock();

        },

        _galleryTransitionCompleteHandler: function() {

            this.components.paginator.unlock();

        },

    });

});
