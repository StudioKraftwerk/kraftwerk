define([
    'superhero',
    'app/utils/FileLoader',
    'app/utils/ScrollManager',
    'app/utils/EventBus',
    'app/views/components/MenuComponent',
    'app/views/components/MenuIconComponent',
    'app/views/components/PreloaderComponent'
], function(Superhero, FileLoader, ScrollManager, EventBus, MenuComponent, MenuIconComponent, PreloaderComponent) {

    return Superhero.LayoutView.extend({

        regions: {
            main: '.main'
        },

        ui: {
            main: '.main',
            menu: '.list-menu',
            sideTitle: '.case-title-side',
            mobileNavigation: '.mobile-navigation',
            mobileNavigationBackground: '.mobile-navigation-background'
        },

        events: {
            'click a[href^="/"]': 'globalClickHandler',
            'click .button-main-logo': '_buttonMainLogoClickHandler'
        },

        components: {
            preloader: {selector: '.preloader', module: PreloaderComponent},
        },

        onInitialized: function() {

            this._setupEventListeners();

        },

        _setupEventListeners: function() {

            this.listenTo(Superhero.history, 'route', this._routeChangehandler);
            this.listenTo(this.components.preloader, 'complete', this._preloaderCompleteHandler);

            if (Settings.device.type === 'mobile') this.listenTo(ScrollManager, 'scroll', this._scrollHandler);

        },

        _start: function() {

            Superhero.history.start({pushState: true});

            var fragment = document.location.pathname.replace(Superhero.history.root, '') + document.location.search;
            Backbone.history.navigate(fragment, {trigger: true});

        },

        _updateMenu: function(route) {

            if (route.search('work') >= 0) route = 'work';

            if (this._activeMenuButton) {
                this._activeMenuButton.classList.remove('button-menu--active');
                TweenMax.set(this._activeMenuButton.querySelector('.button-menu-line'), {scaleX: 0});
            }

            this._activeMenuButton = this.ui.menu.querySelector('a[href^="/' + route + '"]');
            if (!this._activeMenuButton) return;

            this._activeMenuButton.classList.add('button-menu--active');
            TweenMax.set(this._activeMenuButton.querySelector('.button-menu-line'), {scaleX: 1});

        },

        _updateMobileNavigation: function(route) {

            if (route === 'intro') {
                TweenMax.to(this.ui.mobileNavigation, 0.2, {alpha: 0, ease: Power0.easeNone});
            } else {
                TweenMax.to(this.ui.mobileNavigation, 0.2, {alpha: 1, ease: Power0.easeNone});
            }

        },

        _showMobileNavigationBackground: function() {

            TweenMax.to(this.ui.mobileNavigationBackground, 0.3, {alpha: 0.6, ease: Power0.easeNone});

        },

        _hideMobileNavigationBackground: function() {

            TweenMax.to(this.ui.mobileNavigationBackground, 0.15, {alpha: 0, ease: Power0.easeNone});

        },

        _routeChangehandler: function(e) {

            var route = Superhero.history.getFragment();

            this._updateMenu(route);
            if (Settings.isMobile) this._updateMobileNavigation(route);

        },

        globalClickHandler: function(e) {

            e.preventDefault();
            Superhero.history.navigate(e.currentTarget.pathname, {trigger: true});

        },

        _preloaderCompleteHandler: function(e) {

            this._start();

            this.addComponent('menuMenu', MenuComponent, '.menu');
            if (Settings.isMobile) this.addComponent('menuIcon', MenuIconComponent, '.mobile-navigation .button-main-menu');

        },

        _scrollHandler: function(e) {

            if (e.y > 20) {
                this._showMobileNavigationBackground();
            } else {
                this._hideMobileNavigationBackground();
            }

        },

        _buttonMainLogoClickHandler: function(e) {

            EventBus.trigger('menu:close');

        },

    });
});
