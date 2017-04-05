define([
    'superhero',
    'app/utils/ScrollManager',
    'app/utils/EventBus',
    'app/modules/GlitchBackgroundModule',
    'app/views/components/MenuIconComponent'
], function(Superhero, ScrollManager, EventBus, GlitchBackgroundModule, MenuIconComponent) {

    return Superhero.View.extend({

        className: 'page page-contact',
        template: 'pages/contact',

        ui: {
            email: '.contact-button',
            details: '.page-contact-details',
            socialIcons: '.list--social',
            backgroundCanvas: '.page-contact-background',
            sideTitle: '.page-side-title'
        },

        events: {
            'mouseenter .contact-button': '_contactButtonMouseEnterHandler',
            'mouseleave .contact-button': '_contactButtonMouseLeaveHandler',
        },

        components: {
            menuIcon: {selector: '.button-main-menu', module: MenuIconComponent},
        },

        initialize: function() {

            _.bindAll(
                this,
                '_introPlay'
            );

        },

        onInitialized: function() {

            ScrollManager.scrollTop(0);

            this._setup();
            this._setupEventListeners();

        },

        onClose: function() {

            if (this.backgroundModule) this.backgroundModule.close();
            if (this._introTimeline) this._introTimeline.kill();

        },

        transitionOut: function(callback) {

            TweenMax.to(this.el, 0.3, {alpha: 0, ease: Power0.easeNone, onComplete: callback});

        },

        _setup: function() {

            if (!Settings.isMobile) this.backgroundModule = new GlitchBackgroundModule({el: this.ui.backgroundCanvas});
            this._createIntroTimeline();

        },

        _setupEventListeners: function() {

            this.listenTo(EventBus, 'menu:open', this._eventOpenHandler);
            this.listenTo(EventBus, 'menu:close', this._eventCloseHandler);

        },

        transitionIn: function(transitionData) {

            var delay = (transitionData.previousFragment === 'intro') ? 0 : 0.4;
            TweenMax.delayedCall(delay, this._introPlay);

        },

        _introPlay: function() {

            this._introTimeline.play();

        },

        _createIntroTimeline: function() {

            this._introTimeline = new TimelineMax({paused: true});

            this._introTimeline.from(this.ui.email, 0.45, {y: 30, ease: Power2.easeOut}, 0);
            this._introTimeline.from(this.ui.email, 0.2, {alpha: 0, ease: Power0.easeNone}, 0.03);

            this._introTimeline.from(this.ui.details, 0.45, {y: 30, ease: Power2.easeOut}, 0.07);
            this._introTimeline.from(this.ui.details, 0.2, {alpha: 0, ease: Power0.easeNone}, 0.1);

            this._introTimeline.from(this.ui.socialIcons, 0.45, {y: 30, ease: Power2.easeOut}, 0.14);
            this._introTimeline.from(this.ui.socialIcons, 0.2, {alpha: 0, ease: Power0.easeNone}, 0.17);

        },

        _contactButtonMouseEnterHandler: function(e) {

            TweenMax.to(this.ui.email, 0.2, {alpha: 0.7, ease: Power2.easeOut});

        },

        _contactButtonMouseLeaveHandler: function(e) {

            TweenMax.to(this.ui.email, 0.1, {alpha: 1, ease: Power1.easeOut});

        },

        _eventOpenHandler: function(e) {

            if (this.ui.sideTitle) TweenMax.to(this.ui.sideTitle, 0.2, {alpha: 0, ease: Power0.easeNone});

        },

        _eventCloseHandler: function(e) {

            if (this.ui.sideTitle) TweenMax.to(this.ui.sideTitle, 0.2, {alpha: 1, ease: Power0.easeNone});

        }

    });

});
