define([
    'superhero',
], function(Superhero) {

    var _constants = {
        TRIANGLE_WIDTH: 29
    };

    return Superhero.Component.extend({

        ui: {
            background: '.button-primary-background',
            labelForeground: '.button-primary-label-foreground',
            labelBackground: '.button-primary-label-background'
        },

        events: {
            'mouseenter': '_mouseEnterHandler',
            'mouseleave': '_mouseLeaveHandler'
        },

        onInitialized: function() {

            this._getWidth();
            this._hideElements();

        },

        _getWidth: function() {

            // this._width = this.el.offsetWidth + this.constructor.TRIANGLE_WIDTH;
            this._width = 230; // quickfix

        },

        _hideElements: function() {

            TweenMax.set(this.ui.background, {x: -this._width, alpha: 0});
            TweenMax.set(this.ui.labelForeground, {alpha: 0, x: -40});

        },

        _startMouseEnterAnimation: function() {

            TweenMax.to(this.ui.background, 0.35, {x: 0, ease: Power3.easeOut});
            TweenMax.to(this.ui.background, 0.15, {alpha: 1, ease: Power0.easeNone});
            TweenMax.to(this.ui.labelBackground, 0.2, {x: 20, ease: Power1.easeInOut});
            TweenMax.to(this.ui.labelForeground, 0.5, {x: 0, ease: Power3.easeOut});
            this._labelForegroundAlphaTween = TweenMax.to(this.ui.labelForeground, 0.1, {alpha: 1, ease: Power0.easeNone, delay: 0.05});

        },

        _startMouseLeaveAnimation: function() {

            if (this._labelForegroundAlphaTween) this._labelForegroundAlphaTween.kill();

            TweenMax.to(this.ui.background, 0.25, {x: -this._width, ease: Power3.easeInOut});
            TweenMax.to(this.ui.background, 0.25, {alpha: 0, ease: Power0.easeNone});
            TweenMax.to(this.ui.labelBackground, 0.5, {x: 0, ease: Power3.easeOut});
            TweenMax.to(this.ui.labelForeground, 0.25, {x: -40, ease: Power3.easeInOut});
            TweenMax.to(this.ui.labelForeground, 0.25, {alpha: 0, ease: Power0.easeNone});

        },

        _mouseEnterHandler: function(e) {

            this._startMouseEnterAnimation();

        },

        _mouseLeaveHandler: function(e) {

            this._startMouseLeaveAnimation();

        },

    }, _constants);

});
