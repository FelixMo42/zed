import type { TokenStream } from "./lexer.ts";

export type FileNode = {
    kind: "FILE_NODE",
    items: FuncNode[]
}

export interface FuncNode {
    kind: "FUNC_NODE"
    name: string
    body: StatmentNode[]
    params: string[]
}

// Statment

export type StatmentNode = ReturnNode | AssignmentNode | DiscardNode

export interface AssignmentNode {
    kind: "ASSIGNMENT_NODE"
    name: Expr,
    value: Expr
}

export interface DiscardNode {
    kind: "DISCARD_NODE"
    value: Expr
}

export interface ReturnNode {
    kind: "RETURN_NODE"
    value: Expr
}

export interface IdentNode {
    kind: "IDENT_NODE"
    value: string
}

export type Expr
    = number
    | string
    | Expr[]

// TOP LEVEL //

export function parse_file(tks: TokenStream): FileNode {
    const items = []

    while (!tks.done()) {
        const node = parse_func(tks)!
        items.push(node)
    }

    return {
        kind: "FILE_NODE",
        items
    }
}

export function parse_func(tks: TokenStream): FuncNode | undefined {
    if (tks.take("fn")) {
        const name = tks.take("<ident>")!

        // params
        tks.take("(")
        const params: string[] = []
        while (!tks.take(")")) {
            params.push(tks.take("<ident>")!)
        }


        // body
        tks.take("{")
        const body: StatmentNode[] = []
        while (!tks.take("}")) {
            body.push(parse_stmt(tks))
        }

        // returns
        return {
            kind: "FUNC_NODE",
            name,
            body,
            params
        }
    }    
}

// STATMENTS //

function parse_stmt(tks: TokenStream): StatmentNode {
    if (tks.take("return")) return {
        kind: "RETURN_NODE",
        value: parse_expr(tks)!
    }

    const expr = parse_expr(tks)

    if (expr && tks.take("=")) return {
        kind: "ASSIGNMENT_NODE",
        name: expr,
        value: parse_expr(tks)!
    }

    if (expr) return {
        kind: "DISCARD_NODE",
        value: expr
    }

    throw new Error("Parsing error!")
}

// INDEX_NODEESSIONS //

function parse_expr(tks: TokenStream): Expr {
    if (tks.take("(")) {
        const values = []

        while (!tks.take(")")) {
            values.push(parse_expr(tks)!)
        }

        return values
    } else if (tks.peak("<number>")) {
        return Number(tks.take("<number>")!)
    } else if (tks.peak("<ident>")) {
        return tks.take("<ident>")!
    }

    throw new Error("Parsing error!")
}

// UTIL //

export function parse(tks: TokenStream) {
    return parse_file(tks)
}
