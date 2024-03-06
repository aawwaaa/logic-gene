import { getResult } from "./generator/core"
import { writeFileSync, readdirSync } from "fs"

(async ()=>{
    for(const file of readdirSync("./codes")){
        await import("./codes/"+file)
        writeFileSync("./outs/"+file.replace(".ts", ".txt"), getResult())
    }
    console.log("complete!")
})()

// import "./cpu/processor"

export default {}
