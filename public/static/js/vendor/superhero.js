//     Superhero.js 1.2.1.5

//     (c) 2015 Superhero Cheesecake, Rian Verhagen
//     Superhero.js depends on Backbone http://backbone.js

(function(root, factory) {


    // Set up Superhero appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define(['backbone', 'underscore'], function(Backbone, _) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global Superhero variable.
            return (root.Superhero = factory(root, Backbone, _));
        });
        // Next for Node.js or CommonJS. jQuery may not be needed as a module.
    } else if (typeof exports !== 'undefined') {
        var Backbone = require('backbone');
        var _ = require('underscore');
        module.exports = factory(root, Backbone, _);
        // Finally, as a browser global.
    } else {
        root.Superhero = factory(root, root.Backbone, root._);
    }

}(this, function(root, Backbone, _) {

    'use strict';

    // Create the internal Superhero variable
    var Superhero = {};

    // Superhero.Events
    // -----------------

    // Create a reference to Backbone.Events to make sure all references to the Backbone object can be replaced by Superhero.
    Superhero.Events = Backbone.Events;

    // Create a reference to Backbone.ajax to make sure all references to the Backbone object can be replaced by Superhero.
    Superhero.ajax = Backbone.ajax;

    //Check for touch capabilities
    Superhero._isTouch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);

    // Helpers
    // -----------------
    // Helper methods used by multiple Superhero modules.


    //Helper function to simultaneously trigger a event and execute a callback method.
    var _triggerCallback = function(name, options) {

        var formattedName = (':' + name).replace(/:([a-z])/g, function(q) {
            return q[1].toUpperCase();
        });

        var functionName = 'on' + formattedName;

        if (_.isFunction(this[functionName])) this[functionName]();
        this.trigger(name, options);
    };

    //Global method to help create namespaces without overwriting existing keys.
    Superhero.createNameSpace = function(namespace) {
        var segments = namespace.split('.');
        var root = window;

        for (var i = 0, limit = segments.length; i < limit; i++) {
            root = root[segments[i]] = root[segments[i]] || {};
        }

        return root;
    };

    // Superhero.Module
    // -----------------

    //An abstract Module object. This can be used as a base class for custom objects and implements Backbone Events.
    Superhero.Module = function(options) {
        this.initialize.apply(this, arguments);
    };

    // Borrow the extend method from Backbone.View
    Superhero.Module.extend = Backbone.View.extend;

    // Make _triggerCallback available in this module
    Superhero.Module.prototype._triggerCallback = _triggerCallback;

    // Ensure it can trigger events with Backbone.Events
    _.extend(Superhero.Module.prototype, Superhero.Events, {

        initialize: function() {},

        // Method that can be used to dispose the module. Removes all eventlisteners.
        close: function() {

            this._triggerCallback('close');

            this.stopListening();
            this.off();
        }

    });


    // Superhero.Router
    // -----------------

    // Create a reference to Backbone.Router to make sure all references to the Backbone object can be replaced by Superhero.
    Superhero.Router = Backbone.Router.extend({

        //Adds a before:route event,  works with Backbone 1.1.2 and newer
        execute: function(callback, args) {
            this.trigger('before:route');
            this._previousFragment = this._fragment;
            this._fragment = Backbone.history.getFragment();
            Backbone.Router.prototype.execute.apply(this, arguments);
        },

        getTransitionData: function() {
            return {
                fragment: this._fragment,
                previousFragment: this._previousFragment
            }
        }

    });

    // Superhero.history
    // -----------------

    // Create a reference to Backbone.history to make sure all references to the Backbone object can be replaced by Superhero.
    Superhero.history = Backbone.history;

    // Superhero.BaseView
    // -----------------
    // Extends Backbone.View. http://backbonejs.org/docs/backbone.html#section-125

    var STATE_DEFAULT = 'state:default';
    var STATE_INITIALIZED = 'state:initialized';
    var STATE_CLOSED = 'state:closed';
    var STATE_REMOVED = 'state:removed';

    Superhero.BaseView = Backbone.View.extend({

        constructor: function() {

            this._currentState = STATE_DEFAULT;

            Backbone.View.apply(this, arguments);

            _.bindAll(this, '_triggerCallback', '_resumeInitializationQueue');

            this._appendToInitializationQueue('_initializeUI');

            this._resumeInitializationQueue();
        },

        //Sets the state of this view
        setState: function(state) {
            this._currentState = state;
        },

        //Gets the current state of this view
        getState: function() {
            return this._currentState;
        },

        //Checks if state is active
        hasState: function(state) {
            return this._currentState === state;
        },

        //Throws an error if the current view state doesn't match one of the states supplied
        _enforceState: function(states) {
            var args = Array.prototype.slice.call(arguments);
            if (args.indexOf(this._currentState) === -1) throw new Error('Superhero.View cannot not change state from ' + this._currentState);
        },

        // Disposes all references to DOM elements and components created by this view. Removes all event listeners.
        close: function() {

            this._enforceState(STATE_INITIALIZED, STATE_DEFAULT);

            this._triggerCallback('close');

            this._disposeUI();

            this.undelegateEvents();
            this.stopListening();
            this.off();

            this.el = null;
            this.$el = null;

            this.setState(STATE_CLOSED);
        },

        // Removes the view's element from the DOM.
        remove: function() {

            this._enforceState(STATE_INITIALIZED, STATE_CLOSED);

            var elementToRemove = this.el;

            if (this.hasState(STATE_INITIALIZED)) this.close();

            this._triggerCallback('before:remove');

            if (elementToRemove.parentNode) elementToRemove.parentNode.removeChild(elementToRemove);

            this._triggerCallback('remove');

            this.setState(STATE_REMOVED);

            return this;
        },

        // Add support for tap event

        delegate: function(eventName, selector, listener) {
            if (eventName === 'tap') return this._delegateTapEvent(eventName, selector, listener);
            return Backbone.View.prototype.delegate.apply(this, arguments);
        },

        undelegate: function(eventName, selector, listener) { //TODO: implement!
            if (eventName === 'tap') return this._undelegateTapEvent(eventName, selector, listener);
            return Backbone.View.prototype.undelegate.apply(this, arguments);
        },

        _delegateTapEvent: function(eventName, selector, listener) {

            if (Superhero._isTouch) {

                var boundHandler = _.bind(this._touchHandler, this);

                this.$el.on('touchstart' + '.delegateEvents' + this.cid, selector, boundHandler);
                this.$el.on('touchend' + '.delegateEvents' + this.cid, selector, {
                    listener: listener
                }, boundHandler);
                this.$el.on('touchcancel' + '.delegateEvents' + this.cid, selector, boundHandler);
                this.$el.on('click' + '.delegateEvents' + this.cid, selector, boundHandler);
            } else {
                this.$el.on('click' + '.delegateEvents' + this.cid, selector, _.bind(listener, this));
            }

            return this;
        },

        _undelegateTapEvent: function(eventName, selector, listener) {

            if (Superhero._isTouch) {
                this.$el.off('touchstart' + '.delegateEvents' + this.cid);
                this.$el.off('touchend' + '.delegateEvents' + this.cid);
                this.$el.off('touchcancel' + '.delegateEvents' + this.cid);
                this.$el.off('click' + '.delegateEvents' + this.cid);
            } else {
                this.$el.off('click' + '.delegateEvents' + this.cid);
            }

            return this;
        },

        _touchHandler: function(e) {
            var oe = e.originalEvent || e;

            if (!oe.changedTouches) return;

            var touch = oe.changedTouches[0];
            var x = touch.clientX;
            var y = touch.clientY;

            switch (e.type) {
                case 'touchstart':
                    this._touching = [x, y];
                    break;
                case 'touchcancel':
                    this._touching = null;
                    break;
                case 'touchend':
                    if (!this._touching) return;

                    var oldX = this._touching[0];
                    var oldY = this._touching[1];

                    var threshold = 10;

                    if (x < (oldX + threshold) && x > (oldX - threshold) && y < (oldY + threshold) && y > (oldY - threshold)) {
                        e.data.listener(e);

                        var _this = this;
                        _.delay(function() { //Kinda sucks, but we need to throttle the event.
                            _this._touching = null;
                        }, 300);
                    }
                    break;
                case 'click': //Click without touch event. Probably device with touch capabilities and a pointer device.
                    if (this._touching) {
                        e.preventDefault();
                        return;
                    }

                    e.data.listener(e);

                    break;
            }
        },

        _appendToInitializationQueue: function(methodName, insertAtIndex) {
            this._initializationQueue = this._initializationQueue || [];

            if (!insertAtIndex && insertAtIndex !== 0) insertAtIndex = this._initializationQueue.length;

            this._initializationQueue.splice(insertAtIndex, 0, {
                status: 'new',
                methodName: methodName
            });
        },

        _setInitializationComplete: function(methodName) {

            if (!this.hasState(STATE_DEFAULT)) return;

            for (var i = 0, limit = this._initializationQueue.length; i < limit; i++) {
                if (this._initializationQueue[i].methodName === methodName) this._initializationQueue[i].status = 'completed';
            }

            this._resumeInitializationQueue();
        },

        _resumeInitializationQueue: function() {

            if (!this.hasState(STATE_DEFAULT)) return;

            for (var i = 0, limit = this._initializationQueue.length; i < limit; i++) {
                var queueItem = this._initializationQueue[i];

                if (queueItem.status === 'new') {
                    var result = this[queueItem.methodName].call(this);

                    queueItem.status = 'running';

                    if (result) this._setInitializationComplete(queueItem.methodName);
                    return;
                } else if (queueItem.status === 'running') {
                    return;
                }
            }

            this.setState(STATE_INITIALIZED);
            this._triggerCallback('initialized');
        },

        // Parses the ui map and creates references to DOM elements.
        _initializeUI: function() {

            this._uiBindings = _.clone(this.ui);

            this.ui = {};

            for (var name in this._uiBindings) {
                if (this._uiBindings.hasOwnProperty(name)) {
                    var result = this.el.querySelectorAll(this._uiBindings[name]);
                    this.ui[name] = (result.length <= 1) ? result[0] : result;
                }
            }

            this._triggerCallback('ui:initialized');

            return true;
        },

        _disposeUI: function() {
            for (var name in this.ui) {
                if (this.ui.hasOwnProperty(name)) {
                    this.ui[name] = null;
                }
            }

            this.ui = this._uiBindings;
            delete this._uiBindings;
        },

        _triggerCallback: _triggerCallback

    });

    // Superhero.Component
    // -----------------
    // Extends Superhero.BaseView. Simple View to be used with the component map in regular views.

    Superhero.Component = Superhero.BaseView.extend({


    });


    // Superhero.View
    // -----------------
    // Extends Superhero.BaseView

    Superhero.View = Superhero.BaseView.extend({

        constructor: function() {

            var options = arguments[0] || {};

            if (options.template) this.template = options.template;
            if (options.templateData) this.templateData = options.templateData;

            if (this.template) {
                this._appendToInitializationQueue('_initializeTemplate', 0);
            }

            if (options.region) {
                this.region = options.region;
                this._appendToInitializationQueue('_waitOnAddedToRegion');
            }

            this._appendToInitializationQueue('_initializeComponents');

            Superhero.BaseView.apply(this, arguments);
        },

        close: function() {
            Superhero.BaseView.prototype.close.apply(this, arguments);
            this._disposeComponents();
            this.region = null;
        },

        // Update the current template with new data
        updateTemplate: function(data) {
            this._renderTemplate(data);
        },

        // Initializes the view's template and start loading the template if it's not already in cache.
        _initializeTemplate: function() {
            if (this.template) {
                if (Superhero.TemplateCache.has(this.template)) {

                    this._renderTemplate();
                    return true;
                } else {

                    var template = this.template;

                    this.listenTo(Superhero.TemplateCache, 'template:retrieved', function(e) {
                        if (e.id === template) {
                            this._renderTemplate();
                            this._setInitializationComplete('_initializeTemplate');
                            this.stopListening(Superhero.TemplateCache, 'template:retrieved');
                        }
                    });

                    Superhero.TemplateCache._retrieveTemplate(this.template);
                }
            }

            return false;
        },

        // Renders the template into the views containter element.
        _renderTemplate: function(data) {

            this._triggerCallback('before:template:rendered');


            var model = (this.model && this.model.toJSON) ? this.model.toJSON() : this.model;
            var templateData = _.extend({}, data, model, this.templateData);

            this.el.innerHTML = Superhero.TemplateCache.get(this.template)(templateData);

            this._triggerCallback('template:rendered');
        },

        _waitOnAddedToRegion: function() {
            return false;
        },

        _addedToRegion: function() {
            this._setInitializationComplete('_waitOnAddedToRegion');
            this._triggerCallback('view:added');
        },

        // Add a new component
        addComponent: function(name, module, elementOrSelector, options) {

            var element = elementOrSelector;

            if (_.isString(elementOrSelector)) element = this.el.querySelector(elementOrSelector);

            options = options || {};

            options.el = element;

            var component = new module(options);

            this._createdComponentModules.push(component);

            if (_.isArray(this.components[name])) {
                this.components[name].push(component);
            } else {
                this.components[name] = component;
            }

            return component;
        },

        _initializeComponents: function() {

            this._componentBindings = _.clone(this.components);

            this.components = {};

            this._createdComponentModules = [];

            for (var name in this._componentBindings) {

                if (this._componentBindings.hasOwnProperty(name)) {
                    var definition = this._componentBindings[name];
                    var elements = this.el.querySelectorAll(definition.selector);

                    if (elements.length === 1) {
                        this.addComponent(name, definition.module || definition.type, elements[0], definition.options); //Module is deprecated, but still supported.
                    } else {
                        this.components[name] = [];

                        for (var i = 0, limit = elements.length; i < limit; i++) {
                            this.addComponent(name, definition.module || definition.type, elements[i], definition.options); //Module is deprecated, but still supported.
                        }
                    }
                }
            }

            this._triggerCallback('components:initialized');

            return true;

        },

        _disposeComponents: function() {

            if (!this._createdComponentModules) return;

            for (var i = 0, limit = this._createdComponentModules.length; i < limit; i++) {

                var component = this._createdComponentModules[i];
                if (component.hasState(STATE_INITIALIZED)) component.close();
            }

            this.components = this._componentBindings;

            delete this._createdComponentModules;
            delete this._componentBindings;

        }
    });


    // Superhero.LayoutView
    // -----------------
    // LayoutViews are regular views that can contain regions.

    Superhero.LayoutView = Superhero.View.extend({

        constructor: function() {
            this._appendToInitializationQueue('_initializeRegions');
            Superhero.View.apply(this, arguments);
        },

        close: function() {
            Superhero.View.prototype.close.apply(this, arguments);
            this._disposeRegions();
        },

        _initializeRegions: function() {
            for (var name in this.regions) {
                if (this.regions.hasOwnProperty(name)) {
                    Superhero.RegionManager.addRegion(this.cid, name, this.el.querySelector(this.regions[name]));
                }
            }

            this._triggerCallback('regions:initialized');

            return true;
        },

        _disposeRegions: function() {
            for (var name in this.regions) {
                if (this.regions.hasOwnProperty(name)) {
                    Superhero.RegionManager.removeRegion(this.cid, name);
                }
            }
        }

    });


    // Superhero.Collection
    // -----------------

    // Create a reference to Backbone.Collection to make sure all references to the Backbone object can be replaced by Superhero.
    Superhero.Collection = Backbone.Collection.extend({});

    // Superhero.Model
    // -----------------
    // Extends Backbone.Model. http://backbonejs.org/docs/backbone.html#section-32

    Superhero.Model = Backbone.Model.extend({

        parse: function(response) {

            for (var key in this.model) {

                if (this.model.hasOwnProperty(key)) {

                    var EmbeddedClass = this.model[key];
                    var embeddedData = response[key];
                    response[key] = new EmbeddedClass(embeddedData, {
                        parse: true
                    });

                    if (response[key] instanceof Backbone.Model) {
                        response[key].urlRoot = this.url() + '/' + key;
                    } else {
                        response[key].url = this.url() + '/' + key;
                    }

                }
            }
            return response;

        },

        // Method used to quickly check if a value would be valid for a single model attribute.
        isValid: function(key, value) {

            var values = {};
            values[key] = value;

            var errors = this._executeValidation(values);

            return _.isEmpty(errors);
        },


        // Implementation of default Backbone validate method.
        validate: function(values) {

            var errors = this._executeValidation(values);

            if (!_.isEmpty(errors)) {
                return errors;
            } else {
                this.validationError = {};
                this.trigger('valid', this);
            }
        },

        // Running the validation logic against the model's attributes.
        _executeValidation: function(values) {

            var errors = {};

            for (var key in values) {

                if (!this.validation || !this.validation[key]) continue;

                var rule = this.validation[key];

                if (_.isFunction(rule) && rule(key, values[key]) === false) errors[key] = 'invalid';
                if (_.isRegExp(rule)) {
                    rule.lastIndex = 0;
                    if (rule.test(values[key]) === false) errors[key] = 'invalid';
                }

            }

            return errors;
        }

    });

    // Superhero.RegionManager
    // -----------------
    // Global module used to manage regions throughout the application.

    var RegionManager = Superhero.Module.extend({

        _registeredRegions: {},
        _registeredRegionNames: {},

        addRegion: function(view, name, el) {

            var regionID = this._createRegionID(view, name);

            this._registeredRegions[regionID] = new Superhero.Region({
                id: regionID,
                name: name,
                el: el
            });

            this._registeredRegionNames[name] = regionID;
        },

        removeRegion: function(view, name) {

            var regionID = this._createRegionID(view, name);

            var region = this._registeredRegions[regionID];
            region.close();

            delete this._registeredRegions[regionID];
        },

        get: function(name) {
            return this._registeredRegions[this._registeredRegionNames[name]];
        },

        _createRegionID: function(viewID, name) {
            return viewID + '.' + name;
        }

    });

    Superhero.RegionManager = new RegionManager();

    // Superhero.Region
    // -----------------
    // Manages creating and destroying views.

    Superhero.Region = Superhero.Module.extend({

        initialize: function(options) {

            this.id = options.id;
            this.name = options.name;
            this.el = options.el;

            this._activeViewClass = null;
            this._activeView = null;
            this._allowSameView = false;
        },

        // Render a view into this region
        show: function(ViewClass, options, transitionData) {

            if (ViewClass !== this._activeViewClass || this._allowSameView) {

                options = options || {};

                options.region = this;

                this._transitionData = transitionData;

                this._pendingView = new ViewClass(options);

                this._needsTransition = (this._activeView && this._activeView !== null) || false;

                if (this._needsTransition) this._detachView(this._activeView);

                this._triggerCallback('before:view:added', ViewClass);

                this._activeView = this._pendingView;
                this._activeViewClass = ViewClass;

                this._attachView(this._activeView);

                this._pendingView = null;

                this._allowSameView = false;
            }

            return this._activeView;
        },

        // Disables the type checking on new views for 1 run.
        allowSameView: function() {
            this._allowSameView = true;
        },

        // Clear the region.
        clear: function(transitionData) {
            this._transitionData = transitionData;
            if (this._activeView) this._detachView(this._activeView, true);
        },

        // Close this region and remove the active view.
        close: function() {

            if (!this._activeView) return;

            this._activeView.remove();

            this._activeView = null;
            this._activeViewClass = null;
            this.name = null;
            this.id = null;
            this.el = null;
        },

        // Add the new view to the DOM and trigger transitionIn
        _attachView: function(view) {
            var viewElement = view.render().el;

            this._activeView = view;

            this.el.insertBefore(viewElement, this.el.firstChild);

            view._addedToRegion();


            this._triggerImmediateTransitionIn(view);
            if (!this._needsTransition) this._triggerTransitionIn(view);

            this._triggerCallback('view:added');
        },

        // Check if a transition needs to be run. Otherwise immediately remove the view.
        _detachView: function(view, isClearing) { //TODO: possible memory leak. Regions being destroyed while transitionout is running.

            this._activeView = null;
            this._activeViewClass = null;

            this._triggerTransitionOut(view, isClearing);
        },

        // Remove the old view from the DOM.
        _removeView: function(view, isClearing) {
            view.remove();
            this._triggerCallback('view:removed');

            var newView = this._activeView || this._pendingView;

            if (!isClearing && newView) this._triggerTransitionIn(newView);


        },

        _triggerImmediateTransitionIn: function(view) {
            if (_.isFunction(view.immediateTransitionIn)) {
                if (view.hasState(STATE_INITIALIZED)) return view.immediateTransitionIn(this._transitionData);

                this.listenToOnce(view, 'initialized', function viewInitializedHandler() {
                    view.immediateTransitionIn(this._transitionData);
                });
            }
        },

        _triggerTransitionIn: function(view) {
            if (_.isFunction(view.transitionIn)) {
                if (view.hasState(STATE_INITIALIZED)) return view.transitionIn(this._transitionData);

                this.listenToOnce(view, 'initialized', function viewInitializedHandler() {
                    view.transitionIn(this._transitionData);
                });
            }
        },

        _triggerTransitionOut: function(view, isClearing) {
            if (_.isFunction(view.transitionOut)) {
                view.transitionOut(function() {
                    this._removeView(view, isClearing);
                }.bind(this), this._transitionData);
            } else {
                this._removeView(view, isClearing);
            }
        },

        _triggerCallback: _triggerCallback
    });

    // TemplateCache
    // -----------------

    //Extend the Superhero.Module and create the TemplateCache object
    var TemplateCache = Superhero.Module.extend({

        _basePath: '/',
        _templateCache: {},

        initialize: function() {
            this._initializeTemplates();
        },

        // Check if a template is already available by it's id.
        has: function(id) {
            return (this._templateCache[id] !== undefined);
        },

        // Get a available template by it's id.
        get: function(id) {
            return this._templateCache[id];
        },

        // Add a custom template. You could use this to create a template from a custom string.
        set: function(id, template) {
            this._compileTemplate(id, template);
        },

        // Set the base path for all templates
        setBasePath: function(path) {
            this._basePath = path;
        },

        // Load a remote template file by it's uri.
        retrieveTemplate: function(uri) {
            this._retrieveTemplate(uri);
        },

        remove: function(id) {
            this._templateCache[id] = null;
            delete this._templateCache[id];
        },

        _initializeTemplates: function() {

            var templates = document.querySelectorAll('[type="text/template"]');

            for (var i = 0, limit = templates.length; i < limit; i++) {

                var template = templates[i];
                var rawTemplate = template.textContent;
                var id = template.id;

                template.parentNode.removeChild(template);

                this._compileTemplate(id, rawTemplate);
            }
        },

        _retrieveTemplate: function(uri, callback) {
            var options = {
                url: this._basePath + uri,
                success: function(response) {
                    this._compileTemplate(uri, response);

                    if (callback) callback.apply();

                    this._triggerCallback('template:retrieved', {
                        id: uri
                    });

                }.bind(this)
            };

            Backbone.ajax(options);
        },

        _compileTemplate: function(id, rawTemplate) {
            this._templateCache[id] = _.template(rawTemplate);
        },

        _triggerCallback: _triggerCallback

    });

    Superhero.TemplateCache = new TemplateCache();


    return Superhero;

}));