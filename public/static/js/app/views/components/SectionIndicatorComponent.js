define([
    'underscore',
    'superhero',

    'app/utils/ScrollManager',
    'app/utils/ResizeManager',

], function(
    _, Superhero,
    ScrollManager, ResizeManager
) {


    return Superhero.Component.extend({

        CLASS_ACTIVE : 'section-indicator-button--active',

        ui: {
            buttons : '.section-indicator-button',
            dots: '.section-indicator-dot'
        },

        events: {
            'tap .section-indicator-button' : '_buttonClickHandler'
        },

        initialize: function(options) {

            _.bindAll(this, '_build', 'show');

            this._sections = options.sections || null;
            this._visibility = [];

        },

        onInitialized: function() {

            this._setupEventListeners();

            this._buildTimeout = TweenMax.delayedCall(0.2, this._build);

        },

        onClose: function() {

            if (this._buildTimeout) this._buildTimeout.kill();

        },

        scrollUpdate: function(e) {

            this._scrollUpdateHandler(e);

        },

        show: function() {
            // TweenMax.staggerFromTo(this.ui.dots, 0.18, {autoAlpha: 0}, {autoAlpha: 1, ease: Linear.easeNone}, 0.02);
        },

        _setupEventListeners: function() {

            this.listenTo(ResizeManager, 'resize', this._resizeHandler);
            this.listenTo(ResizeManager, 'resize:complete', this._resizeHandler);

        },

        _build: function() {

            this._resize();
            this._visibility = this._calcVisibilitySections(0);
            this._update();

        },

        _update: function() {

            if (!this._visibility) return;

            // Get section with hightest visibility percentage
            var max = _.max(this._visibility);
            var id = this._visibility.indexOf(max);
            if (!max && !id) return;

            if (this._activeId === id) return;
            this._activeId = id;

            for (var i = 0, len = this.ui.buttons.length; i < len; i++) {
                this.ui.buttons[i].classList.remove(this.CLASS_ACTIVE);
            }

            this.ui.buttons[id].classList.add(this.CLASS_ACTIVE);

        },

        _navigate: function(id) {

            ScrollManager.scrollTo(0, this._offsetSections[id].top - 70, 0.8, Power2.easeOut);

        },

        _resize: function() {

            this._getOffsetSections();

        },

        _getOffsetSections: function() {

            this._offsetSections = [];

            var offsetTop;
            var height;

            for (var i = 0, len = this._sections.length; i < len; i++) {
                offsetTop = this._getElementGlobalOffsetTop(this._sections[i]);
                height = this._sections[i].clientHeight;

                this._offsetSections.push({
                    top: offsetTop,
                    bottom: offsetTop + height,
                    height: height
                });
            }

        },

        _getElementGlobalOffsetTop: function(element) {

            var y = 0;
            while(true) {
                y += element.offsetTop;
                if(element.offsetParent === null){
                    break;
                }
                element = element.offsetParent;
            }

            return y;

        },

        _calcVisibilitySections: function(viewportTop) {

            var section, area, percentages = [];
            var viewportBottom = viewportTop + ResizeManager.viewportHeight();

            if (!this._offsetSections) return;

            for (var i = 0, len = this._offsetSections.length; i < len; i++) {

                section = this._offsetSections[i];

                if (section.top >= viewportTop && section.bottom <= viewportBottom) {
                    area = section.height;
                }
                else if (section.top <= viewportTop && section.bottom >= viewportBottom) {
                    area = ResizeManager.viewportHeight();
                }
                else if (section.bottom >= viewportTop && section.bottom <= viewportBottom) {
                    area = section.bottom - viewportTop;
                }
                else if (section.top >= viewportTop && section.top <= viewportBottom) {
                    area = Math.min(section.bottom, viewportBottom) - section.top;
                }
                else {
                    area = 0;
                }

                percentages.push(100 / section.height * area);

            }

            return percentages;

        },

        _scrollUpdateHandler: function(e) {

            this._visibility = this._calcVisibilitySections(e.y);
            this._update();

        },

        _resizeHandler: function(e) {

            this._resize();

        },

        _buttonClickHandler: function(e) {

            var sectionIndex = e.currentTarget.getAttribute('data-id');

            this.trigger('indicator:click', sectionIndex);

        }

    });
});
