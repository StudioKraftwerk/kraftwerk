define([
    'superhero',
    'app/utils/ScrollManager',
], function(Superhero, ScrollManager) {

    return Superhero.Component.extend({

        ui: {
            animationElements: '[data-animation-offset]'
        },

        initialize: function() {

            _.bindAll(
                this,
                '_elementInViewportHandler',
                '_timeoutHandler'
            );

        },

        onInitialized: function() {

            // Mathijs: we have to wait a bit before the modules are initialized
            this._timeout = setTimeout(this._timeoutHandler, 100);

        },

        onClose: function() {

            if (this._timeline) this._timeline.kill();
            this._timeline = null;
            if (this._timeout) clearTimeout(this._timeout);

        },

        _setupAnimations: function() {

            var item;

            this._timeline = new TimelineMax({paused: true});

            if (this.ui.animationElements.length > 1) {
                for (var i = 0, len = this.ui.animationElements.length; i < len; i++) {
                    item = this.ui.animationElements[i];
                    this._addItemToTimeline(item);
                }
            } else {
                this._addItemToTimeline(this.ui.animationElements);
            }

        },

        _addItemToTimeline: function(item) {

            var delay = parseFloat(item.getAttribute('data-animation-offset'));
            item.style.opacity = 0;
            // TweenMax.set(item, {y: 80});

            this._timeline.fromTo(item, 0.5, {y: 80}, {y: 0, clearProps: 'y', force3D: true, ease: Power2.easeOut}, delay);
            this._timeline.fromTo(item, 0.2, {alpha: 0}, {alpha: 1, clearProps: 'alpha', force3D: true, ease: Power1.easeIn}, delay + 0.03);

        },

        _elementInViewportHandler: function(e) {

            if (this._timeline) this._timeline.play();

        },

        _timeoutHandler: function() {

            if (this.ui.animationElements && Settings.isDesktop) {
                this._setupAnimations();
                ScrollManager.registerElementScrollNotification(this.el, this._elementInViewportHandler, 350);
            }

        },

    });

});
