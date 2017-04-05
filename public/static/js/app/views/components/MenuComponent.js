define([
    'superhero',
    'app/utils/EventBus',
    'app/modules/MenuBackgroundModule',
    'app/views/components/MenuIconComponent'
], function(Superhero, EventBus, MenuBackgroundModule, MenuIconComponent) {

    return Superhero.View.extend({

        ui: {
            backgroundColor: '.menu-background-color',
            background: '.menu-background',
            items: '.list-item-menu',
            buttonFooter: '.button-menu-footer',
            buttonFooterIcon: '.button-menu-footer-icon-svg',
            lines: '.button-menu-line',
            uiOverlay: '.ui-overlay',

            buttonMenuFilter: '.button-menu-filter',
            buttonMenuFilterTurbulence: '.button-menu-filter-turbulence',
        },

        events: {
            'click .button-menu': '_clickButtonMenuHandler',
            'mouseenter .button-menu': '_menuButtonMouseEnterHandler',
            'mouseleave .button-menu': '_menuButtonMouseLeaveHandler',
            'mouseenter .button-menu-footer': '_menuFooterButtonMouseEnterHandler',
            'mouseleave .button-menu-footer': '_menuFooterButtonMouseLeaveHandler'
        },

        components: {
            menuIcon: {selector: '.button-main-menu', module: MenuIconComponent}
        },

        initialize: function() {

            _.bindAll(
                this,
                '_closeTweenCompleteHandler'
            );

        },

        onInitialized: function() {

            this._setup();
            this._setupEventListeners();

        },

        onClose: function() {

            if (this._openTimeline) this._openTimeline.kill();

        },

        _setup: function() {

            // if (!Settings.isMobile) this._background = new MenuBackgroundModule({canvas: this.ui.background});
            this._buildTimelines();

        },

        _setupEventListeners: function() {

            this.listenTo(EventBus, 'menu:open', this._eventOpenHandler);
            this.listenTo(EventBus, 'menu:close', this._eventCloseHandler);

        },

        _buildTimelines: function() {

            var direction = (Settings.isMobile) ? 1 : -1;

            this._openTimeline = new TimelineMax({paused: true});
            this._openTimeline.fromTo(this.ui.backgroundColor, 0.3, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, 0);
            // if (!Settings.isMobile) this._openTimeline.addCallback(this._background.show, 0.1);
            this._openTimeline.staggerFromTo(this.ui.items, 0.15, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, 0.05 * direction, 0.25);
            this._openTimeline.fromTo(this.ui.buttonFooter, 0.15, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, 0.3);

        },

        _open: function() {

            if (!Settings.isMobile) this._showUiOverlay();
            this._disableScrolling();

            this.el.style.visibility = 'visible';
            this.el.style.opacity = 1;

            if (this._closeTimeline) this._closeTimeline.pause();
            this._openTimeline.play(0);

        },

        _close: function() {

            if (!Settings.isMobile) this._hideUiOverlay();
            this._enableScrolling();

            this._openTimeline.pause();

            this._closeTimeline = new TimelineMax({onComplete: this._closeTweenCompleteHandler});
            this._closeTimeline.add( new TweenMax.to(this.ui.items, 0.3, {alpha:0}), 0 );
            this._closeTimeline.add( new TweenMax.to(this.ui.buttonFooter, 0.3, {alpha:0}), 0 );
            this._closeTimeline.add( new TweenMax.to(this.ui.backgroundColor, 0.3, {alpha:0}), 0.3 );

            // if (!Settings.isMobile) this._background.hideInstantly();

        },

        _enableScrolling: function() {

            document.ontouchmove = function(e) {
                return true;
            };

        },

        _disableScrolling: function() {

            document.ontouchmove = function(e) {
                e.preventDefault();
            };

        },

        _showUiOverlay: function() {

            this.ui.uiOverlay.style.visibility = 'visible';
            this.ui.uiOverlay.style.opacity = 1;

        },

        _hideUiOverlay: function() {

            this.ui.uiOverlay.style.visibility = 'hidden';
            this.ui.uiOverlay.style.opacity = 0;

        },

        _eventOpenHandler: function(e) {

            this._open();

        },

        _eventCloseHandler: function() {

            this._close();

        },

        _clickButtonMenuHandler: function(e) {

            EventBus.trigger('menu:close');

        },

        _closeTweenCompleteHandler: function(e) {

            this.el.style.visibility = 'hidden';
            this.el.style.opacity = 0;

        },

        _menuButtonMouseEnterHandler: function(e) {

            var index = e.currentTarget.dataset.index;
            TweenMax.fromTo(this.ui.buttonMenuFilterTurbulence[index], 0.2, {attr: {baseFrequency: '0.000001 0.000001'}}, {attr: {baseFrequency: '0.000001 0.4'}});
            TweenMax.fromTo(this.ui.buttonMenuFilterTurbulence[index], 0.1, {attr: {baseFrequency: '0.000001 0.000001'}}, {attr: {baseFrequency: '0.000001 0.4'}, delay: 0.2});
            TweenMax.fromTo(this.ui.buttonMenuFilterTurbulence[index], 0.1, {attr: {baseFrequency: '0.000001 0.4'}}, {attr: {baseFrequency: '0.000001 0.000001'}, delay: 0.3});
            if (e.currentTarget.classList.contains('button-menu--active')) return;
            // TweenMax.to(this.ui.lines[index], 0.2, {scaleX: 1, ease: Power2.easeOut});

        },

        _menuButtonMouseLeaveHandler: function(e) {

            if (e.currentTarget.classList.contains('button-menu--active')) return;
            TweenMax.to(this.ui.lines[e.currentTarget.dataset.index], 0.1, {scaleX: 0, clearProps: 'scaleX', ease: Power2.easeIn});

        },

        _menuFooterButtonMouseEnterHandler: function(e) {

            TweenMax.to(this.ui.buttonFooterIcon, 0.2, {fill: '#f9d400', ease: Power0.easeNone});

        },

        _menuFooterButtonMouseLeaveHandler: function(e) {

            TweenMax.to(this.ui.buttonFooterIcon, 0.15, {fill: 'white', ease: Power0.easeNone});

        }

    });

});
