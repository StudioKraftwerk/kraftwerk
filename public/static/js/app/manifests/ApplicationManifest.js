define([

], function() {

    var manifest = {

        normal: [
            {id:'noise', src: '/static/img/sprites/noise_01.png'},
            {id:'arrow-white', src: '/static/img/sprites/sprite-arrow-white.png'},
            {id:'arrow-black', src: '/static/img/sprites/sprite-arrow-black.png'},
            {id:'menu-icon-white', src: '/static/img/sprites/sprite-menu-icon-white.png'},
            {id:'menu-icon-black', src: '/static/img/sprites/sprite-menu-icon-black.png'},
            {id:'menu-background-0', src: '/static/img/sprites/sprite-menu-background-0.png'},
            {id:'menu-background-1', src: '/static/img/sprites/sprite-menu-background-1.png'},
            {id:'menu-background-2', src: '/static/img/sprites/sprite-menu-background-2.png'},
            {id:'menu-background-3', src: '/static/img/sprites/sprite-menu-background-3.png'},
            {id:'menu-background-4', src: '/static/img/sprites/sprite-menu-background-4.png'},
            {id:'menu-background-5', src: '/static/img/sprites/sprite-menu-background-5.png'},
        ],

        retina: [
            {id:'noise', src: '/static/img/sprites/noise_01.png'},
            {id:'arrow-white', src: '/static/img/sprites/sprite-arrow-white@2x.png'},
            {id:'arrow-black', src: '/static/img/sprites/sprite-arrow-black@2x.png'},
            {id:'menu-icon-white', src: '/static/img/sprites/sprite-menu-icon-white@2x.png'},
            {id:'menu-icon-black', src: '/static/img/sprites/sprite-menu-icon-black@2x.png'},
            {id:'menu-background-0', src: '/static/img/sprites/sprite-menu-background-0.png'},
            {id:'menu-background-1', src: '/static/img/sprites/sprite-menu-background-1.png'},
            {id:'menu-background-2', src: '/static/img/sprites/sprite-menu-background-2.png'},
            {id:'menu-background-3', src: '/static/img/sprites/sprite-menu-background-3.png'},
            {id:'menu-background-4', src: '/static/img/sprites/sprite-menu-background-4.png'},
            {id:'menu-background-5', src: '/static/img/sprites/sprite-menu-background-5.png'},
        ]

    };

    return {

        get: function() {

            return (this._getPPI() < 2) ? manifest.normal : manifest.retina;

        },

        _getPPI: function() {

            var PPI = 1;
            var ratio = window.devicePixelRatio || 1;

            if (ratio > 2.5) PPI = 3;
            if (ratio > 1.5) PPI = 2;

            return PPI;

        },

    };

});
