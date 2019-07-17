import {CommandFunction, Node, NodeType, TypeCheck} from "./nxtx-types";

export default interface Nxtx {
    registerCommand: (cmd:string, fn:CommandFunction, overwrite?:boolean) => void
    registerPreprocessor: (cmd:string, fn:CommandFunction, overwrite?:boolean) => void
    verifyArguments: (types:Array<NodeType>, ...args:Array<Node>) => TypeCheck

    parse: (text:string) => Array<Node>
    render: (text:string, root:HTMLElement) => Promise<void>

    text: (content:string) => Text
    htmlLite: (nodeName:string, attributes:object) => HTMLElement
    html: (nodeName:string, attributes:object, ...children:Array<Promise<HTMLElement|Node|string>|HTMLElement|Node|string>) => Promise<HTMLElement>

    on: (event:string, handler:Function) => void
    off: (event:string, handler:Function) => void
}