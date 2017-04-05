define([
    'superhero',
    'preloadjs'
], function(Superhero, PreloadJS) {

    var _loadedItems = {}; //This is the global loadQueue which is shared for all FileLoader instances

    return Superhero.Module.extend({

        loadManifest:function(name, manifest, xhr) {

            var queue = new createjs.LoadQueue();
            queue.name = name; //Creating property on object. Maybe not the best idea.

            this._setup(queue, xhr);

            queue.loadManifest(manifest);
        },

        loadFile:function(file, xhr) {

            var name = file.id;
            var queue = new createjs.LoadQueue();

            queue.name = name; //Creating property on object. Maybe not the best idea.

            this._setup(queue, xhr);

            queue.loadFile(file);
        },

        disposeManifest:function(manifest) {
            for(var i = 0, max = manifest.length; i < max; i++) {
                this.disposeFile(manifest[i].id);
            }
        },

        disposeFile:function(id) {

            var name = name || id;

            if(!_loadedItems[id]) return;

            var queue = _loadedItems[id].queue;
            queue.remove(id);

            delete _loadedItems[id];
        },

        getFile:function(id) {

            if(!_loadedItems[id]) return null;

            return _loadedItems[id].result;
        },

        _setup:function(queue, xhr) {

            queue.setMaxConnections(10);
            if(!xhr) queue.setUseXHR(false);
            
            _.bindAll(this, '_handleFileLoad', '_handleQueueComplete', '_handleQueueProgress', '_handleQueueError');

            queue.on('fileload', this._handleFileLoad);
            queue.on('complete', this._handleQueueComplete);
            queue.on('progress', this._handleQueueProgress);
            queue.on('error', this._handleQueueError);
        },

        _disposeQueue:function(queue) {
            queue.off();
            queue.close();
        },

        _handleFileLoad:function(e) {
            _loadedItems[e.item.id] = {result: e.result, queue:e.target};
            this.trigger('file:load:complete', {name:e.target.name});
        },

        _handleQueueComplete:function(e) {
            this.trigger('manifest:load:complete', {name:e.target.name});
            this._disposeQueue(e.target);
        },

        _handleQueueProgress:function(e) {
            this.trigger('manifest:load:progress', {name:e.target.name, progress:e.loaded});
        },

        _handleQueueError:function(e) {

            console.log(e);
            this.trigger('file:load:error', e);

        }

    });
});