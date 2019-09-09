{
    const TYPE = { PARAGRAPH: 1, INVOCATION: 2, TEXT: 3, BOOLEAN: 10, DICTIONARY: 11, ARRAY: 12, NUMBER: 13, STRING: 14 }
}

Paragraphs
	= NEWLINE* head:Paragraph NEWLINE NEWLINE+ tail:Paragraphs { return [head, ...tail] }
    / NEWLINE* head:Paragraph NEWLINE* { return [head] }
Paragraph = chain:ParagraphChain { return { type: TYPE.PARAGRAPH, value: chain, location: location() } }
ParagraphChain 'paragraph'
	= head:LineContent NEWLINE? tail:ParagraphChain { return [head, ...tail] }
	/ head:LineContent { return [head] }

LineContent	= Command / Text

Text 'text'	= text:TextContent+  { return { type: TYPE.TEXT, value: text.join('') } }
TextContent 'text' = '\\\\' { return '\\' } / [^\r\n\\]+ { return text() }

Command 'command' = '\\' name:CommandName args:CommandArguments? { return { type: TYPE.INVOCATION, name, args: args || [] } }
CommandName 'command name'
	= CommandChars CommandName { return text() }
	/ CommandChars [_:-] CommandName { return text() }
	/ CommandChars { return text() }
CommandChars = [a-zA-Z!#-&*-+--/;-@] [0-9]?
CommandArguments
	= '(' _ args:ValueChain _ ')' { return args }
	/ '(' args:[^)]+ ')' { return [ { type: TYPE.STRING, value: args.join('') }] }

ValueChain 'command arguments'
	= head:Value _ ',' _ NEWLINE? _ tail:ValueChain { return [head, ...tail] }
	/ head:Value { return [head] }
Value = Boolean / Dictionary / Array / Command / Number / Name / String

Name 'name' = name:CommandName { return { type: TYPE.STRING, value: name } }
Boolean 'boolean' = ('true' / 'false') { return { type: TYPE.BOOLEAN, value: text() === 'true' } }
Number 'number' = '-'? [0-9]+ float:('.' [0-9]+)? { return { type: TYPE.NUMBER, value: (float ? parseFloat(text()) : parseInt(text(), 10)) } }
String 'string'
	= '"' text:[^"]* '"' { return { type: TYPE.STRING, value: text.join('') } }
	/ "'" text:[^']* "'" { return { type: TYPE.STRING, value: text.join('') } }
Array 'array'
	= '[' _ NEWLINE? _ chain:ValueChain _ NEWLINE? _ ']' { return { type: TYPE.ARRAY, value: chain } }
    / '[' _ ']' { return { type: TYPE.ARRAY, value: [] } }

Dictionary 'dictionary'
	= '{' _ NEWLINE? _ pairs:KeyValuePairs _ NEWLINE? _ '}' { return { type: TYPE.DICTIONARY, value: pairs.reduce((acc, e) => (acc[e.name] = e.value) && acc, {}) } }
	/ '{' _ '}' { return { type: TYPE.DICTIONARY, value: {} } }
KeyValuePairs 'key-value pair(s)'
	= head:KeyValuePair _ ','? NEWLINE _ tail:KeyValuePairs { return [head, ...tail] }
	/ head:KeyValuePair _ ',' _ tail:KeyValuePairs { return [head, ...tail] }
    / head:KeyValuePair { return [head] }
KeyValuePair 'key-value pair'
	= name:CommandName _ ':' _ value:Value { return { name, value } }
	/ name:String _ ':' _ value:Value { return { key: name.value, value } }

NEWLINE 'newline' = '\r\n' / '\r' / '\n'
_ 'optional inline whitespace' = [ \t]*
__ 'optional whitespace' = [ \t\r\n]*