define([
    'superhero',
    'app/utils/ResizeManager',
    'app/utils/ScrollManager',
    'app/utils/EventBus',
    'app/views/components/SectionIndicatorComponent',
    'app/views/components/ArrowIconComponent',
    'app/views/components/MenuIconComponent'
], function(
    Superhero, ResizeManager, ScrollManager, EventBus,
    SectionIndicatorComponent, ArrowIconComponent, MenuIconComponent
){

    return Superhero.View.extend({

        className: 'page page-work',
        template: 'pages/work',

        ui: {
            grid: '.grid',
            projects: '.project',
            projectImage: '.project-image',
            projectLink: '.project-link',
            projectOdd: '.project--odd',
            sideTitle: '.page-side-title',
            pageTitle: '.page-work-title',
            caseIndex: '.case-index',
        },

        components: {
            menuIcon: {selector: '.button-main-menu', module: MenuIconComponent},
            arrows: { selector: '.sprite-animation-arrow', module: ArrowIconComponent},
        },

        events : {
            'click .page-work__arrow-up': '_buttonToTopClickHandler',
            'click .section-indicator-button': '_sectionIndicatorButtonClickHandler',
            'mouseenter .project-link': '_projectLinkMouseEnterHandler',
            'mouseleave .project-link': '_projectLinkMouseLeaveHandler',
        },

        initialize: function() {

            _.bindAll(
                this,
                '_introPlay',
                '_showArrows',
                '_elementInViewportHandler'
            );

        },

        onInitialized: function() {

            ScrollManager.scrollTop(0);

            this._setup();
            this._setupEventListeners();

        },

        onClose: function() {

            this._introTimeline.kill();

        },

        _setup: function() {

            this.addComponent('sectionIndicator', SectionIndicatorComponent, '.case-index', {sections: this.ui.projects});
            
            if (!Settings.isMobile) {
                this._hideProjects();
                this._registerScrollElements();
            }

            this._createIntroTimeline();

        },

        _setupEventListeners: function() {

            this.listenTo(ScrollManager, 'scroll', this._sectionIndicatorOnScrollHandler);
            this.listenTo(EventBus, 'menu:open', this._eventOpenHandler);
            this.listenTo(EventBus, 'menu:close', this._eventCloseHandler);

        },

        transitionIn: function(transitionData) {

            var delay = (transitionData.previousFragment === 'intro') ? 0 : 0.2;
            TweenMax.delayedCall(delay, this._introPlay);

        },

        transitionOut: function(callback) {

            TweenMax.to(this.el, 0.4, {alpha: 0, ease: Power0.easeNone, onComplete: callback});

        },

        _createIntroTimeline: function() {

            this._introTimeline = new TimelineMax({paused: true});
            if (this.ui.sideTitle) this._introTimeline.from(this.ui.sideTitle, 0.2, {alpha: 0, ease: Power0.easeNone}, 0);

            this._introTimeline.from(this.ui.pageTitle, 0.45, {y: 80, ease: Power2.easeOut}, 0);
            this._introTimeline.from(this.ui.pageTitle, 0.4, {alpha: 0, ease: Power0.easeNone}, 0.03);

            this._introTimeline.from(this.ui.projects[0], 0.45, {y: 80, ease: Power2.easeOut}, 0.09);
            this._introTimeline.fromTo(this.ui.projectLink[0], 0.6, {y: 120}, {y: 0, ease: Power2.easeOut}, 0.09);
            this._introTimeline.fromTo(this.ui.projects[0], 0.2, {alpha: 0}, {alpha: 1, delay: 0.03, ease: Power1.easeIn}, 0.12);
            
            this._introTimeline.from(this.ui.caseIndex, 0.3, {alpha: 0, ease: Power0.easeNone}, 0.5);

            this._introTimeline.addCallback(this._showArrows, 0.4);

        },

        _hideProjects: function() {

            for (var i = 0, len = this.ui.projects.length; i < len; i++) {
                this.ui.projects[i].style.opacity = 0;
            }

        },

        _registerScrollElements: function() {

            for (var i = 0, len = this.ui.projects.length; i < len; i++) {
                if (i !== 0) ScrollManager.registerElementScrollNotification(this.ui.projects[i], this._elementInViewportHandler, 350);
                // ScrollManager.registerElementScrollNotification(this.ui.projects[i], this._elementInViewportHandler, 350);
            }

        },

        _showArrows: function() {

            for (var i = 0; i < this.components.arrows.length; i++) {
                this.components.arrows[i].show();
            }

        },

        _introPlay: function() {

            this._introTimeline.play();

        },

        _scrollToSection: function(index) {

            var offsetTop = this.ui.projects[index].offsetTop;
            ScrollManager.scrollTo(null, -offsetTop);

        },

        _showProject: function(el) {

            var button = el.querySelector('.project-link');

            TweenMax.fromTo(el, 0.5, {y: 80}, {y: 0, clearProps: 'y', force3D: true, ease: Power2.easeOut});
            TweenMax.fromTo(button, 0.6, {y: 120}, {y: 0, clearProps: 'y', force3D: true, ease: Power2.easeOut});
            TweenMax.fromTo(el, 0.2, {alpha: 0}, {alpha: 1, clearProps: 'alpha', force3D: true, delay: 0.03, ease: Power1.easeIn});

        },

        _sectionIndicatorOnScrollHandler: function(e) {

            this.components.sectionIndicator.scrollUpdate(e);

        },

        _sectionIndicatorButtonClickHandler: function(e) {

            this._scrollToSection(e.currentTarget.dataset.index);

        },

        _buttonToTopClickHandler: function() {

            ScrollManager.scrollTo(null, 0);

        },

        _projectLinkMouseEnterHandler: function(e) {

            this.components.arrows[e.currentTarget.dataset.index].hover();

        },

        _eventOpenHandler: function(e) {

            if (this.ui.sideTitle) TweenMax.to(this.ui.sideTitle, 0.2, {alpha: 0, ease: Power0.easeNone});

        },

        _eventCloseHandler: function(e) {

            if (this.ui.sideTitle) TweenMax.to(this.ui.sideTitle, 0.2, {alpha: 1, ease: Power0.easeNone});

        },

        _elementInViewportHandler: function(el) {

            this._showProject(el);

        }

    });
});
