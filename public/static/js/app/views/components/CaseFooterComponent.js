define([
    'superhero',
    'app/models/CaseCollection',
    'app/utils/ScrollManager',
    'app/views/components/ArrowIconComponent',
], function(Superhero, CaseCollection, ScrollManager, ArrowIconComponent) {

    return Superhero.View.extend({

        ui: {
            titlePrevious: '.case-footer-button-content-title--previous',
            titleNext: '.case-footer-button-content-title--next',
            clientPrevious: '.case-footer-button-content-client--previous',
            clientNext: '.case-footer-button-content-client--next',
            buttonPrevious: '.button-case-footer--previous',
            buttonNext: '.button-case-footer--next',
            backgroundPrevious: '.case-footer-button-background--previous',
            backgroundNext: '.case-footer-button-background--next',

            overlays: '.case-footer-button-overlay'
        },

        events: {
            'click .case-footer-button': '_buttonClickHandler',
            'mouseenter .case-footer-button': '_buttonMouseEnterHandler',
            'mouseleave .case-footer-button': '_buttonMouseLeaveHandler',
        },

        components: {
            arrows: {selector: '.case-footer-sprite-animation-arrow', module: ArrowIconComponent}
        },

        onInitialized: function() {

            this._addData();
            this._showArrows();

        },

        _addData: function() {

            var previousModel = CaseCollection.getPreviousModel();
            this.ui.titlePrevious.textContent = previousModel.get('title');
            this.ui.clientPrevious.textContent = previousModel.get('client');
            this.ui.buttonPrevious.href = '/work/' + previousModel.get('slug');
            this.ui.backgroundPrevious.style.backgroundImage = 'url(' + previousModel.get('image') + ')';

            var nextModel = CaseCollection.getNextModel();
            this.ui.titleNext.textContent = nextModel.get('title');
            this.ui.clientNext.textContent = nextModel.get('client');
            this.ui.buttonNext.href = '/work/' + nextModel.get('slug');
            this.ui.backgroundNext.style.backgroundImage = 'url(' + nextModel.get('image') + ')';

        },

        _showArrows: function() {

            this.components.arrows[0].show();
            this.components.arrows[1].show();

        },

        _buttonClickHandler: function(e) {

            ScrollManager.scrollTo(0, 0, 0);

        },

        _buttonMouseEnterHandler: function(e) {

            var index = e.currentTarget.dataset.index;
            TweenMax.to(this.ui.overlays[index], 0.2, {alpha: 0.4, ease: Power0.easeNone});
            this.components.arrows[index].hover();

        },

        _buttonMouseLeaveHandler: function(e) {

            var index = e.currentTarget.dataset.index;
            TweenMax.to(this.ui.overlays[index], 0.1, {alpha: 1, ease: Power0.easeNone});

        }

    });

});
