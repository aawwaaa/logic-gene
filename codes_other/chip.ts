import { variable } from "../generator/core";
import { binaryPort } from "../generator/private/binary";

const input = binaryPort(0, 4)
const output = binaryPort(4, 4)

const inputValue = variable()
input.read(inputValue)

inputValue.not()
output.write(inputValue)
