define([
    'superhero',
    'app/modules/GlitchBackgroundModule',
    'app/views/components/ButtonPrimaryComponent'
], function(Superhero, GlitchBackgroundModule, ButtonPrimaryComponent) {

    return Superhero.View.extend({

        className: 'page page-intro',
        template: 'pages/intro',

        ui: {
            buttonPrimary: '.button-primary',
            logo: '.page-intro-logo',
            body: '.page-intro-body',
            buttons: '.page-intro-buttons',
            column: '.page-intro-column',
            sideTitle: '.page-side-title',
            contactButton: '.page-intro-button-contact',
            backgroundCanvas: '.page-intro-background',
        },

        onInitialized: function() {

            this._setup();
            this._setupButtons();

            this.ui.contactButton.style.opacity = 0;
            this.ui.logo.style.opacity = 0;
            this.ui.body.style.opacity = 0;
            this.ui.buttons.style.opacity = 0;
            this.ui.sideTitle.style.opacity = 0;

        },

        onClose: function() {

            if (this.backgroundModule) this.backgroundModule.close();
            if (this._introTimeline) this._introTimeline.kill();

        },

        _setup: function() {

            if (!Settings.isMobile) this.backgroundModule = new GlitchBackgroundModule({el: this.ui.backgroundCanvas});

        },

        transitionIn: function() {

            this._introTimeline = new TimelineMax({delay: 0.3});
            this._introTimeline.to(this.ui.sideTitle, 0.2, {alpha: 1, ease: Power0.easeNone}, 0);

            this._introTimeline.from(this.ui.logo, 0.45, {y: 30, ease: Power2.easeOut}, 0);
            this._introTimeline.to(this.ui.logo, 0.2, {alpha: 1, ease: Power0.easeNone}, 0.03);

            this._introTimeline.from(this.ui.body, 0.45, {y: 30, ease: Power2.easeOut}, 0.07);
            this._introTimeline.to(this.ui.body, 0.2, {alpha: 1, ease: Power0.easeNone}, 0.10);

            this._introTimeline.from(this.ui.buttons, 0.45, {y: 30, ease: Power2.easeOut}, 0.14);
            this._introTimeline.to(this.ui.buttons, 0.2, {alpha: 1, ease: Power0.easeNone}, 0.17);

            this._introTimeline.to(this.ui.contactButton, 0.2, {alpha: 1, ease: Power0.easeNone, clearProps: 'opacity'}, 0.2);

        },

        transitionOut: function(callback) {

            this._outroTimeline = new TimelineMax({onComplete: callback});
            this._outroTimeline.to([this.ui.column, this.ui.sideTitle, this.ui.contactButton], 0.3, {alpha: 0}, 0);
            this._outroTimeline.to(this.el, 0.3, {alpha: 0}, 0.3);

        },

        _setupButtons: function() {

            if (Settings.isMobile) return;

            for (var i = 0, len = this.ui.buttonPrimary.length; i < len; i++) {
                this.addComponent('buttonPrimary', ButtonPrimaryComponent, this.ui.buttonPrimary[i]);
            }

        },

    });

});
