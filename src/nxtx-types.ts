export interface Node {
    type: NodeType,
    value?: any,
    name?: string,
    args?: Array<Node>
}
export enum NodeType {
    Paragraph = 1,
    Command,
    Text,
    Block,
    Html,
    Node,
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
export interface TypeCheck {
    ok: boolean,
    invalid: Array<ArgumentCheck>
}

type CommandResultType = Node | HTMLElement | Text | undefined | void
export type CommandResult = Array<CommandResultType> | CommandResultType
export type CommandFunction = (...args:Array<Node>) => Promise<CommandResult> | CommandResult

export interface Package {
    name: string,
    requires?: Array<string>,
    commands?: { [name:string]: CommandFunction },
    preprocessors?: { [name:string]: CommandFunction },
    hooks?: { prerender?: Function, postrender?: Function }
}

export interface Nxtx {
    registerCommand: (cmd:string, fn:CommandFunction, overwrite?:boolean) => void
    registerPreprocessor: (cmd:string, fn:CommandFunction, overwrite?:boolean) => void
    verifyArguments: (types:Array<NodeType>, ...args:Array<Node>) => TypeCheck
    registerPackage: (pkg:Package) => void

    parse: (text:string) => Array<Node>
    render: (text:string, root:HTMLElement) => Promise<void>

    text: (content:string) => Text
    htmlLite: (nodeName:string, attributes:object) => HTMLElement
    html: (nodeName:string, attributes:object, ...children:Array<Promise<HTMLElement|Node|string>|HTMLElement|Node|string>) => Promise<HTMLElement>

    on: (event:string, handler:Function) => void
    off: (event:string, handler:Function) => void
}