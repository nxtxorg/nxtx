var debug_render_time = (function () {
    'use strict';

    var started;
    var pkg = {
        name: 'debug-render-time',
        hooks: {
            prerender: function () { return started = Date.now(); },
            postrender: function () { return console.log("rendering document took " + (Date.now() - started) + "ms"); }
        }
    };
    if (nxtx)
        nxtx.registerPackage(pkg);

    return pkg;

}());
//# sourceMappingURL=debug-render-time.js.map
