export interface Node {
    type: NodeType,
    value?: any,
    name?: string,
    args?: Array<Node>
}
export enum NodeType {
    Paragraph = 1,
    Invocation,
    Text,
    Block,
    Html,
    Node,

    Boolean = 10,
    Dictionary = 11,
    Array,
    Number,
    String
}

export interface ArgumentCheck {
    expected: NodeType,
    actual: NodeType,
    index: number
}
export interface ArgumentCheckResult {
    ok: boolean,
    invalid: Array<ArgumentCheck>
}

type CommandResultTypes = Node | HTMLElement | Text | undefined | void
type CommandResultType = Promise<CommandResultTypes> | CommandResultTypes
export type CommandResult = Array<CommandResultType> | CommandResultType
export type CommandFunction = (...args:Array<Node>) => CommandResult

export interface Package {
    name: string,
    requires?: Array<string>,
    commands?: { [name:string]: CommandFunction },
    preprocessors?: { [name:string]: CommandFunction },
    hooks?: { prerender?:()=>void, midrender?:()=>void, postrender?:()=>void }
}

export type RenderEvent = 'prerender'|'midrender'|'postrender'

export interface INxtx {
    registerCommand: (cmd:string, fn:CommandFunction, overwrite?:boolean) => void
    registerPreprocessor: (cmd:string, fn:CommandFunction, overwrite?:boolean) => void
    verifyArguments: (types:Array<NodeType>, ...args:Array<Node>) => ArgumentCheckResult
    jsArguments: (...nodeArgs: Array<Node>) => Array<any>
    jsArgument: (nodeArg: Node) => any
    registerPackage: (pkg:Package) => void

    parse: (code:string) => Array<Node>
    render: (code:string, root:HTMLElement) => Promise<void>

    text: (content:string) => Text
    htmlLite: (nodeName:string, attributes:object, ...children:Array<HTMLElement|string>) => HTMLElement
    html: (nodeName:string, attributes:object, ...children:Array<Promise<HTMLElement|Node|string>|HTMLElement|Node|string>) => Promise<HTMLElement>

    on: (event:RenderEvent, handler:()=>void) => void
    off: (event:RenderEvent, handler:()=>void) => void
}