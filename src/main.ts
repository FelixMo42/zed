import { lexer } from "./lang/lexer.ts";
import { parse } from "./lang/parse.ts";
import { runer } from "./lang/runer.ts";
import { types } from "./lang/types.ts";
import { format } from "./util/format.ts";

async function main() {
    const src = await Deno.readTextFile("./test.zed")
    const tks = lexer(src)

    console.log("#AST")
    const ast = parse(tks)!
    console.log(format(ast))

    console.log("\n#TYPES")
    const t = types(ast)
    for (const [a, b] of t.entries()) {
        console.log(`${format(a).padEnd(9)} -> ${format(b)}`)
    }

    console.log("\n#OUT")
    const out = runer(ast)
    console.log(format(out))
}

main()
