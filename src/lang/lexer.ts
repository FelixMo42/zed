export interface TokenStream {
    take(match: string): string | undefined
    peak(match?: string): string | undefined
    save(): number
    load(i: number): void
    logs(): void
    done(): boolean
}

export function lexer(src: string): TokenStream {
    const tokens = src
        .matchAll(/[\w]+|\(|\)|[^\s\w\(\)]+/g)
        .toArray()
        .map(match => match[0])

    let index = 0

    const self = {
        done() {
            return index >= tokens.length
        },
        logs() {
            console.log(tokens)
        },
        take(match: string) {
            const value = self.peak(match)
            if (value != undefined) index++
            return value
        },
        peak(match: string) {
            if (!match) {
                return tokens[index]
            } else if (match === "<ident>") {
                if (tokens[index] == "(" || tokens[index] == ")") {
                    return undefined
                }
        
                if (!isNumeric(tokens[index])) {
                    return tokens[index]
                }
            } else if (match === "<number>") {
                if (isNumeric(tokens[index])) {
                    return tokens[index]
                }
            } else if (tokens[index] == match) {
                return tokens[index]
            }
        },
        save() {
            return index
        },
        load(i: number) {
            index = i
        }
    }

    return self
}

function isNumeric(str: string) {
    return /^\d+$/.test(str)
}
