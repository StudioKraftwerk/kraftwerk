define([
    'underscore',
    'superhero',
], function(_, Superhero) {

    return Superhero.Module.extend({

        initialize: function(options) {

            _.bindAll(
                this,
                '_touchstartHandler',
                '_touchmoveHandler'
            );

            options.el.addEventListener('touchstart', this._touchstartHandler);
            options.el.addEventListener('touchmove', this._touchmoveHandler);

        },

        onClose: function() {

            options.el.removeEventListener('touchstart', this._touchstartHandler);
            options.el.removeEventListener('touchmove', this._touchmoveHandler);

        },

        _touchstartHandler: function(e) {

            this._swipeStart(e);

        },

        _touchmoveHandler: function(e) {

            this._swipeMove(e);

        },

        _swipeStart: function(e) {

            this._swipe = this._swipe || {};
            this._swipe.start = this._swipe.start || {};
            this._swipe.delta = this._swipe.delta || {};

            this._swipe.start.x = e.touches[0].clientX;
            this._swipe.start.y = e.touches[0].clientY;

        },

        _swipeMove: function(e) {

            if(!this._swipe.start.x || !this._swipe.start.y) return;

            this._swipe.delta.x = this._swipe.start.x - e.touches[0].clientX;
            this._swipe.delta.y = this._swipe.start.y - e.touches[0].clientY;

            if ( Math.abs(this._swipe.delta.x) > Math.abs(this._swipe.delta.y) ) {
                if ( this._swipe.delta.x > 0 ) {
                    /* left swipe */
                    this.trigger('swipe:left');
                } else {
                    /* right swipe */
                    this.trigger('swipe:right');
                }
            } else {
                if ( this._swipe.delta.y > 0 ) {
                    /* up swipe */
                    this.trigger('swipe:up');
                } else {
                    /* down swipe */
                    this.trigger('swipe:down');
                }
            }

            this._swipe.start.x = null;
            this._swipe.start.y = null;

        },

    });

});
