MX.ready('klass', function(X, Klass) {
    Klass.define({
        alias: 'demo.view',
        extend: 'view',
        onRender: function() {
            this.body.html('Hello World!');
        }
    });
    X.App.launch({
        pagelets: [{
            id: 'demo-pagelet',
            url: 'h',
            view: 'demo.view'
        }],
        welcome: 'h'
    });
});