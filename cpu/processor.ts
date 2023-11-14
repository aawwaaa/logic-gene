import fs = require("fs")
import { commands, components, macros, registers } from "./consts"

for(const file of fs.readdirSync("./cpu/codes")){
    const data = fs.readFileSync("./cpu/codes/"+file).toString()
    const result = compile(data, file)
    let i = 0
    let j = 1
    let str = ""
    for(const line of result.split("\n")){
        str += line + "\n"
        i += 1
        if(i >= 998){
            fs.writeFileSync("./cpu/outs/"+file.replace(".txt", "_"+j+".txt"), str)
            str = ""
            j += 1
            i = 0
        }
    }
    if(i > 0){
        fs.writeFileSync("./cpu/outs/"+file.replace(".txt", "_"+j+".txt"), str)
    }
}
console.log("compile complete!")

export function decodeData(data, file, index, labels, ptr, labelbase){
    if(!data) return 0
    if(typeof(data) == "number") return data
    if(data.startsWith("$")){
        if(!registers[data.substring(1)]){
            console.log(file+" "+index+": unknown register: "+data.substring(1))
            return
        }
        return registers[data.substring(1)]
    }
    if(data.startsWith(":")) return data
    if(data.startsWith("+")) return +data + ptr - 1 + labelbase
    if(data.startsWith(".")){
        const result = (data as string).substring(1).split(".").reduce((a, b) => a[b], components)
        if(result == void 0) console.log(file+" "+index+": unknown component address: "+data)
        return result
    }
    if(data.startsWith("'")) return data.charCodeAt(1)
    return +data
}

function compile(data, file){
    const neg = Math.pow(2, 51)

    let ptr = 0, bank = 2, out = "", labels = {}, defines = {}, labelbase = 0
    function writeLine(command, data){
        // if(bank == 1)console.log(ptr, Object.keys(commands)[command], data, decodeData(data, file, 0, labels, (bank - 1) * 512 + ptr, labelbase))
        if(typeof(data) == "string" && data.startsWith(":"))
            return writeLineLabel(command, data.substring(1))
        if(typeof(data) == "string") data = decodeData(data, file, 0, labels, (bank - 1) * 512 + ptr, labelbase)
        if(typeof(command)=="string" && command.startsWith(":")){
            command = "$"+command.substring(1)
        }else if(data < 0){
            command += (-data) << 8
            command += neg
        }else command |= data << 8
        out += "write "+command+" bank"+bank+" "+ptr+"\n"
        ptr += 1
        if(ptr >= 512){
            ptr = ptr % 512
            bank += 1
        }
        return (bank - 1) * 512 + ptr
    }
    function writeLineLabel(command, label){
        out += "write $"+label+" "+command+" bank"+bank+" "+ptr+"\n"
        ptr += 1
        if(ptr >= 512){
            ptr = ptr % 512
            bank += 1
        }
        return (bank - 1) * 512 + ptr
    }
    data.split("\n").forEach((line, index) => {
        line = (line.split(";")[0] as string).trimStart()
        if(!line || line.startsWith("#")) return
        if(line.endsWith(":")){
            labels[line.substring(0, line.length - 1)] = (bank - 1) * 512 + ptr
            return
        }
        const [command, data, ...oth] = line.split(" ").map(a => defines[a] ?? a)
        if(command == "labelbase"){
            labelbase = +data
            return
        }
        if(command == "define"){
            defines[data] = oth.join(" ")
            return
        }
        if(macros[command]){
            const ret = macros[command](line, [command, data, ...oth], writeLine,
                (bank - 1) * 512 + ptr, labels, () => out, (o) => out = o,
                (a) => decodeData(a, file, index+1, labels, ptr, labelbase))
            if(ret != void 0){
                bank = Math.floor(ret / 512) + 1
                ptr = ret % 512
            }
            return
        }
        if(commands[command] == void 0){
            console.log(file+" "+(index+1)+": unknown command: "+command)
            return
        }
        const value = decodeData(data, file, index+1, labels, ptr, labelbase)
        writeLine(commands[command], value)
    })
    writeLine(0, 0)
    // Object.entries(labels).forEach(([k, v]) => {
    //     console.log(k, (v as number)+labelbase)
    // })
    out = out.replace(/(\$)(.*?)( [0-9]+)? /g, (str, _, label, command) => {
        const data = labels[label] + labelbase
        if(data == void 0){
            console.log(file+" unknown label: "+label)
            return "<error> "
        }
        if(command == void 0){
            return data + " "
        }
        if(data < 0){
            command += (-data) << 8
            command += neg
        }else command |= data << 8
        return command+" "
    })
    return out
}