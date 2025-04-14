import { lexer } from "./lang/lexer.ts";
import { parse } from "./lang/parse.ts";
import { runer } from "./lang/runer.ts";
import { format } from "./util/format.ts";

async function main() {
    const src = await Deno.readTextFile("./test.zed")
    const tks = lexer(src)

    console.log("#AST")
    const ast = parse(tks)!
    console.log(format(ast))

    console.log("#OUT")
    const out = runer(ast)
    console.log(format(out))
}

main()
