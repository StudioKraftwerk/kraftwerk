define([
    'superhero',
    'app/utils/ScrollManager',
    'app/utils/FileLoader',
], function(Superhero, ScrollManager, FileLoader) {

    return Superhero.View.extend({

        __settings: {},

        initialize: function(settings) {

            if(settings) this.__settings = settings;
            if(!this.fileLoader) this.fileLoader = new FileLoader();

        },

        onInitialized: function() {

            _.bindAll(this, '_elementInViewportHandler');
            ScrollManager.registerElementScrollNotification(this.el, this._elementInViewportHandler, -200);

        },

        onClose: function() {

            this.__settings = null;

        },

        _elementInViewportHandler: function() {

            if(this.onInitializedLazy) this.onInitializedLazy(this.__settings);

        }

    });
});
