define([
    'superhero',
    'app/utils/ScrollManager',
    'app/models/CaseCollection',
    'app/views/pages/IntroView',
    'app/views/pages/WorkView',
    'app/views/pages/CaseView',
    'app/views/pages/CaseDetailView',
    'app/views/pages/AboutView',
    'app/views/pages/ContactView',
], function(Superhero, ScrollManager, CaseCollection, IntroView, WorkView, CaseView, CaseDetailView, AboutView, ContactView) {

    return Superhero.Router.extend({

        _routeCount: 0,

        routes: {
            '': 'home',
            'intro': 'intro',
            'work': 'work',
            'work/:slug': 'case',
            'about': 'about',
            'contact': 'contact',
            '*404': 'error404',
        },

        initialize: function() {

            this._setupEventListeners();

        },

        _setupEventListeners: function() {

            this.listenTo(this, 'before:route', this._beforeRouteChangeHandler);
            this.listenTo(this, 'route', this._routeChangeHandler);

            this.listenTo(Superhero.TemplateCache, 'template:retrieved', this._templateRetrievedHandler);

        },

        isFirstRoute: function() {

            return this._routeCount < 1;

        },

        intro: function() {

            Superhero.RegionManager.get('main').show(IntroView);

        },

        home: function() {

            if (this.isFirstRoute()) {
                Superhero.history.navigate('/intro', {trigger: true});
                return;
            }

            var model = CaseCollection.first();
            this.case(model.get('slug'));

        },

        work: function() {

            Superhero.RegionManager.get('main').show(WorkView, null, this.getTransitionData());

            this._setPageTitle('Work');

        },

        case: function(slug) {

            var model = CaseCollection.getModelBySlug(slug);
            if(!model) return;

            var caseView = Superhero.RegionManager.get('main').show(CaseView, {model: model});
            caseView.updateHeader(model);

            Superhero.RegionManager.get('case').clear();
            // Superhero.RegionManager.get('case').show(CaseDetailView, {template: 'work/' + slug, model: model});
            this._templatesLoad([
                {region:'case', view:CaseDetailView, options:{template: 'work/' + slug, model: model}},
            ]);

            if (this._fragment !== '' || !this.isFirstRoute()) {
                this._setPageTitle(model.get('title') + ' | Work');
            }

        },

        about: function() {

            Superhero.RegionManager.get('main').show(AboutView);

            this._setPageTitle('About');

        },

        contact: function() {

            Superhero.RegionManager.get('main').show(ContactView, null, this.getTransitionData());

            this._setPageTitle('Contact');

        },

        _setPageTitle: function(title) {

            var name = 'Studio Kraftwerk';
            document.title = title ? title + ' | ' + name : name;

        },

        _beforeRouteChangeHandler: function() {

            // ScrollManager.scrollTop(0);
            ScrollManager.resetElementScrollNotifications();

        },

        _routeChangeHandler: function(e) {

            this._routeCount++;

        },



        // load templates

        _templatesLoad: function(templates) {

            this._t = templates;

            for(var i=0, len=this._t.length; i<len; i++) {
                if(!Superhero.TemplateCache.get(this._t[i].options.template)) {
                    Superhero.TemplateCache.retrieveTemplate(this._t[i].options.template);
                }
            }

            this._templatesReady();

        },

        _templatesReady: function() {

            var ready = true;
            for(var i=0, len=this._t.length; i<len; i++) {
                if(!Superhero.TemplateCache.get(this._t[i].options.template)) {
                    ready = false;
                }
            }   

            if(ready){ 
                this._templatesShow();
            }

        },

        _templatesShow: function() {

            for(var i=0, len=this._t.length; i<len; i++) {
                if(this._t[i].allowSameView){ Superhero.RegionManager.get(this._t[i].region).allowSameView(); }
                Superhero.RegionManager.get(this._t[i].region).show(this._t[i].view, this._t[i].options);
            }

        },

        _templateRetrievedHandler: function() {

            this._templatesReady();

        },

    });

});
