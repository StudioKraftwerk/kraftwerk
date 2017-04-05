define([
    'superhero',
    'app/routers/ApplicationRouter',
    'app/views/ApplicationView',
], function(Superhero, ApplicationRouter, ApplicationView) {

    var namespace = Superhero.createNameSpace('nl.kraftwerk');
    namespace.applicationRouter = new ApplicationRouter();
    namespace.applicationView = new ApplicationView({el: document.getElementById('application')});

});
