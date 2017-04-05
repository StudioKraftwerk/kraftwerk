define([
    'underscore',
    'easeljs',
    'superhero',

    // UTILS
    'app/utils/ScrollManager',
    'app/utils/ResizeManager',
    'app/utils/ScrollSnap',
    'app/utils/EventBus',

    'app/modules/AboutBackgroundModule',

    // Base View
    'app/views/pages/ScrollSnapBaseView',

    // COMPONENTS
    'app/views/components/SectionIndicatorComponent',
    'app/views/components/ArrowIconComponent',
    'app/views/components/MenuIconComponent',
], function(
    _, Easeljs, Superhero,
    ScrollManager, ResizeManager, ScrollSnap, EventBus,
    AboutBackgroundModule,
    ScrollSnapBaseView,
    SectionIndicatorComponent, ArrowIconComponent, MenuIconComponent
) {

    return ScrollSnapBaseView.extend({

        className : 'page page-about',
        template  : 'pages/about',

        ui: {
            sections : '.section-about',
            firstSection: '.js-section-first',
            sectionIndicator: '.section-indicator',
            buttons  : '.section-indicator-button',
            pageTitle: '.page-title--about',

            scrollIndicator: '.button-scroll-down',

            visionSection : '.about-section-vision',
            heritageSection : '.about-section-heritage',
            kraftmanshipSection : '.about-section-kraftmanship',
            sideTitle: '.page-side-title',
            animationElements: '[data-animation-offset]'
        },

        components: {
            arrow: {selector: '.sprite-animation-arrow', module: ArrowIconComponent},
            menuIcon: {selector: '.button-main-menu', module: MenuIconComponent},
        },

        events: {
            'click .button-scroll-down' : '_buttonScrollDownClickHandler',
            'click .button-totop' : '_buttonToTopClickHandler'
        },

        initialize: function( ) {


            if (!Settings.isMobile) ScrollSnapBaseView.prototype.initialize.apply(this);

        },

        onInitialized: function() {

            if (!Settings.isMobile) ScrollSnapBaseView.prototype.onInitialized.apply(this);

            ScrollManager.scrollTop(0);

            this.addComponent('sectionIndicator', SectionIndicatorComponent, '.section-indicator', {sections: this.ui.sections});

            // peter - copied from temp site
            if(!this.backgroundModule && !Settings.isMobile) {
                // peter - temp solution
                var canvasWrapper = document.querySelector('.page-about-background');

                // end temp solution
                this.backgroundModule = new AboutBackgroundModule({el: canvasWrapper});

                this._showBackgroundStates();

                //Todo: kill background when size is smaller than 700px
            }

            this._setupEventListeners();
            this._setupTransitionIn();

            if (!Settings.isMobile) {
                this._createSectionTimelines();
            } else {
                this._expandFirstSection();
                this._transitionIn();
            }

        },

        onClose: function() {

            if (this.backgroundModule) this.backgroundModule.close();
            if (!Settings.isMobile) ScrollSnapBaseView.prototype.onClose.apply(this);

        },

        transitionOut: function(callback) {

            TweenMax.to(this.el, 0.3, {alpha: 0, ease: Power0.easeNone, onComplete: callback});

        },

        /**
         * Called from the base view when page is done building
         */
        _transitionIn: function() {

            this._tl.play();

        },

        _expandFirstSection: function () {
            this.ui.firstSection.style.height = (~~ResizeManager.viewportHeight()) + 'px';
        },

        _setupEventListeners: function() {

            this.listenTo(this.components.sectionIndicator, 'indicator:click', this._sectionIndicatorClickHandler);
            this.listenTo(this.__scrollSnap, 'update', this._scrollHandler);
            this.listenTo(EventBus, 'menu:open', this._eventOpenHandler);
            this.listenTo(EventBus, 'menu:close', this._eventCloseHandler);

        },

        _setupTransitionIn: function() {

            this._tl = new TimelineMax({paused: true});

            // this._tl.fromTo(this.ui.sections[0], 0.6, {y: 100}, {y: 0, force3D: true, ease: Power2.easeInOut}, 0);

            this._tl.from(this.ui.pageTitle, 0.45, {y: 50, ease: Power2.easeOut}, 0.2);
            this._tl.from(this.ui.pageTitle, 0.4, {alpha: 0, ease: Power0.easeNone}, 0.23);

            // this._tl.fromTo(this.ui.sections, 0.4, {autoAlpha: 0}, {autoAlpha: 1, ease: Linear.easeNone}, 0.2);
            this._tl.add(this.components.arrow.pulse, 0.45);
            this._tl.from(this.ui.sectionIndicator, 0.3, {alpha: 0, ease: Power0.easeNone}, 0.6);

        },

        _createSectionTimelines: function() {

            var timeline, elements, delay;
            var baseDelay = 0.6;
            this._sectionTimelines = [];
            for (var i = 0, len = this.ui.sections.length; i < len; i++) {
                timeline = new TimelineMax({paused: true});
                elements = this.ui.sections[i].querySelectorAll('[data-animation-offset]');
                for (var j = 0, lenJ = elements.length; j < lenJ; j++) {
                    delay = baseDelay + parseFloat(elements[j].getAttribute('data-animation-offset'));
                    timeline.fromTo(elements[j], 0.45, {y: 30}, {y: 0, ease: Power2.easeOut}, delay);
                    timeline.fromTo(elements[j], 0.2, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, delay + 0.03);
                }
                this._sectionTimelines.push(timeline);
            }

        },

        _hideScrollIndicator: function() {

            if(this._scrollIndicatorHidden) return;
            this._scrollIndicatorHidden = true;

            TweenMax.to(this.ui.scrollIndicator, 0.2, {autoAlpha: 0, ease: Linear.easeNone, onComplete: this.components.sectionIndicator.stop});

        },

        _showBackgroundStates : function(scroll) {

            var InMarge = -ResizeManager.viewportHeight()/2;
            var OutMarge = 0;

            var visionPos = this.ui.visionSection.offsetTop + InMarge;
            var visionMax = (this.ui.visionSection.offsetHeight - OutMarge);
            var heritagePos = this.ui.heritageSection.offsetTop + InMarge;
            var heritageMax = (this.ui.heritageSection.offsetHeight - OutMarge);
            var kraftManShipPos = this.ui.kraftmanshipSection.offsetTop + InMarge;
            var kraftManShipMax = (this.ui.kraftmanshipSection.offsetHeight - OutMarge);

            if(scroll >= 0 && scroll < visionPos) {
                if(!this.headerActive) {
                    this.headerActive = true;
                    this.backgroundModule.animateBackgroundIn();
                }
            }
            else {
                if(this.headerActive) {
                    this.headerActive = false;
                    this.backgroundModule.animateBackgroundOut();
                }
            }

            // console.log('scroll', visionPos, visionMax)

            if(scroll > heritagePos && scroll < heritagePos + heritageMax) {
                if(!this.boltActive) {
                    this.boltActive = true;
                    this.backgroundModule.animateIconBoltIn();
                }
            }
            else {
                if(this.boltActive) {
                    this.boltActive = false;
                    this.backgroundModule.animateIconBoltOut();
                }
            }

            if(scroll > visionPos && scroll < visionPos + visionMax) {
                if(!this.eyeActive) {
                    this.eyeActive = true;
                    this.backgroundModule.animateIconEyeIn();
                }
            }
            else {
                if(this.eyeActive) {
                    this.eyeActive = false;
                    this.backgroundModule.animateIconEyeOut();
                }
            }

            if(scroll > kraftManShipPos && scroll < kraftManShipPos + kraftManShipMax) {
                if(!this.handActive) {
                    this.handActive = true;
                    this.backgroundModule.animateIconHandIn();
                }
            }
            else {
                if(this.handActive) {
                    this.handActive = false;
                    this.backgroundModule.animateIconHandOut();
                }
            }

        },

        _snapToPoint: function(index) {

            this.__scrollSnap.snapToPoint(index);

        },

        _showSection: function(index) {

            if (this._sectionTimelines && this._sectionTimelines[index]) this._sectionTimelines[index].play();

        },

        _scrollHandler: function(e) {

            if (!Settings.isMobile) this._showBackgroundStates(e.y);

            this.components.sectionIndicator.scrollUpdate(e);

            if(e.y > 0 && !this._scrollIndicatorHidden) this._hideScrollIndicator();

            if (!Settings.isMobile) {
                var index = Math.ceil(e.y / ResizeManager.viewportHeight());
                if (index !== this._activeSectionIndex) {
                    this._activeSectionIndex = index;
                    this._showSection(this._activeSectionIndex);
                }
            }

        },

        _sectionIndicatorClickHandler: function(index) {
            this._snapToPoint(index);
        },

        _buttonScrollDownClickHandler: function() {
            this._snapToPoint(1);
        },

        _buttonToTopClickHandler: function() {
            this._snapToPoint(0);
        },

        _eventOpenHandler: function(e) {

            if (this.ui.sideTitle) TweenMax.to(this.ui.sideTitle, 0.2, {alpha: 0, ease: Power0.easeNone});

        },

        _eventCloseHandler: function(e) {

            if (this.ui.sideTitle) TweenMax.to(this.ui.sideTitle, 0.2, {alpha: 1, ease: Power0.easeNone});

        }

    });

});
