// CUSTOM
// ResizeManager.js 0.0.4
// (c) 2015 Superhero Cheesecake

define([
    'underscore',
    'superhero',
], function(_, Superhero) {

    var ResizeManager = Superhero.Module.extend({

        RESIZE_INTERVAL: 250,

        initialize:function() {

            _.bindAll(this, '_windowResizeHandler', '_updateValues', '_startThrottleTimer', '_throttleTimerHandler');

            this.minViewportWidth = window.getComputedStyle(document.body).getPropertyValue('min-width');
            this.minViewportWidth = this.minViewportWidth.replace('px', '');

            this._updateValues();
            this._setupEventListeners();

            setTimeout(this._updateValues, 30);
            
        },

        _setupEventListeners:function() {

            var resizeEvent = (Settings.isTablet || Settings.isMobile || Settings.device.type === 'tablet' || Settings.device.type === 'mobile') ? 'orientationchange' : 'resize';
            window.addEventListener(resizeEvent, this._windowResizeHandler);

        },

        viewportWidth: function(update) {

            if(update) this._updateViewportDimensions();
            return this._viewportWidth;

        },

        viewportHeight: function(update) {

            if(update) this._updateViewportDimensions();
            return this._viewportHeight;

        },

        documentWidth: function(update) {

            if(update) this._updateDocumentDimensions();
            return this._documentWidth;

        },

        documentHeight: function(update) {

            if(update) this._updateDocumentDimensions();
            return this._documentHeight;

        },   

        _updateValues: function() {

            this._updateViewportDimensions();
            this._updateDocumentDimensions();

        },

        _updateViewportDimensions: function() {

            this._viewportWidth = Math.min(window.innerWidth || this.minViewportWidth);
            this._viewportHeight = Math.min(window.innerHeight);

        },

        _updateDocumentDimensions: function() {

            var body = document.body;
            var html = document.documentElement;
            this._documentWidth = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
            this._documentHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

        },

        _startThrottleTimer: function() {

            if(this._throttleTimer) clearTimeout(this._throttleTimer);
            this._throttleTimer = setTimeout(this._throttleTimerHandler, this.RESIZE_INTERVAL);
            
        },

        _throttleTimerHandler: function() {

            this._updateValues();
            this.trigger('resize:complete', this._getEventPayload());

        },

        _windowResizeHandler:function(e) {

            this._updateValues();
            this._startThrottleTimer();
            this.trigger('resize', this._getEventPayload());

        },

        _getEventPayload: function() {

            return {
                target:this, 
                viewportWidth:this._viewportWidth, 
                viewportHeight:this._viewportHeight, 
                documentWidth:this._documentWidth, 
                documentHeight:this._documentHeight
            };

        }

    });

    return new ResizeManager();

});