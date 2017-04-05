define([
    'superhero',
    'app/utils/FileLoader',
    'app/models/CaseCollection',
    'app/manifests/PrePreloadManifest',
    'app/manifests/ApplicationManifest',
    'app/modules/PreloaderIconsModule'
], function(Superhero, FileLoader, CaseCollection, PrePreloadManifest, ApplicationManifest, PreloaderIconsModule) {

    return Superhero.Component.extend({

        ui: {
            canvas: '.preloader-canvas'
        },

        initialize: function() {

            _.bindAll(
                this,
                '_hideCompleteHandler',
                '_triggerComplete'
            );

        },

        onInitialized: function() {

            this._setup();
            this._loadPreManifest();
            this._setupEventListeners();

        },

        onClose: function() {

            if (this._icon) this._icon.close();

        },

        _setup: function() {

            this._fileLoader = new FileLoader();
            this._preloadData = ApplicationManifest.get();
            this._isFirstTime = this._checkFirstTime();

        },

        _checkFirstTime: function() {

            try {
                if (window.localStorage && window.localStorage.getItem('intro') == 'short') {
                    return false;
                } else {
                    window.localStorage.setItem('intro', 'short');
                }
            } catch (err) {
                console.log("WARNING: cannot set local storage");
            }

            return true;

        },

        _setupEventListeners: function() {

            this.listenToOnce(CaseCollection, 'sync', this._caseCollectionSyncHandler);

        },

        _loadPreManifest: function() {

            this.listenToOnce(this._fileLoader, 'manifest:load:complete', this._preManifestCompleteHandler);
            this._fileLoader.loadManifest('pre-preloader', this._getPrePreloadManifest(), true);

        },

        _getPrePreloadManifest: function() {

            var types = ['eye', 'hand', 'lighting'];
            this._iconType = types[Math.random() * 3 >> 0];
            var manifest = PrePreloadManifest[this._iconType];

            // return this._getPPI() > 1 ? manifest.retina : manifest.normal;
            return manifest.normal;

        },

        _getPPI: function() {

            var PPI = 1;
            var ratio = window.devicePixelRatio || 1;

            if (ratio > 2.5) PPI = 3;
            if (ratio > 1.5) PPI = 2;

            return PPI;

        },

        _hide: function() {

            if (this._isFirstTime) {
                if (this._isManifestLoadComplete && this._isIconAnimationComplete) {
                    this._triggerComplete();
                    TweenMax.to(this.ui.canvas, 0.2, {alpha: 0, ease: Power0.easeNone});
                    TweenMax.to(this.el, 0.3, {autoAlpha: 0, delay: 0.2, ease: Power0.easeNone, onComplete: this._hideCompleteHandler});
                }
            } else {
                if (this._isManifestLoadComplete) {
                    this.stopListening(this._icon, 'animation:complete', this._preloaderIconAnimationCompleteHandler);
                    TweenMax.to(this.ui.canvas, 0.2, {alpha: 0, delay: 2.5, ease: Power0.easeNone});
                    TweenMax.delayedCall(2.8, this._triggerComplete);
                    TweenMax.to(this.el, 0.3, {autoAlpha: 0, delay: 3, ease: Power0.easeNone, onComplete: this._hideCompleteHandler});
                }
            }

        },

        _triggerComplete: function() {

            this.trigger('complete');

        },

        _addCaseHeaderImagesToManifest: function() {

            var model;

            for (var i = 0, len = CaseCollection.length; i < len; i++) {
                model = CaseCollection.at(i);
                if (model.get('header_image')) this._preloadData.push({id: model.get('slug'), src: model.get('header_image')});
                this._preloadData.push({id: model.get('slug') + '-background', src: model.get('header_background_image')});
            }

        },

        _manifestLoadCompleteHandler: function(e) {

            this._isManifestLoadComplete = true;
            this._hide();

        },

        _caseCollectionSyncHandler: function(e) {

            this._addCaseHeaderImagesToManifest();
            this._fileLoader.loadManifest('preloader', this._preloadData, true);

        },

        _preManifestCompleteHandler: function(e) {

            this.listenToOnce(this._fileLoader, 'manifest:load:complete', this._manifestLoadCompleteHandler);
            CaseCollection.fetch();

            this._icon = new PreloaderIconsModule({canvas: this.ui.canvas, type: this._iconType});
            this.listenTo(this._icon, 'animation:complete', this._preloaderIconAnimationCompleteHandler);
            this._icon.play();

        },

        _preloaderIconAnimationCompleteHandler: function(e) {

            this._isIconAnimationComplete = true;
            this._hide();

            if (!this._isManifestLoadComplete) this._icon.play();

        },

        _hideCompleteHandler: function(e) {

            this.close();

        },

    });

});
