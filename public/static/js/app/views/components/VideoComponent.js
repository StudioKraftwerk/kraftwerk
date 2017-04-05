define([
    'superhero',
    'app/utils/ResizeManager',
    // 'static/js/vendor/froogaloop2.min.js'
], function(Superhero, ResizeManager) {

    return Superhero.Component.extend({

        initialize: function() {
            _.bindAll(
                this,
                '_videoEndedHandler',
                '_timeUpdateHandler'
            );
        },

        onInitialized: function() {
            this._videoWidth = this.el.width;
            this._videoHeight = this.el.height;

            this._resize();

            this._setupEventListeners();
        },

        ui: {
            videoPlayer: '.section-video-player',
            videoStatus: '.status',
            button: '.button-video',
            buttonPlay: '.button-video--play',
            buttonPause: '.button-video--pause'

        },

        onClose: function(){
            this._removeEventListeners();
        },


        // PUBLIC

        play: function() {
            this.el.play();
        },

        pause: function() {
            this.el.pause();
        },

        paused: function() {
            return this.el.paused;
        },

        stop: function() {
            this.el.currentTime = 0;
            this.el.pause();
        },

        mute: function() {
            this.el.muted = true;
        },

        unmute: function() {
            this.el.muted = false;
        },

        getCurrentTime: function() {
            return this.el.currentTime;
        },


        // PRIVATE

        _getDuration: function() {
            return this.el.duration;
        },

        _setupEventListeners: function() {
            this.listenTo(ResizeManager, 'resize', this._resizeHandler);
            this.listenTo(ResizeManager, 'resize:complete', this._resizeHandler);
            this.el.addEventListener('timeupdate', this._timeUpdateHandler);
            this.el.addEventListener('ended', this._videoEndedHandler);
        },

        _removeEventListeners: function() {
            this.el.removeEventListener('timeupdate', this._timeUpdateHandler);
            this.el.removeEventListener('ended', this._videoEndedHandler);
        },

        _resize: function() {
            this._width = this.el.parentNode.offsetWidth;
            this._height = this.el.parentNode.offsetHeight;

            var scale = Math.min(this._width/this._videoWidth, this._height/this._videoHeight);

            var offsetLeft = (this._videoWidth*scale) - this._width;
            var offsetTop = (this._videoHeight*scale) - this._height;

            this.el.style.width = this._videoWidth*scale + 'px';
            this.el.style.height = this._videoHeight*scale + 'px';

            this.el.style.marginTop = -Math.round(offsetTop/2) + 'px';
            this.el.style.marginLeft = -Math.round(offsetLeft/2) + 'px';
        },

        _resizeHandler: function() {
            this._resize();
        },

        _videoEndedHandler: function() {
            this.trigger('video:ended');
        },

        _videoProgress: function() {
            var cur = this.getCurrentTime();
            var dur = this._getDuration();
            var perc = (100/dur) * cur;

            var percProgression = -100 + perc;
        },

        _timeUpdateHandler: function() {
            this._videoProgress();
        },



    });

});
