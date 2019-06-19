Paragraphs
	= NEWLINE* head:Paragraph NEWLINE NEWLINE+ tail:Paragraphs { return [head, ...tail] }
    / NEWLINE* head:Paragraph NEWLINE* { return [head] }
Paragraph = chain:ParagraphChain { return { type: 'paragraph', value: chain } }
ParagraphChain 'paragraph'
	= head:LineContent NEWLINE? tail:ParagraphChain { return [head, ...tail] }
	/ head:LineContent { return [head] }

LineContent	= Command / Text

Text 'text'	= text:TextContent+  { return { type: 'text', value: text.join('') } }
TextContent 'text' = '\\\\' { return '\\' } / [^\r\n\\]+ { return text() }

Command 'command' = '\\' name:CommandName args:CommandArguments? { return { type: 'command', name, args: args || [] } }
CommandName 'command name'
	= [a-zA-Z] CommandName { return text() }
	/ [a-zA-Z] [a-zA-Z0-9_:-] CommandName { return text() }
	/ [a-zA-Z] { return text() }
	/ [a-zA-Z] [0-9] { return text() }
CommandArguments
	= '(' _ args:CommandArgumentChain _ ')' { return args }
	/ '(' args:[^)]+ ')' { return [ { type: 'string', value: args.join('') }] }
CommandArgumentChain 'command arguments'
	= head:Value _ ',' _ tail:CommandArgumentChain { return [head, ...tail] }
	/ head:Value { return [head] }

Value = Name / Command / Dictionary / Float / Integer / String
Name 'name' = name:CommandName { return { type: 'string', value: name } }
Float 'float' = [0-9]+ '.' [0-9]+ { return { type: 'float', value: parseFloat(text()) } }
Integer 'integer' = [0-9]+ { return { type: 'int', value: parseInt(text(), 10) } }
String 'string'
	= '"' text:[^"]* '"' { return { type: 'string', value: text.join('') } }
	/ "'" text:[^']* "'" { return { type: 'string', value: text.join('') } }

Dictionary 'dictionary'
	= '{' _ NEWLINE? _ pairs:KeyValuePairs _ NEWLINE? _ '}' { return { type: 'dictionary', value: pairs.reduce((acc, e) => (acc[e.name] = e.value) && acc, {}) } }
	/ '{' _ '}' { return { type: 'dictionary', value: {} } }
KeyValuePairs 'key-value pair(s)'
	= head:KeyValuePair _ NEWLINE _ tail:KeyValuePairs { return [head, ...tail] }
	/ head:KeyValuePair _ ',' _ tail:KeyValuePairs { return [head, ...tail] }
    / head:KeyValuePair { return [head] }
KeyValuePair 'key-value pair'
	= name:CommandName _ ':' _ value:Value { return { name, value } }
	/ name:String _ ':' _ value:Value { return { name: name.value, value } }

NEWLINE 'newline' = '\r\n' / '\r' / '\n'
_ 'optional inline whitespace' = [ \t]*
__ 'optional whitespace' = [ \t\r\n]*