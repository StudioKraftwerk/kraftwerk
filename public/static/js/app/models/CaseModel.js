define([
    'superhero'
], function(Superhero) {

    return Superhero.Model.extend({

        defaults: {
            "title": null,
            "permalink": null
        },

        initialize:function() {
            // console.log('CASE', this.get('title'), this);

            //this.preventOrphans('description');
        },

        preventOrphans:function(attribute) {
            var value = this.get(attribute);

            value = value.replace(/\s(\w+\.|!|\?|$)/gi, '&nbsp;$1');

            this.set(attribute, value);
        },

        // Overwrite backbone fetch so that request/response aren't cached
        fetch: function(options) {
            options = options || {};
            options.cache = false;

            return Superhero.Model.prototype.fetch.call(this, options);
        }

    });
});