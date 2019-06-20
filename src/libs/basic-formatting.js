nxtx.registerCommand('text:it', content => nxtx.html('i', null, content.value));
nxtx.registerCommand('text:bf', content => nxtx.html('b', null, content.value));
nxtx.registerCommand('text:tt', content => nxtx.html('code', null, content.value));

nxtx.registerCommand('dquote', contentNode => `“${contentNode.value}”`);
nxtx.registerCommand('newpage', () => nxtx.html('div', { style: 'height: 100%;' }));

nxtx.registerCommand('title', titleNode => (document.title = titleNode.value) && false);
