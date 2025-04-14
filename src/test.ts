import { assertEquals } from "jsr:@std/assert";

import { lexer } from "./lang/lexer.ts";
import { parse } from "./lang/parse.ts";
import { runer } from "./lang/runer.ts";

function run(src: string) {
    const tks = lexer(src)
    const ast = parse(tks)!
    const out = runer(ast)
    return out
}

function assert_stmt(stmt: string, value: number | boolean) {
    return assertEquals(run(`
        fn main() {
            return ${stmt}
        }    
    `), value)
}

// Done
Deno.test("1", () => assert_stmt(`1`, 1))
Deno.test("42", () => assert_stmt(`42`, 42))
Deno.test("(+ 1 41)", () => assert_stmt(`(+ 1 41)`, 42))
