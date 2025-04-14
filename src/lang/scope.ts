// deno-lint-ignore-file ban-types

export type Value = number | boolean | Function



export interface Ctx {
    get(name: string): Value
    set(name: string, value: Value): void
    sub(): Ctx
}

function create_scope(parent: Ctx): Ctx {
    const vars = new Map<string, Value>()
    const self = {
        get(name: string) {
            return vars.get(name) ?? parent.get(name)!
        },
        set(name: string, value: Value) {
            vars.set(name, value)
        },
        sub(): Ctx {
            return create_scope(self)
        }
    }
    return self
}

export function global_scope(): Ctx {
    const ctx = new Map<string, Value>()

    ctx.set("+", (a: number, b: number) => a + b)
    ctx.set("-", (a: number, b: number) => a - b)
    ctx.set("*", (a: number, b: number) => a * b)
    ctx.set("/", (a: number, b: number) => a / b)
    ctx.set("**", (a: number, b: number) => a ** b)
    ctx.set("sqrt", (a: number) => Math.sqrt(a))
    ctx.set("array", (...vs: Value[]) => (i: number) => {
        return vs[i]
    })

    const self = {
        get(name: string) {
            return ctx.get(name)!
        },
        set(name: string, value: Value) {
            ctx.set(name, value)
        },
        sub(): Ctx {
            return create_scope(self)
        }
    }

    return self
}
