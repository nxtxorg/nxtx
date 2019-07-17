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
    hooks?: { [name:string]: Function }
}