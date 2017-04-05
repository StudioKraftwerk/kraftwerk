define([
    'underscore',
    'superhero',
    'three',
    'projector',
    'canvasrenderer',
    'detector',
    'copyshader',
    'vignetteshader',
    'shaderpass',
    'renderpass',
    'maskpass',
    'filmpass',
    'filmshader',
    'glitchpass',
    'effectcomposer',
    'app/utils/ResizeManager',
    'app/utils/ScrollManager',
], function(_, Superhero, three, projector, canvasrenderer, detector, copyshader, vignetteshader, shaderpass, renderpass, maskpass, filmpass, filmshader, glitchpass, effectcomposer, ResizeManager, ScrollManager) {

    return Superhero.Module.extend({

        canRender: false,

        numFilesToLoad: 0,
        filesLoaded: 0,

        fogSettings: {
            near: 14,
            far: 15,
            color: 0x000000
        },

        objects: {
            background: {
                path: '/static/three/background.js',
                object: null,
                geom: null,
                geomBase: null,
                canMouseMoveTimer: null,
                canMouseMove: true
            }
        },

        mouse: {
            x: 0,
            y: 0
        },

        initialize:function(options) {
            _.bindAll(
                this,
                '_update',
                '_handleResize',
                '_handleMouseMove',
                '_load',
                '_loadComplete',
                '_loadCompleteAll',
                '_tickHandler'
            );

            this.isWebGL = Detector.webgl ? true : false;
            if(Settings.os == 'AndroidOS') {
                this.isWebGL = false;
            }
            //this.isWebGL = false;

            this.el = options.el;
            this.loader = new THREE.JSONLoader();
            this._build();
        },


        close: function() {

            this.canRender = false;
            this._removeEventListeners();

        },


        animateBackgroundIn : function(){
            this._animateBackgroundIn(this.objects.background);
        },
        animateBackgroundOut : function(){
            this._animateBackgroundOut(this.objects.background);
        },

        _setViewport: function() {
            var width = window.innerWidth;
            var height = window.innerHeight;

            this._vw = {
                x: 0,
                y: 0,
                width: width,
                height: height
            };
        },


        // START

        _build: function() {
            this._setViewport();

            this._createScene();
            this._createCamera();
            this._createRenderer();
            this._createComposer();

            this._load();
        },




        _load: function() {
            this.numFilesToLoad = 1;

            this.loader.load( this.objects.background.path, function(geometry) {
                this.objects.background.geomBase = geometry.clone();
                this.objects.background.geom = geometry;
                this._loadComplete();
            }.bind(this));

        },

        _loadComplete: function() {
            this.filesLoaded++;
            if(this.filesLoaded == this.numFilesToLoad && !this.loadIsDone) {
                this.loadIsDone = true;
                this._loadCompleteAll();
            }
        },

        _loadCompleteAll: function() {
            this.objects.background.object = this.background = this._createBackground(this.objects.background.geom);
            this.scene.add(this.background);

            this.pattern = this._createPattern();
            this.scene.add(this.pattern);

            this.lightBackground = new THREE.PointLight( 0xFFFFFF, 1, 10 );
            this.lightBackground.position.set( 0, 0, 0 );
            this.scene.add( this.lightBackground );

            this.light = new THREE.PointLight( 0xFFFFFF, 1, 6 );
            this.light.position.set( 0, 0, 6 );
            this.scene.add( this.light );

            this._resize();

            this._setupEventListeners();
        },




        // EVENTS

        _setupEventListeners: function() {

            this.listenTo(ResizeManager, 'resize', this._handleResize);

            document.addEventListener('mousemove', this._handleMouseMove);
            TweenMax.ticker.addEventListener('tick', this._tickHandler);

        },

        _removeEventListeners: function() {

            document.removeEventListener('mousemove', this._handleMouseMove);
            TweenMax.ticker.removeEventListener('tick', this._tickHandler);

        },


        _tickHandler: function() {

            if(this.canRender) {
                this._update();
            }

        },



        _handleResize: function() {
            this._resize();
        },

        _resize: function() {
            this._setViewport();

            if(Settings.agent == 'mobile' || this._vw.width < 720) {
                this.canRender = false;
            }
            else {
                if(this.canRender == false) {
                    this.canRender = true;
                    // this._startUpdate();
                }

                this.camera.aspect = this._vw.width / this._vw.height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize( this._vw.width, this._vw.height );
                this.composer.setSize( this._vw.width, this._vw.height );
            }
        },

        // _startUpdate: function() {
        //     this._update();
        // },

        _handleMouseMove: function(e) {
            var posX = e.clientX || e.pageX;
            var posY = e.clientY || e.pageY;

            posX -= (this._vw.width/2);
            posY -= (this._vw.height/2);

            this.mouse.x = posX;
            this.mouse.y = posY;
        },



        _createScene: function() {
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.Fog( this.fogSettings.color, this.fogSettings.near, this.fogSettings.far );
        },

        _createCamera: function() {
            this.camera = new THREE.PerspectiveCamera( 75, this._vw.width / this._vw.height, 0.1, 1000 );
            this.camera.position.set(0, 0, 10);
            this.camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
        },

        _createRenderer: function() {

            if (this.isWebGL) {
                this.renderer = new THREE.WebGLRenderer({
                    antialias: false,
                    devicePixelRatio: 1
                });
            }
            else {
                this.renderer = new THREE.CanvasRenderer({
                    antialias: false,
                    devicePixelRatio: 1
                });
            }

            this.renderer.setClearColorHex ( 0x000000, 0.0 );
            this.renderer.setSize( this._vw.width, this._vw.height );
            this.el.appendChild( this.renderer.domElement );
        },

        _createComposer: function() {
            this.composer = new THREE.EffectComposer( this.renderer );
            this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

            filmPass = new THREE.ShaderPass( THREE.FilmShader );
            filmPass.uniforms[ "time" ].value = 0.05;
            filmPass.uniforms[ "sCount" ].value = 0;
            filmPass.uniforms[ "sIntensity" ].value = 0.15;
            filmPass.uniforms[ "nIntensity" ].value = 0.15;
            filmPass.uniforms[ "grayscale" ].value = 0;

            glitchPass = new THREE.GlitchPass();

            vignettePass = new THREE.ShaderPass( THREE.VignetteShader );
            vignettePass.uniforms[ "offset" ].value = 0.6;
            vignettePass.uniforms[ "darkness" ].value = 1;

            vignettePass.renderToScreen = true;

            this.composer.addPass(filmPass);
            this.composer.addPass(glitchPass);
            this.composer.addPass(vignettePass);
        },





        _createBackground: function(geometry) {
            var object = new THREE.Object3D();
            if (!this.isWebGL) object.visible = false;

            var wireframe = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({
                wireframe: true,
                wireframeLinewidth: 1,
                color: 'white',
                transparent: true,
                opacity: 0.05,
                depthTest: false,
                depthWrite: false,
            }));
            wireframe.position.z = 2;
            var fill = new THREE.Mesh( geometry , new THREE.MeshLambertMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.3,
                depthTest: false,
                depthWrite: false,
                shading: THREE.SmoothShading,
                side: THREE.BackSide
            }));
            fill.position.z = 2;

            object.add(fill);
            object.add(wireframe);

            return object;
        },

        _createPattern: function() {
            var object = new THREE.Object3D();

            var map = THREE.ImageUtils.loadTexture('/static/three/pattern.jpg');
            map.wrapS = map.wrapT = THREE.RepeatWrapping;
            map.repeat.set( 12, 12 );

            var geometry = new THREE.PlaneGeometry( 50, 50 );
            var material = new THREE.MeshBasicMaterial( {
                //side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8,
                map: map,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                depthTest: false
            });

            object.position.z = -2;
            object.add( new THREE.Mesh(geometry,material) );

            return object;
        },

        _animateBackgroundIn: function(icon) {
            if(icon.object) {
                icon.object.children[0].material.opacity = 0.3;
                icon.object.children[1].material.opacity = 0.05;
            }
        },

        _animateBackgroundOut: function(icon) {
            if(icon.object) {
                icon.object.children[0].material.opacity = 0.2;
                icon.object.children[1].material.opacity = 0.02;
            }
        },

        _update: function() {
            if(this.canRender === false) return;

            // requestAnimationFrame(this._update);

            this._mouseFollow();
            this._updateCamera();
            this._updateIcons();
            this._updateLight();

            if (this.isWebGL) {
                this.composer.render();
            }
            else {
                this.renderer.render( this.scene, this.camera );
            }
        },

        _updateIcons: function() {
            for(var key in this.objects) {
                var object = this.objects[key];
                object.geom.verticesNeedUpdate = true;
            }
        },

        _updateLight: function() {

            var target = {
                x: this.mouse.x/80,
                y: -this.mouse.y/80
            };
            var easing = 0.1;

            this.light.position.x += (target.x - this.light.position.x) * easing;
            this.light.position.y += (target.y - this.light.position.y) * easing;

            this.lightBackground.position.x += (target.x - this.lightBackground.position.x) * easing;
            this.lightBackground.position.y += (target.y - this.lightBackground.position.y) * easing;

        },

        _updateCamera: function() {

            var targetRotation = {
                x: -this.mouse.y/2500,
                y: -this.mouse.x/5000
            };
            var easing = 0.3;

        },

        _mouseFollow: function() {
            var mousePosX = this.mouse.x/80;
            var mousePosY = -this.mouse.y/80;

            var object, v;
            var range, mag;
            var xs, xy, d, lensDisp;

            for(var key in this.objects) {

                object = this.objects[key];
                if(object.canMouseMove === true) {

                    v = 0;

                    if(key == 'background') {
                        // start
                        mag = 4;
                        range = 3;
                        for(j=0; j<object.geom.vertices.length; j++) {
                            v = object.geom.vertices[j];
                            vBase = object.geomBase.vertices[j];

                            xs = mousePosX - vBase.x;
                            ys = mousePosY - vBase.y;
                            d = Math.sqrt(xs*xs + ys*ys);

                            if(Math.abs(d) < range) {
                                lensDisp = Math.sin(Math.PI*Math.abs(d/range));
                                v.x = vBase.x-mag*xs*lensDisp/4;
                                v.y = vBase.y-mag*ys*lensDisp/4;
                            }
                            else {
                                v.x = vBase.x;
                                v.y = vBase.y;
                            }
                        }
                        // end
                    }

                } // end if

            }

        },



    });

});
