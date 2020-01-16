/**
 * @callback parseCallback
 * 
 * @param {index} index - what token were currently on
 */

/**
 * 
 * @param {Rule} rule 
 * @param {Token} token 
 */
let compare = (rule, token) => rule.name == token

let isSkipable = (step) =>
    step.quantifier == LOOP ||
    step.quantifier == SKIP

let isLoop = (step) => 
    step.quantifier == LOOP

let Error = (msg) => ({type: "error", msg})

/**
 * 
 * @param {*} baseType 
 * @param {*} tokens 
 */
let Parser = (baseType, tokens) => {
    let makeStep =
        (step, then, fail) =>
            function self(index, state) {
                let possibilities = []

                if ( isSkipable(step) ) {
                    possibilities.concat( then(index, state) )
                }
                
                possibilities.push( parse(
                    step.rule, index,
                    isLoop(step) ?
                        self :
                        then,
                    fail,
                    state
                ) )

                return possibilities
            }

    /**
     * 
     * @param {Rule} rule - the rule to parse
     * @param {number} index - what token were currently on
     * @param {parseCallback} next - called if success on match
     */
    let parse = (rule, index, then, fail, state) => {

        if ( rule.type == "type" ) {

            let first = rule.steps.reduceRight(
                (then, step) => makeStep(step, then, fail, state),
                then
            )
            
            return {
                type: rule.name,
                possibilities: first(index, state + rule.name + " ► ")
            }

        } else if ( rule.type == "token" ) {

            let successful = compare(rule, tokens[index]) 

            console.debug(`${state}${rule.name} ${successful ? "✔" : "x"}`)

            if (successful) {
                then(index + 1, " ".repeat(state.length))

                return [
                    tokens[index]
                ]
            } else {
                fail(index, " ".repeat(state.length))

                return [
                    Error(`expected ${rule.name}, got ${tokens[index]}.`)
                ]
            }
        }  else {
            console.log(`Invalid type: ${rule.type}`)
        }
    }

    return parse(
        baseType, 0,
        (index) => {},
        (index) => Error("Unexpected token"),
        ""
    )
}

let Token = (name) => ({type: "token", name}) 

let Type = ({name, steps}) => ({
    type: "type",
    name, steps
})

let NEXT = 0
let LOOP = 1
let SKIP = 2
let FAIL = 3

let Step = (rule) => ({
    type: "step",
    quantifier: NEXT,
    rule: rule,
})

let LoopStep = (rule) => ({
    type: "step",
    quantifier: LOOP,
    rule: rule
})

let OptStep = (rule) => ({
    type: "step",
    quantifier: SKIP,
    rule: rule,
})

///

let r = Type({
    name: "r",
    steps: [
        Step( Token("S") ),
        Step( Token("E") ),
        LoopStep( Token("S") )
    ]
})

let f = Type({
    name: "f",
    steps: [
        LoopStep( r ),
    ]
})

//

let output = Parser(f, ["S", "E", "S","S"])

console.log("\n")

const fs = require("fs-extra")

fs.writeJSON("temp/out.json", output, {spaces: "\t"})

console.log(output)
