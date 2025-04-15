import { Expr, FileNode } from "./parse.ts";
import { builtins } from "./scope.ts";

export type Type = {
    kind: "TYPE",
    name: string,
    args: Type[],
    with: string[]
}

function root() {
    const types = new Map<string, Type>()

    for (const builtin of builtins) {
        types.set(builtin[0], builtin[1])
    }

    return types
}

interface Ctx {
    types: Map<string, Type>
    links: [Type, Type][]
    scope: string
}

export function types(file: FileNode) {
    const types = new Map<string, Type>()
    const links: [Type, Type][] = []

    const r = root()
    for (const [k, v] of r.entries()) {
        types.set(k, v)
    }

    for (const func of file.items) {
        const scope = func.name
        const param_types = func.params.map(new_unknown)
        const return_type = new_unknown()

        types.set(`${scope}`, Type("@fn", [...param_types, return_type]))

        for (let i = 0; i < func.params.length; i++) {
            types.set(`${scope}::${func.params[i]}`, param_types[i])
        }
    }

    for (const func of file.items) {
        const scope = func.name
        const func_type = types.get(scope)!

        for (const stmt of func.body) {
            const ctx = {
                types,
                links,
                scope,
            } 

            if (stmt.kind === "ASSIGNMENT_NODE") {
                types.set(`${scope}::${stmt.name}`, get_type_expr(ctx, stmt.value, new_unknown()))
            }

            if (stmt.kind === "RETURN_NODE") {
                const return_type = func_type.args[func_type.args.length - 1]
                get_type_expr(ctx, stmt.value, return_type)
            }
        }
    }

    for (const [k, v] of types.entries()) {
        types.set(k, resolve(links, v)!)
    }

    return types
}

function resolve(links: [Type, Type][], type: Type): Type | undefined {
    if (type.name.startsWith("T")) {
        for (const [a, b] of links) {
            if (eq(a, type)) {
                const r = resolve(links, b)
                if (r) {
                    return r
                }
            }
            if (eq(b, type)) {
                const r = resolve(links, a)
                if (r) {
                    return r
                }
            }
        }
    } else {
        return Type(type.name, type.args.map(arg => resolve(links, arg)!))
    }
}

function get_type_expr(ctx: Ctx, expr: Expr, expected: Type): Type {
    if (typeof expr === "number") {
        return Type("int")
    } else if (typeof expr === "string") {
        const t = ctx.types.get(`${ctx.scope}::${expr}`) ?? ctx.types.get(expr)!
        link(ctx, t, expected)
        return t
    } else {
        const func_call_sig = Type("@fn", [
            ...expr
                .slice(1)
                .map(e => get_type_expr(ctx, e, new_unknown())),
            expected,
        ])

        const func = init(get_type_expr(ctx, expr[0], func_call_sig))

        link(ctx, func, func_call_sig)

        return func.args[func.args.length - 1] ?? expected
    }
}

function clone(t: Type, r: Map<string, Type>): Type {
    if (r.has(t.name)) {
        return r.get(t.name)!
    } else {
        return Type(t.name, t.args.map(arg => clone(arg, r)))
    }
}

function init(type: Type): Type {
    const replacments = new Map()

    for (const name of type.with) {
        replacments.set(name, new_unknown())
    }

    return clone(type, replacments)
}

function link(ctx: Ctx, a: Type, b: Type) {
    if (a.name === "@fn" && b.name === "@fn") {
        if (a.args.length != b.args.length) {
            console.log("Wrong call!")
        }

        for (let i = 0; i < a.args.length; i++) {
            link(ctx, a.args[i], b.args[i])
        }

        return
    }

    if (!eq(a, b)) {
        // check if we already have this
        for (const [pa, pb] of ctx.links) {
            if ((eq(pa, a) && eq(pb, b)) || (eq(pa, b) && eq(pb, a))) {
                return
            }
        }

        ctx.links.push([a, b])
    }
}

function eq(a: object, b: object): boolean {
    return JSON.stringify(a) == JSON.stringify(b)
}

let unknowns = 0
function new_unknown(): Type {
    return Type(`T${unknowns++}`)
}

export function Type(name: string, args:Type[]=[], wit:string[]=[]): Type {
    return {
        kind: "TYPE",
        name,
        args,
        with: wit,
    }
}