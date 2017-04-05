define([
    'superhero',
    'app/views/components/CaseLazyComponent',
    'app/views/components/VideoComponent',
    'vendor/froogaloop2.min'
], function(Superhero, CaseLazyComponent, VideoComponent) {

    var _constants = {
        VIMEO_URL: 'https://player.vimeo.com/video/[ID]?api=1'
    };

    return CaseLazyComponent.extend({

        ui: {
            container: '.section-video-container',
            cover: '.section-video-cover',
            playButton: '.button-video--play',
            pauseOverlay: '.section-video-pause-overlay'
        },

        events: {
            'click .button-video--play': '_buttonPlayClickHandler',
            'click .section-video-pause-overlay': '_pauseOverlayClickHandler'
        },

        initialize: function() {

            _.bindAll(
                this,
                '_playerReadyHandler',
                '_playerPlayHandler',
                '_playerPauseHandler',
                '_playerFinishHandler',
                '_iframeLoadHandler'
            );

        },

        onInitializedLazy: function() {

            this._addVideoFrame();

        },

        onClose: function() {

            if (this._player) {
                this._removePlayerEvents();
                this._player.api('unload');
            }

            if (this.ui.iframe) this.ui.iframe.removeEventListener('load', this._iframeLoadHandler);

        },

        _addVideoFrame: function() {

            var vimeoId = this.ui.container.dataset.vimeoId;
            this.ui.iframe = document.createElement('iframe');
            this.ui.iframe.addEventListener('load', this._iframeLoadHandler);
            this.ui.iframe.src = this.constructor.VIMEO_URL.replace('[ID]', vimeoId);
            this.ui.iframe.className = 'section-video-vimeo-iframe';
            this.ui.container.appendChild(this.ui.iframe);

        },

        _setupPlayer: function() {

            this._player = $f(this.ui.iframe);
            this._player.addEvent('ready', this._playerReadyHandler);

            if (Settings.isDesktop) this.ui.playButton.style.zIndex = 20;

        },

        _addPlayerEvents: function() {

            this._player.addEvent('play', this._playerPlayHandler);
            this._player.addEvent('pause', this._playerPauseHandler);
            this._player.addEvent('finish', this._playerFinishHandler);

        },

        _removePlayerEvents: function() {

            this._player.removeEvent('ready', this._playerReadyHandler);
            this._player.removeEvent('play', this._playerPlayHandler);
            this._player.removeEvent('pause', this._playerPauseHandler);
            this._player.removeEvent('finish', this._playerFinishHandler);

        },

        _play: function() {

            this._player.api('play');
            this._showPlayer();
            this._hidePlayerElements();

        },

        _showPlayer: function() {

            this.ui.container.style.opacity = 1;

        },

        _hidePlayer: function() {

            this.ui.container.style.opacity = 0.01;

        },

        _showPlayerElements: function() {

            TweenMax.to(this.ui.cover, 0.3, {autoAlpha: 1, ease: Power0.easeNone});
            TweenMax.to(this.ui.playButton, 0.3, {autoAlpha: 1, ease: Power0.easeNone});

        },

        _hidePlayerElements: function() {

            TweenMax.to(this.ui.cover, 0.3, {autoAlpha: 0, ease: Power0.easeNone});
            TweenMax.to(this.ui.playButton, 0.3, {autoAlpha: 0, ease: Power0.easeNone});

        },

        _buttonPlayClickHandler: function(e) {

            this._play();

        },

        _pauseOverlayClickHandler: function(e) {

            if (this._isPlaying) {
                this._player.api('pause');
            } else {
                this._player.api('play');
            }

        },

        _playerReadyHandler: function(e) {

            this._addPlayerEvents();

        },

        _showPauseOverlay: function() {

            this.ui.pauseOverlay.style.visibility = 'visible';
            this.ui.pauseOverlay.style.opacity = 1;

        },

        _hidePauseOverlay: function() {

            this.ui.pauseOverlay.style.visibility = 'hidden';
            this.ui.pauseOverlay.style.opacity = 0;

        },

        _playerPlayHandler: function(e) {

            this._isPlaying = true;

            this._showPlayer();
            this._hidePlayerElements();

            if (Settings.device.os === 'AndroidOS') this._showPauseOverlay();

        },

        _playerPauseHandler: function(e) {

            this._isPlaying = false;

        },

        _playerFinishHandler: function(e) {

            this._hidePlayer();
            this._showPlayerElements();

            this.ui.playButton.style.zIndex = 20;
            if (Settings.device.os === 'AndroidOS') this._hidePauseOverlay();

        },

        _iframeLoadHandler: function() {

            this._setupPlayer();

        }

    }, _constants);

});
