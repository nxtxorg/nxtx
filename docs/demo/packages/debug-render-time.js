(function () {
    'use strict';

    var started;
    nxtx.on('prerender', function () { return started = Date.now(); });
    nxtx.on('postrender', function () { return console.log("rendering document took " + (Date.now() - started) + "ms"); });

}());
//# sourceMappingURL=debug-render-time.js.map
