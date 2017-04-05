define([
    'superhero',
    'app/utils/ScrollManager',
    'app/utils/ResizeManager',
    'app/views/components/CaseHeaderComponent',
    'app/views/components/MenuIconComponent',
    'app/views/components/ButtonPrimaryComponent',
], function(Superhero, ScrollManager, ResizeManager, CaseHeaderComponent, MenuIconComponent, ButtonPrimaryComponent) {

    return Superhero.LayoutView.extend({

        className: 'page page-case',
        template: 'pages/case',

        ui: {
            container: '.case-header-container',
            client: '.case-header-metadata-value-client',
            projectType: '.case-header-metadata-value-project-type',
            headerButton: '.case-header-metadata-button',
            headerButtonLabel: '.case-header-metadata-button-label',
            caseHeaderButtonColumn: '.case-header-metadata-column--last',

            metadata: '.case-header-metadata',
            metadataKeys: '.case-header-metadata-key',
            metadataValues: '.case-header-metadata-value',
        },

        regions: {
            case: '.case-content'
        },

        components: {
            menuIcon: {selector: '.button-main-menu', module: MenuIconComponent}
        },

        onInitialized: function(e) {

            this.el.style.opacity = 0;

            this._setup();
            this._resize();
            this._updateMetadata();
            this._setupEventListeners();

        },

        transitionIn: function() {

            ScrollManager.scrollTop(0);
            TweenMax.to(this.el, 0.3, {alpha: 1, ease: Power0.easeNone});

            this.components.caseHeaderComponent.playIntro();

        },

        transitionOut: function(callback) {

            TweenMax.to(this.el, 0.2, {alpha: 0, ease: Power0.easeNone, onComplete: callback});

        },

        _setup: function() {

            this.addComponent('caseHeaderComponent', CaseHeaderComponent, '.case-header', {model: this.model});

            if (Settings.device.type !== 'mobile') {
                this.addComponent('buttonPrimary', ButtonPrimaryComponent, '.button-primary');
                this._hideMetadata(true);
            }

        },

        _setupEventListeners: function() {

            if (Settings.device.type !== 'mobile') this.listenTo(ScrollManager, 'scroll', this._scrollHandler);
            this.listenTo(ResizeManager, 'resize', this._resizeHandler);
            this.listenTo(ResizeManager, 'resize:complete', this._resizeHandler);

        },

        updateHeader: function(model) {

            this.model = model;
            this.components.caseHeaderComponent.gotoByModel(this.model);
            this._updateMetadata();

            ScrollManager.resetElementScrollNotifications();

        },

        _updateMetadata: function() {

            this.ui.client.textContent = this.model.get('client');
            this.ui.projectType.textContent = this.model.get('project_type');

            if (this.model.get('header_button')) {
                this.ui.caseHeaderButtonColumn.style.display = null;
                this.ui.headerButtonLabel[0].textContent = this.model.get('header_button');
                this.ui.headerButtonLabel[1].textContent = this.model.get('header_button');
                this.ui.headerButton.href = this.model.get('header_button_url');
            } else {
                this.ui.caseHeaderButtonColumn.style.display = 'none';
            }

        },

        _showMetadata: function() {

            if (this._isMetadataVisible) return;

            var timeline = new TimelineMax();
            timeline.to(this.ui.metadata, 0.2, {y: 0, ease: Power2.easeOut}, 0);
            timeline.fromTo(this.ui.metadataKeys, 0.3, {y: 7}, {y: 0, ease: Power1.easeOut}, 0.1);
            timeline.fromTo(this.ui.metadataKeys, 0.2, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, 0.1);
            timeline.fromTo(this.ui.metadataValues, 0.3, {y: -7}, {y: 0, ease: Power1.easeOut}, 0.1);
            timeline.fromTo(this.ui.metadataValues, 0.2, {alpha: 0}, {alpha: 1, ease: Power0.easeNone}, 0.1);
            this._isMetadataVisible = true;

        },

        _hideMetadata: function(instantly) {

            instantly = instantly || false;

            if (!this._isMetadataVisible && !instantly) return;

            var duration = instantly ? 0 : 0.2;
            var height = (Settings.device.type === 'desktop') ? 120 : this.ui.metadata.offsetHeight;

            TweenMax.to(this.ui.metadata, duration, {y: height, ease: Power2.easeOut});
            this._isMetadataVisible = false;

        },

        _resize: function() {

            if (!Settings.isMobile) this._resizeContainer();

        },

        _resizeContainer: function() {

            this.ui.container.style.width = ResizeManager.viewportWidth() + 'px';
            this.ui.container.style.height = ResizeManager.viewportHeight() + 'px';

        },

        _scrollHandler: function(e) {

            if (e.y > 20) {
                this._showMetadata();
            } else {
                this._hideMetadata();
            }

        },

        _resizeHandler: function() {

            this._resize();

        }

    });

});
