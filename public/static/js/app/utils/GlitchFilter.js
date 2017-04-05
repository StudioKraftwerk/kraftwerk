
/**
 * @module EaselJS
 */
 
// namespace:
this.createjs = this.createjs||{};
 
(function() {
    "use strict";
 
    // constructor:
    function GlitchFilter( glitchRefreshRate, glitchLinesX, glitchLinesY ) {
     
        this.glitchRefreshRate = glitchRefreshRate || 5;
        this.glitchLinesX = glitchLinesX || 4;
        this.glitchLinesY = glitchLinesY || 30;

        this._glitchCouter = 0;
 
    }
    var p = createjs.extend(GlitchFilter, createjs.Filter);
 
    /** docced in super class **/
    p.clone = function() {
        return new GlitchFilter(this.glitchRefreshRate, this.glitchLinesX, this.glitchLinesY);
    };
 
    /** docced in super class **/
    p.toString = function() {
        return "[GlitchFilter]";
    };
 
    // private methods:

    p._cloneArray = function (base) {
        var newArray = [];
        for(var i=0; i < base.length; i++) {
            newArray[i] = base[i];
        }
        return newArray;
    };

    p.getRandInt = function(min, max) {
        return (Math.floor(Math.random() * (max - min) + min));
    };
    
    p.applyFilter = function(ctx, x, y, width, height, targetCtx, targetX, targetY) {
        // this is the default behaviour because most filters access pixel data. It is overridden when not needed.
        targetCtx = targetCtx || ctx;
        if (targetX == null) { targetX = x; }
        if (targetY == null) { targetY = y; }
        try {
            var imageData = ctx.getImageData(x, y, width, height);
        } catch (e) {
            return false;
        }
        if (this._applyFilter(imageData)) {
            targetCtx.putImageData(imageData, targetX, targetY);
            return true;
        }
        return false;
    };

    /** docced in super class **/
    p._applyFilter = function (imageData) {
        
        this._glitchCouter++;

        var data = dataCopy = imageData.data;
        var dataCopy = imageData.data;
        
        var _w = imageData.width;
        var _h = imageData.height;

        var l = data.length;

        if(this._glitchCouter%this.glitchRefreshRate === 0 || !this._g) {
            this._g = [];
            for(var y=0; y<Math.round(Math.random()*this.glitchLinesY)+4; y++) {
                this._g[y] = [];
                for(var x=0; x<Math.round(Math.random()*this.glitchLinesX)+4; x++) {
                    this._g[y][x] = Math.round(Math.random()) * Math.round(Math.random()*(_w/2));
                }   
            }
        }

        var pixel, y, x, yValue, xValue;
        var size, pos;

        for (y=0; y<_h; y++) {

            yValue = Math.floor((this._g.length / _h) * y);

            for (x=0; x<_w; x++) {

                pixel = ((y*_w)+x) *4;

                xValue = Math.floor((this._g[yValue].length / _w) * x);

                if(this._g[yValue][xValue] > 0) {
                    size = this._g[yValue][xValue]*4;
                    pos = pixel + size;
                    if(pos > 0 && pos < l) {
                        data[pixel] = dataCopy[pixel+size];
                        data[pixel+2] = dataCopy[pixel+size + 2];
                    }
                }

                // hide what doesn't change
                else {
                    data[pixel+3] = 0;
                }

            }
        }

        return true;

    };
 
    createjs.GlitchFilter = createjs.promote(GlitchFilter, "Filter");
}());
