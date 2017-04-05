define([
    'superhero',
], function(Superhero) {

	return Superhero.Component.extend({

        _index: 0,
        _currentIndex: 0,
        _iteration: 0,
        _locked: false,

        events: {
            
        },

        ui: {
            items: '.list-item-paginator',
            buttons: '.button-paginator'
        },

        initialize: function() {

            this._index = 0;
            this._locked = false;
            this._iteration = 0;

        },

        onInitialized: function() {

            this.select(0);
            this.transitionIn();

            TweenMax.set(this.ui.items, {alpha: 0, scaleX: 0.4, x: 0});

        },

        onClose: function() {

            // if (this.timelineTranstitionIn) this.timelineTranstitionIn.kill();

        },

        transitionIn: function () {

            // this.timelineTranstitionIn = new TimelineMax();
            // this.timelineTranstitionIn.set(this.ui.items, {alpha: 0, scaleX: 0.4});
            // this.timelineTranstitionIn.addCallback(this.show, 0.7, null, this);
            this.show(0.7);

        },

        show: function(delay) {

            delay = delay || 0;
            TweenMax.staggerTo(this.ui.items, 0.08, {alpha: 1, x: 0, scaleX: 1, delay: delay, ease: SlowMo.easeOut}, 0.04);

        },

        hide: function() {



            // TweenMax.to(this.el, 0.2, {y: -60, rotation: -1,});
            TweenMax.staggerTo(this.ui.items, 0.08, {alpha: 0, x: 28*0.6, scaleX: 0.4, overwrite: 'all', ease: SlowMo.easeOut}, 0.04);

        },

        next: function() {

            this._currentIndex++;
            if(this._currentIndex > this.ui.items.length-1) {
                this._currentIndex = 0;
            }

            this.select(this._currentIndex);

        },

        previous: function() {

            this._currentIndex--;
            if(this._currentIndex < 0) {
                this._currentIndex = this.ui.items.length-1;
            }

            this.select(this._currentIndex);

        },

        select: function(index) {

            if (this._locked) return;

            this._deselectCurrent();

            // This is needed when images get repeated in the html file to make the gallery infinite
            if (index > this.ui.items.length - 1) {
                this._iteration = 1;
                index = index - this.ui.items.length;
            } else {
                this._iteration = 0;
            }

            var button = this.ui.buttons[index];
            button.classList.add('button-paginator--active');
            button.parentNode.classList.add('list-item--active');

            this._index = index;

        },

        lock: function() {

            this._locked = true;

        },

        unlock: function() {

            this._locked = false;

        },

        _deselectCurrent: function() {

            var button = this.ui.buttons[this._index];
            button.classList.remove('button-paginator--active');
            button.parentNode.classList.remove('list-item--active');

        }
        
	});

});
