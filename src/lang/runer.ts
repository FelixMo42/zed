import { format } from "../util/format.ts";
import { Expr, FileNode, FuncNode } from "./parse.ts";
import { Ctx, global_scope, Value } from "./scope.ts";

export function runer(mod: FileNode): Value | undefined {
    const main = mod.items.find(item => item.name === "main")!

    const module_scope = global_scope().sub()

    for (const func of mod.items) {
        module_scope.set(func.name, (...args: Value[]): Value | undefined => {
            const function_scope = module_scope.sub()

            for (let i = 0; i < args.length; i++) {
                function_scope.set(func.params[i], args[i])
            }

            return run_func(function_scope, func)
        })
    }

    return run_func(module_scope, main)
}

function run_func(ctx: Ctx, func: FuncNode): Value | undefined {
    for (const stmt of func.body) {
        const value = run_expr(ctx, stmt.value)

        if (stmt.kind === "ASSIGNMENT_NODE") {
            if (typeof stmt.name != "string") {
                throw new Error(`Can't assign ${format(stmt.name)}!`)   
            }
        
            ctx.set(stmt.name, value)
        }

        if (stmt.kind === "RETURN_NODE") {
            return value
        }
    }
}

function run_expr(ctx: Ctx, expr: Expr): Value {
    if (typeof expr === "number") {
        return expr
    } else if (typeof expr === "string") {
        return ctx.get(expr)!
    } else {
        const args = expr.slice(1).map(arg => run_expr(ctx, arg))
        const func = run_expr(ctx, expr[0])

        if (typeof func !== "function") {
            throw new Error(`Can't call ${format(expr[0])}`)
        }

        return func(...args)
    }
}
