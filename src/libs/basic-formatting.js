nxtx.registerCommand('text:it', content => nxtx.htmlLite('i', { innerText: content.value }));
nxtx.registerCommand('text:bf', content => nxtx.htmlLite('b', { innerText: content.value }));
nxtx.registerCommand('text:tt', content => nxtx.htmlLite('code', { innerText: content.value }));

nxtx.registerCommand('dquote', contentNode => `“${contentNode.value}”`);
nxtx.registerCommand('break', () => nxtx.htmlLite('div', { style: 'height: 1.5em' }));
nxtx.registerCommand('newpage', () => nxtx.htmlLite('div', { style: 'height: 100%' }));


nxtx.registerCommand('title', titleNode => (document.title = titleNode.value) && false);

