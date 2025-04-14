import { FileNode, FuncNode, StatmentNode } from "../lang/parse.ts";
import { Expr } from "../lang/parse.ts";

type Formatable
    = string
    | undefined
    | number
    | boolean
    | Expr
    | undefined
    | FuncNode
    | StatmentNode
    | FuncNode
    | FileNode

function tab(s: string): string {
    return s.split("\n").map(l => "    " + l).join("\n")
}

export function format(v: Formatable): string {
    if (v === undefined) return ""
    if (typeof v === "string") return v
    if (typeof v === "number") return String(v)
    if (typeof v === "boolean") return String(v)

    if (Array.isArray(v)) {
        return `(${v.map(format).join(" ")})`
    }
    if (v.kind == "FILE_NODE") {
        return v.items.map(format).join("\n\n")
    } else if (v.kind === "FUNC_NODE") {
        return `fn ${v.name}(${v.params.map(format).join(", ")}) {\n${v.body.map(format).map(tab).join("\n")}\n}`
    } else if (v.kind === "RETURN_NODE") {
        return `return ${format(v.value)}`
    } else if (v.kind === "ASSIGNMENT_NODE") {
        return `${format(v.name)} = ${format(v.value)}`
    } else {
        throw new Error("Can't format: " + JSON.stringify(v))
    }
}
