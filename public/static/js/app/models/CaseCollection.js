define([
    'superhero',
    'app/models/CaseModel'
], function(Superhero, CaseModel) {

    var CaseCollection = Superhero.Collection.extend({

        model: CaseModel,

        url: function() {

            var url = '/actions/api/cases';
            return this._getFeatured ? url + '?type=featured' : url;

        },

        getFeatured: function() {

            this._getFeatured = true;
            this.fetch();

        },

        getModelBySlug: function(slug) {

            this._activeModel = this.findWhere({slug: slug});
            return this._activeModel;

        },

        getActiveModel: function() {

            return this._activeModel;

        },

        getNextModel: function() {

            var index = this.indexOf(this._activeModel) + 1;
            if(index > this.length-1) index = 0;

    	    return this.at(index);

        },

        getPreviousModel: function() {

        	var index = this.indexOf(this._activeModel) - 1;
            if(index < 0) index = this.length - 1;

    	    return this.at(index);

        }

    });

    return new CaseCollection();

});
