# NxTx (working name)
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
Why
```

### Commands
Commands in NxTx always start with a single backspace and a name. 
A command can be invoked with zero or more arguments, with the arguments enclosed in parentheses:

```
\command
\command(test)
\command('test1', 2019)
```
A command argument can be of several types:
- Command (eg. `\highlight('const a = new Date()')`)
- Command name (eg. `highlight`)
- String (enclosed with either `'` or `"`)
- Integer
- Float
- Dictionary

The syntax for a `dictionary`:
````