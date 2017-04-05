define([
    'easeljs'
], function(easel) {

    //Patch easel because it can't destroy itself.

    createjs.Stage.prototype.close = function() {

        while(this.children.length) {
            // console.log('name:', this.children[0]);

            this.children[0].parent = null;
            this.children[0].removeAllEventListeners();
            this.children[0].cacheCanvas = null;
            if(this.children[0].graphics) this.children[0].graphics._ctx = null;


            this.children.shift();
        }

        this.removeAllEventListeners();
        this.enableDOMEvents(false);

        this.canvas = null;


        createjs.SpriteSheetUtils._workingCanvas = null;
        // createjs.DisplayObject._hitTestCanvas = null;
        // createjs.DisplayObject._hitTestContext = null;
    }

});