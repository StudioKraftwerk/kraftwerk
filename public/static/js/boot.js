require.config({
    paths: {
        jquery: 'vendor/jquery.custom.min',
        underscore: 'vendor/lodash.min',
        backbone: 'vendor/backbone.min',
        tweenmax: 'vendor/tweenmax.min',
        draggable: 'vendor/draggable.min',
        throwpropsplugin: 'vendor/throwpropsplugin.min',

        easeljs: 'vendor/easeljs.min',
        preloadjs: 'vendor/preloadjs.min',
        superhero: 'vendor/superhero',
        easeldestroy: 'app/utils/EaselDestroy',

        three: 'vendor/three.min',
        canvasrenderer: 'vendor/three/canvasrenderer',
        projector: 'vendor/three/projector',
        detector: 'vendor/three/detector',
        effectcomposer: 'vendor/three/effectcomposer',
        copyshader: 'vendor/three/copyshader',
        vignetteshader: 'vendor/three/vignetteshader',
        shaderpass: 'vendor/three/shaderpass',
        renderpass: 'vendor/three/renderpass',
        maskpass: 'vendor/three/maskpass',
        filmpass: 'vendor/three/filmpass',
        filmshader: 'vendor/three/filmshader',
        digitalglitch: 'vendor/three/digitalglitch',
        glitchpass: 'vendor/three/glitchpass'
    },

    shim: {
        canvasrenderer: {deps: ['three'] },
        projector: {deps: ['three'] },
        effectcomposer: {deps: ['three'] },
        copyshader: {deps: ['three'] },
        vignetteshader: {deps: ['three'] },
        shaderpass: {deps: ['three'] },
        renderpass: {deps: ['three'] },
        maskpass: {deps: ['three'] },
        filmpass: {deps: ['three'] },
        filmshader: {deps: ['three'] },
        digitalglitch: {deps: ['three'] },
        glitchpass: {deps: ['three', 'digitalglitch'] },
        throwpropsplugin: { deps: ['tweenmax'] },
        draggable: { deps: ['tweenmax'] },
    }
});

require([
    'vendor/polyfills/classlist.min',
    'vendor/polyfills/html5-dataset',
    'vendor/polyfills/requestanimationframe',
    'vendor/polyfills/typedarray',
    'easeljs',
    'easeldestroy',
    'tweenmax',
    'throwpropsplugin',
    'draggable',
    'app/main'
], function() {
});
