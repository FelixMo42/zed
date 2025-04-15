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
        const params = csv(tks, "(", (t) => t.take("<ident>")!, ")")!
        const body = csv(tks, "{", parse_stmt, "}")!

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

// PARSE EXPR //

function parse_expr(tks: TokenStream): Expr {
    const op = parse_op(tks)

    return op
}

// PARSE OP //

const ops = [
    ["||"],  // lowest precedence
    ["&&"],
    ["==", "!="],
    ["<", ">", "<=", ">="],
    ["+", "-"],
    ["*", "/"],
    ["**"]  // highest precedence
]

function parse_op(tks: TokenStream, i=0): Expr {
    if (i >= ops.length) {
        return parse_value(tks)
    }

    const a = parse_op(tks, i+1)    

    for (const op of ops[i]) {
        if (tks.take(op)) {
            return [op, a, parse_op(tks, i)]
        }
    }

    return a
}

// PARSE VALUE //

function parse_value(tks: TokenStream): Expr {
    const start = parse_value_core(tks)
    return parse_value_rec(start, tks)
}

function parse_value_core(tks: TokenStream): Expr {
    if (tks.peak("<number>")) {
        return Number(tks.take("<number>")!)
    } else if (tks.peak("<ident>")) {
        return tks.take("<ident>")!
    } else if (tks.take("(")) {
        const value = parse_expr(tks)
        tks.take(")")
        return value
    }

    throw new Error("Parsing error!")
}

function parse_value_rec(start: Expr, tks: TokenStream): Expr {
    if (tks.take("(")) {
        const values = []

        while (!tks.take(")")) {
            values.push(parse_expr(tks)!)
        }

        return parse_value_rec([start, ...values], tks)
    }

    return start
}

// UTIL //

function csv<T>(tks: TokenStream, a: string, f: (tks: TokenStream) => T, b: string): T[] | undefined {
    if (!tks.take(a)) return undefined
    const items = []
    while (!tks.take(b)) {
        items.push(f(tks))
    }
    return items
}

export function parse(tks: TokenStream) {
    return parse_file(tks)
}
