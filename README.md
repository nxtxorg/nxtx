# NxTx
_a browser-friendly [LaTex](https://www.latex-project.org/)-inspired document preparation system_

<br/>

The base (parser & renderer) is minimal and designed to be extended through packages written in JavaScript (see build/libs)

- The parser is built using [PEG.js](https://github.com/pegjs/pegjs) and the grammar is currently quite tiny (~50 lines)
- The renderer is implemented in JavaScript and relies on DOM elements
  - [paper-css](https://github.com/cognitom/paper-css) classes are used and is relied on for basic styling
  
  
The main idea is that the rendered document is laid out just like it will look when using the browsers inbuilt print functionality,
so a PDF version easily can be created.

NxTx uses __two-pass__ rendering; the first pass executes preprocessors and 
second pass executes commands and renders everything. The reason that two passes are necessary, 
is that some packages, such as list of contents, require data from first pass to render in second pass.
  
  
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
The argument(s) can be any of several types:
- Command (eg. `\text:it(\text:bf(Hello world))`)
- Command name (eg. `text:bf`)
- String (enclosed with either `'` or `"`)
- Number
- Array
- Dictionary

Each argument is passed to commands (and preprocessors) as an object with a type and value property.
Fx.: `{ type: 'string', value: 'test' }` or `{ type: 'number', value: 2019 }` 

The syntax for an `array`:
`[1, 2, 3, 4]` or `[ 'img1.jpg', 'img2.jpg' ]`.


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

## Packages
Packages are __the__ way to extend NxTx with more functionality, which is necessary since the parser/renderer is very minimal.
Packages are JavaScript files that register commands and preprocessors when evaluated.
The purpose of splitting functionality into several packages with none of them bundled with the parser, 
is to make NxTx more flexible, so you only need to load the packages with the functionality that you actually need.
Secondarily, splitting functionality into independent packages makes it easier to maintain and easier to get an overview over what is supported.

Packages register one or several preprocessors and commands

All commands in NxTx can have a preprocessor that is invoked on the first pass.
Some packages may only have preprocessors, such as the `loading`-package.


### Registering new commands
Registering a new command is simple and only requires some JavaScript to be loaded:
```javascript
nxtx.registerCommand('dquote', contentNode => `“${contentNode.value}”`);
```

Commands can also be async (though it isn't necessary here):
```javascript
nxtx.registerCommand('text:bf', async contentNode => await nxtx.html('b', null, contentNode.value));
```

### Registering preprocessors
Registering preprocessors is much like registering commands; 
```javascript
nxtx.registerPreprocessor('label', refNode => { ... });
```
Preprocessors can be asynchronous like commands.


#### Generating content with preprocessors
The return-value from a preprocessor invocation is used if no command is registered to the same name, 
thus providing a way to let preprocessors generate content for the document. 
The `loading`-package relies on this, as the `load:document` is required to include the document nodes in first-pass, 
so that all preprocessors used in the imported document are invoked as well.


### Concurrency
All preprocessors and commands that are part of the same paragraph are executed concurrently.
So you can not rely on the order in which the preprocessors and commands are executed, 
only that they are invoked in the right order and that they results are used in the correct order.

An example of this is that you shouldn't define AND use an acronym, from the `acronym`-package, in the same paragraph. 
The reason is that there is no guarantee of the commands finishing executing in the order they are parsed.
What is guaranteed is that the results are placed in the correct order.


### Hooks
NxTx has a couple of events/hooks that can be subscribed to by calling the `on` or `off` functions exported by the parser.
Currently two events are made available; the `prerender` and `postrender` events which are triggered right before first-pass of rendering, and right after second-pass, respectively.

___
### NxTx exported functions
The NxTx-parser exports a number of functions all listed here:
- `registerCommand(cmd, fn, overwrite = false)`
- `registerPreprocessor(cmd, fn, overwrite = false)`


### Some packages
I have created some packages, which are bundles of commands and preprocessors, for NxTx
- Acronyms (`/src/packages/acronyms.js`)
- Basic formatting (`/src/packages/basic-formatting.ts`)
- Bibliography (`/src/packages/bibliography.ts`)
- Debug render time (`/src/packages/debug-render-time.ts`)
- List of contents (`/src/packages/list-of-contents.ts`)
- Loading (`/src/packages/loading.ts`)
- Styling (`/src/packages/styling.ts`)

And a __core__ package which bundles `basic-formatting`, `loading`, `styling` and `layout` together
