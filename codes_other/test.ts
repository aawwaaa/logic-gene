import { variable } from "../generator/core";
import { createMemoryModule } from "../generator/private/memory";

const memory = createMemoryModule("memory", 4);

memory.write(2, 200);

const value = variable()
memory.read(2, value);