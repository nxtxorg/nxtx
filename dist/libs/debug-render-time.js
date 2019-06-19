(function () {
	'use strict';

	let started;
	nxtx.on('prerender', () => started = Date.now());
	nxtx.on('postrender', () => console.log(`rendering document took ${Date.now() - started}ms`));

}());
//# sourceMappingURL=debug-render-time.js.map
