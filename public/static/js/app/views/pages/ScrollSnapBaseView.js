define([
    'superhero',

    // UTILS
    'app/utils/ScrollManager',
    'app/utils/ResizeManager',
    'app/utils/ScrollSnap',
], function(
    Superhero,
    ScrollManager, ResizeManager, ScrollSnap
) {

    return Superhero.View.extend({

        initialize: function() {
            this.ui.sections = '.section';
            this.ui.scrollSnap = '.scroll-snap';

            _.bindAll(this, '__resizeHandler', '__build');
        },

        onInitialized: function() {

            var inputType = (Settings.isDesktop) ? 'scroll' : 'touch';

            this.__scrollSnap = new ScrollSnap({
                el: this.ui.scrollSnap,
                mousewheelContainer: document.body,
                inputType: inputType
            });

            this.__enablePageScrollStyling();

            this.__updateSnapArray();

            this.__setupEventListeners();

            TweenMax.delayedCall(0.1, this.__build);

        },

        onClose: function() {

            this.__scrollSnap.close();

            this.__scrollSnap = null;

            clearTimeout(this.__resizeTimeout);

            this.__disablePageScrollStyling();

        },

        __build: function() {

            this.__resize();

            if(this._transitionIn) this._transitionIn();

        },

        __setupEventListeners: function() {

            this.listenTo(ResizeManager, 'resize', this.__resizeHandler);
            this.listenTo(ResizeManager, 'resize:complete', this.__resizeHandler);

        },

        __enablePageScrollStyling: function() {

            this.__setDocumentHeight();

            nl.kraftwerk.applicationView.el.style.position = 'fixed';
            nl.kraftwerk.applicationView.el.style.height = ResizeManager.viewportHeight() + 'px';

        },

        __disablePageScrollStyling: function() {

            document.body.style.removeProperty('height');

            nl.kraftwerk.applicationView.el.style.removeProperty('position');
            nl.kraftwerk.applicationView.el.style.removeProperty('height');

        },

        __updateSnapArray: function() {

            this.__scrollArray = [];
            this.__snapArray = [];

            this.__sections = this.el.querySelectorAll('[data-snap]');

            var section, offsetTop;
            var snapType = Settings.isMobile ? 'snapMobile' : 'snap';

            for(var i=0, limit=this.__sections.length; i<limit; i++) {

                section = this.__sections[i];
                offsetTop = -ScrollManager._getElementGlobalOffsetTop(section);

                this.__snapArray.push(offsetTop);

                if(section.dataset[snapType] == "false") {
                    var start = offsetTop;
                    var end = -(-offsetTop+section.offsetHeight);

                    // check next
                    if(this.__sections[i+1] && this.__sections[i+1].dataset[snapType] == "false") {
                        this.__scrollArray.push(
                            {start: start, end: end}
                        );
                    }
                    else {
                        this.__scrollArray.push(
                            {start: start, end: end + ResizeManager.viewportHeight()}
                        );
                    }
                }
            }

            this.__snapArray = _.uniq(this.__snapArray);
            this.__snapArray = _.sortBy(this.__snapArray, function(num) {
                return -num;
            });

        },

        __setDocumentHeight: function() {

            document.body.style.height = this.__scrollSnap.getScrollHeight() + 'px';
            
        },

        __resizeStage: function() {

            for (var i = 0, limit = this.ui.sections.length; i < limit; i++) {

                if (Settings.isMobile && this.ui.sections[i].dataset.snapMobile == 'false') {

                } else {
                    this.ui.sections[i].style.height = ResizeManager.viewportHeight() + 'px';
                }

            }

        },

        __resize: function() {

            this.__resizeStage();
            this.__setDocumentHeight();
            this.__updateSnapArray();

            this.__scrollSnap.updateSnapPoints(this.__snapArray);
            this.__scrollSnap.updateFreeScrollRanges(this.__scrollArray);

            clearTimeout(this.__resizeTimeout);
            this.__resizeTimeout = setTimeout(this.__scrollSnap.snapToCurrentPoint, 400);

        },

        __resizeHandler: function() {

            this.__resize();

        }

    });

});
