// deno-lint-ignore-file ban-types

import { Type } from "./types.ts";

export type Value = number | boolean | Function

export const builtins: [string, Type, Value][] = [
    [ "true",
        Type("bool"),
        true,
    ],
    [ "false",
        Type("bool"),
        false,
    ],
    [ "||",
        Type("@fn", [ Type("bool"), Type("bool"), Type("bool") ]),
        (a: boolean, b: boolean) => a || b,
    ],
    [ "&&",
        Type("@fn", [ Type("bool"), Type("bool"), Type("bool") ]),
        (a: boolean, b: boolean) => a && b,
    ],
    [ "==",
        Type("@fn", [ Type("int"), Type("int"), Type("bool") ]),
        (a: number, b: number) => a === b,
    ],
    [ "!=",
        Type("@fn", [ Type("int"), Type("int"), Type("bool") ]),
        (a: number, b: number) => a !== b,
    ],
    [ "<",
        Type("@fn", [ Type("int"), Type("int"), Type("bool") ]),
        (a: number, b: number) => a < b,
    ],
    [ ">",
        Type("@fn", [ Type("int"), Type("int"), Type("bool") ]),
        (a: number, b: number) => a > b,
    ],
    [ "<=",
        Type("@fn", [ Type("int"), Type("int"), Type("bool") ]),
        (a: number, b: number) => a <= b,
    ],
    [ ">=",
        Type("@fn", [ Type("int"), Type("int"), Type("bool") ]),
        (a: number, b: number) => a >= b,
    ],
    [ "+",
        Type("@fn", [ Type("int"), Type("int"), Type("int") ]),
        (a: number, b: number) => a + b,
    ],
    [ "-",
        Type("@fn", [ Type("int"), Type("int"), Type("int") ]),
        (a: number, b: number) => a - b,
    ],
    [ "*",
        Type("@fn", [ Type("int"), Type("int"), Type("int") ]),
        (a: number, b: number) => a * b,
    ],
    [ "/",
        Type("@fn", [ Type("int"), Type("int"), Type("int") ]),
        (a: number, b: number) => a / b,
    ],
    [ "**",
        Type("@fn", [ Type("int"), Type("int"), Type("int") ]),
        (a: number, b: number) => a ** b,
    ],
    [ "sqrt",
        Type("@fn", [ Type("int"), Type("int") ]),
        (n: number) => Math.sqrt(n),
    ],
    [ "array",
        Type("@fn", [
            Type("#1"), Type("#1"),
            Type("@fn", [ Type("int"), Type("#1") ])
        ], ["#1"]),
        (...vs: Value[]) => (i: number) => vs[i],
    ],
]

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

    for (const builtin of builtins) {
        ctx.set(builtin[0], builtin[2])
    }

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
