# NxTx
_a browser-friendly [LaTex]()-inspired document preparation system_

<br/>

The base (parser & renderer) is minimal and designed to be extended through packages written in JavaScript (see build/libs)

- The parser is built using [PEG.js]() and the grammar is currently quite tiny (~50 lines)
- The renderer is implemented in JavaScript and relies on DOM elements
  - [paper-css]() classes are used and is relied on for basic styling
  
The main idea is that the rendered document is laid out just like it will look when using the browsers inbuilt print functionality.
  
## Syntax
A NxTx document consists of a number of paragraphs separated by an empty line. 
Each paragraph consists of a number of text-blocks and commands:
```
Hello, this is a \text:bf(demo). 
Merely a simple example.

This is a separate paragraph
\label(paragraph:2)
```

### Commands
Commands in NxTx always start with a single backspace followed by the name. 
A command can be invoked with zero or more arguments, with the arguments enclosed in parentheses:

```
\command
\command(test)
\command('test1', 2019)
```
The argument value can be of several types:
- Command (eg. `\text:bf('const a = new Date()')`)
- Command name (eg. `text:bf`)
- String (enclosed with either `'` or `"`)
- Integer
- Float
- Dictionary

The syntax for a `dictionary`:
```
{
    author: 'Malte Rosenbjerg'
    title: 'NxTx'
    year: 2019
    url: 'https://github.com/rosenbjerg/nxtx'
}
```
or in inline form:

`{ author: 'Malte Rosenbjerg', title: 'NxTx', year: 2019, url: 'https://github.com/rosenbjerg/nxtx' }`

So an invocation could look like this: 
```
\bib-add(nxtx, {
    author: 'Malte Rosenbjerg'
    title: 'NxTx'
    year: 2019
    url: 'https://github.com/rosenbjerg/nxtx'
})
```
The value of each field in the dictionary can be of the same types as arguments for commands.

#### Concurrent Commands
All commands that are part of the same paragraph are executed concurrently.
So you should not use commands that require the existence of other commands in the same paragraph.

An example of this is that you shouldn't define AND use an acronym, from the `acronym`-package, in the same paragraph. 
The reason is that there is no guarantee of the commands finishing executing in the order they are parsed.
What is guaranteed is that the results are placed in the correct order.


## Registering new commands
Registering a new command is simple and only requires some JavaScript to be loaded:
```javascript
nxtx.registerCommand('dquote', contentNode => `“${contentNode.value}”`);
```

Commands can also be async:
```javascript
nxtx.registerCommand('text:bf', async contentNode => await nxtx.html('b', null, contentNode.value));
```


## Packages
I have created some packages, which are bundles of commands, for NxTx
- Acronyms (`/src/libs/acronyms.js`)
- Basic formatting (`/src/libs/basic-formatting.js`)
- Bibliography (`/src/libs/bibliography.js`)
- Debug render time (`/src/libs/debug-render-time.js`)
- List of contents (`/src/libs/list-of-contents.js`)
- Loading (`/src/libs/loading.js`)
- Styling (`/src/libs/styling.js`)
