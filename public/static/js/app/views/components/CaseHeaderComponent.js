define([
    'superhero',
    'app/utils/ResizeManager',
    'app/utils/ScrollManager',
    'app/utils/GestureManager',
    'app/models/CaseCollection',
    'app/views/components/CaseHeaderGalleryComponent',
    'app/views/components/PaginatorComponent',
    'app/views/components/ArrowIconComponent',
], function(Superhero, ResizeManager, ScrollManager, GestureManager, CaseCollection, CaseHeaderGalleryComponent, PaginatorComponent, ArrowIconComponent) {

    return Superhero.View.extend({

        _throttleDuration: 1000,
        _isPageSideTitleVisible: true,
        _currentSlideIndex: 0,
        _isFirstTime: true,
        _isMetadataVisible: true,
        _isPaginatorVisible: true,

        ui: {
            caseHeaderGallery: '.case-header-gallery',
            paginatorItems: '.list-item-paginator',
            pageSideTitle: '.page-side-title',
            caseHeaderItems: '.case-header-list-item',
            title: '.case-header-copy-title-label',
            titleLine: '.case-header-copy-title-line',
            tagline: '.case-header-copy-tagline',

            buttonNext: '.button-switch-case--next',
            buttonNextInner: '.button-switch-case-inner--next',
            buttonNextIcon: '.button-switch-case-icon--next',
            buttonNextLabel: '.button-switch-case-label--next',

            buttonPrevious: '.button-switch-case--previous',
            buttonPreviousInner: '.button-switch-case-inner--previous',
            buttonPreviousIcon: '.button-switch-case-icon--previous',
            buttonPreviousLabel: '.button-switch-case-label--previous',
        },

        events: {
            'click .button-paginator' : '_buttonClickHandler',

            'tap .button-switch-case--next': '_buttonSwitchCaseNextTapHandler',
            'mouseenter .button-switch-case--next': '_buttonSwitchCaseNextMouseEnterHandler',
            'mouseleave .button-switch-case--next' : '_buttonSwitchCaseNextMouseLeaveHandler',

            'tap .button-switch-case--previous': '_buttonSwitchCasePreviousTapHandler',
            'mouseenter .button-switch-case--previous': '_buttonSwitchCasePreviousMouseEnterHandler',
            'mouseleave .button-switch-case--previous' : '_buttonSwitchCasePreviousMouseLeaveHandler',

            'tap .case-header-button-arrow': '_buttonArrowTapHandler'
        },

        components: {
            gallery: {selector: '.case-header-gallery', module: CaseHeaderGalleryComponent},
            paginator: {selector: '.case-paginator', module: PaginatorComponent},
            arrows: {selector: '.sprite-animation-arrow', module: ArrowIconComponent}
        },

        initialize: function() {

            this._slugs = [];
            this._gotoThrottled = _.throttle(this._goto, this._throttleDuration);

        },

        onInitialized: function() {

            this._gestureManager = new GestureManager({el: this.el});

            this._getSlideOrder();
            this._hideSwitchCaseButtons();
            this._updateSideTitle();

            this._setupEventListeners();
            this._resize();

        },

        onClose: function() {

            if (this._arrowPulseCall) this._arrowPulseCall.kill();

        },

        playIntro: function() {

            var timeline = new TimelineMax();
            timeline.fromTo(this.ui.titleLine, 0.3, {scaleX: 0}, {scale: 1, ease: Power1.easeOut}, 0.3);
            timeline.fromTo(this.ui.titleLine, 0.2, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, 0.3);
            timeline.fromTo(this.ui.title, 0.3, {x: -30}, {x: 0, ease: Power1.easeOut}, 0.3);
            timeline.fromTo(this.ui.title, 0.2, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, 0.3);
            timeline.fromTo(this.ui.tagline, 0.35, {x: -50}, {x: 0, ease: Power1.easeNone}, 0.3);
            timeline.fromTo(this.ui.tagline, 0.35, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, 0.3);
            timeline.addCallback(this.components.arrows[this._currentSlideIndex].pulse, 0.7);
            timeline.addCallback(this.components.gallery.show, 0);

        },

        _setupEventListeners: function() {

            this.listenTo(ResizeManager, 'resize', this._resizeHandler);
            this.listenTo(ResizeManager, 'resize:complete', this._resizeHandler);
            if (Settings.device.type !== 'mobile') this.listenTo(ScrollManager, 'scroll', this._scrollHandler);
            this.listenTo(this._gestureManager, 'swipe:left', this._gestureManagerSwipeLeftHandler);
            this.listenTo(this._gestureManager, 'swipe:right', this._gestureManagerSwipeRightHandler);
            this.listenTo(this.components.gallery, 'transition:complete', this._galleryTransitionCompleteHandler);

        },

        gotoByModel: function(model) {

            var index = this._slugs.indexOf(model.get('slug'));

            this._previousSlideIndex = this._currentSlideIndex;
            this._currentSlideIndex = index;

            if(this._useAnimation) {
                this.components.gallery.gotoAndPlay(index);
            }
            else {
                this.components.gallery.gotoInstantly(index);
            }
            
            this.components.arrows[this._previousSlideIndex].stop();
            this.components.paginator.select(index);
            this._arrowPulseCall = TweenMax.delayedCall(0.8, function() { this.components.arrows[this._currentSlideIndex].pulse(); }.bind(this));
            this._updateSideTitle();
            
            this._useAnimation = false;

        },

        _goto: function(index, navigate) {
            
            var slug = this._slugs[index];
            this.model = CaseCollection.getModelBySlug(slug);

            Superhero.history.navigate('work/' + slug, {trigger: true});

        },

        _getNextSlug: function() {

            this._previousSlideIndex = this._currentSlideIndex;
            var nextSlideIndex = this._currentSlideIndex + 1;
            if (nextSlideIndex > this._slugs.length-1) nextSlideIndex = 0;
            this._currentSlideIndex = nextSlideIndex;

            return this._slugs[nextSlideIndex];

        },

        _getPreviousSlug: function() {

            this._previousSlideIndex = this._currentSlideIndex;
            var previousSlideIndex = this._currentSlideIndex - 1;
            if (previousSlideIndex < 0) previousSlideIndex = this._slugs.length-1;
            this._currentSlideIndex = previousSlideIndex;

            return this._slugs[previousSlideIndex];

        },

        _getSlideOrder: function() {

            for (var i = 0, len = this.ui.caseHeaderItems.length; i < len; i++) {
                this._slugs.push(this.ui.caseHeaderItems[i].dataset.slug);
            }

            var activeModel = CaseCollection.getActiveModel();
            this._currentSlideIndex = CaseCollection.indexOf(activeModel);

        },

        _updateSideTitle: function() {

            if (Settings.isMobile) return;

            this.ui.pageSideTitle.textContent = 'Work / ' + this.model.get('title');

        },

        _hideSwitchCaseButtons: function() {

            this.ui.buttonNextInner.style.opacity = 0;
            this.ui.buttonPreviousInner.style.opacity = 0;

        },

        _showButtonSwitchCaseNext: function() {

            TweenMax.fromTo(this.ui.buttonNextInner, 0.3, {x: 60}, {x: 0, ease: Power2.easeOut});
            TweenMax.fromTo(this.ui.buttonNextInner, 0.25, {alpha: 0}, {alpha: 1, ease: Power0.easeNone});
            TweenMax.fromTo(this.ui.buttonNextLabel, 0.3, {x: 40}, {x: 0, ease: Power2.easeOut});

        },

        _hideButtonSwitchCaseNext: function() {

            TweenMax.fromTo(this.ui.buttonNextInner, 0.2, {x: 0}, {x: -40, ease: Power2.easeIn});
            TweenMax.fromTo(this.ui.buttonNextInner, 0.2, {alpha: 1}, {alpha: 0, ease: Power0.easeNone});
            TweenMax.fromTo(this.ui.buttonNextLabel, 0.2, {x: 0}, {x: -30, ease: Power2.easeIn});

        },

        _showButtonSwitchCasePrevious: function() {

            TweenMax.fromTo(this.ui.buttonPreviousInner, 0.3, {x: -60}, {x: 0, ease: Power2.easeOut});
            TweenMax.fromTo(this.ui.buttonPreviousInner, 0.25, {alpha: 0}, {alpha: 1, ease: Power0.easeNone});
            TweenMax.fromTo(this.ui.buttonPreviousLabel, 0.3, {x: -40}, {x: 0, ease: Power2.easeOut});

        },

        _hideButtonSwitchCasePrevious: function() {

            TweenMax.fromTo(this.ui.buttonPreviousInner, 0.2, {x: 0}, {x: 40, ease: Power2.easeIn});
            TweenMax.fromTo(this.ui.buttonPreviousInner, 0.2, {alpha: 1}, {alpha: 0, ease: Power0.easeNone});
            TweenMax.fromTo(this.ui.buttonPreviousLabel, 0.2, {x: 0}, {x: 30, ease: Power2.easeIn});

        },

        _showPaginator: function() {

            if (this._isPaginatorVisible) return;

            this.components.paginator.show(0.3);
            this._isPaginatorVisible = true;

        },

        _hidePaginator: function() {

            if (!this._isPaginatorVisible) return;

            this.components.paginator.hide();
            this._isPaginatorVisible = false;

        },

        _showPageSideTitle: function() {

            if (this._isPageSideTitleVisible) return;

            TweenMax.to(this.ui.pageSideTitle, 0.2, {autoAlpha: 1, ease: Power0.easeNone});
            this._isPageSideTitleVisible = true;

        },

        _hidePageSideTitle: function() {

            if (!this._isPageSideTitleVisible) return;

            TweenMax.to(this.ui.pageSideTitle, 0.1, {autoAlpha: 0, ease: Power0.easeNone});
            this._isPageSideTitleVisible = false;

        },

        _resize: function() {

            this.el.style.height = ResizeManager.viewportHeight() + 'px';

        },

        _gotoWithAnimation: function(index, trigger) {

            if(this._currentSlideIndex === index) return;

            this._useAnimation = true;
            this._gotoThrottled(index, trigger);

        },

        _getNextIndex: function() {

            var index = this._currentSlideIndex;
            index++;
            index = (index > this._slugs.length-1) ? 0 : index;

            return index;

        },

        _getPreviousIndex: function() {

            var index = this._currentSlideIndex;
            index--;
            index = (index < 0) ? this._slugs.length-1 : index;

            return index;

        },

        _buttonClickHandler: function(e) {

            var index = parseInt(e.currentTarget.dataset.index);
            this._gotoWithAnimation(index, true);

        },

        _buttonSwitchCaseNextTapHandler: function(e) {

            if (Settings.isDesktop) {
                var index = this._getNextIndex();
                this._gotoWithAnimation(index, true);
            }

        },

        _buttonSwitchCaseNextMouseEnterHandler: function(e) {

            if (Settings.isDesktop) this._showButtonSwitchCaseNext();

        },

        _buttonSwitchCaseNextMouseLeaveHandler: function(e) {

            if (Settings.isDesktop) this._hideButtonSwitchCaseNext();

        },

        _buttonSwitchCasePreviousTapHandler: function(e) {

            if (Settings.isDesktop) {
                var index = this._getPreviousIndex();
                this._gotoWithAnimation(index, true);
            }

        },

        _buttonSwitchCasePreviousMouseEnterHandler: function(e) {

            if (Settings.isDesktop) this._showButtonSwitchCasePrevious();

        },

        _buttonSwitchCasePreviousMouseLeaveHandler: function(e) {

            if (Settings.isDesktop) this._hideButtonSwitchCasePrevious();

        },

        _gestureManagerSwipeLeftHandler: function(e) {

            var index = this._getNextIndex();
            this._gotoWithAnimation(index, true);

        },

        _gestureManagerSwipeRightHandler: function(e) {

            var index = this._getPreviousIndex();
            this._gotoWithAnimation(index, true);

        },

        _buttonArrowTapHandler: function() {

            ScrollManager.scrollTo(null, -ResizeManager.viewportHeight());

        },

        _galleryTransitionCompleteHandler: function(e) {

            this._isAnimating = false;

        },

        _scrollHandler: function(e) {

            if (e.y > 20) {
                this._showPageSideTitle();
            } else {
                this._hidePageSideTitle();
            }

            if (e.y > 5) {
                this._hidePaginator();
            } else {
                this._showPaginator();
            }

        },

        _resizeHandler: function(e) {

            this._resize();

        }

    });

});
