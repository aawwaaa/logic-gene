import { doWhileLoop, ifThen, whileLoop } from "../generator/condition";
import { Condition, Value, Var, always, build, control, jumpToAfter, prop, sensor } from "../generator/core";
import { generateIO } from "../generator/private/io";

const status = generateIO(build("cell1"), {
    health: 0,
    mana: 1,
    charge: 2,
    overloaded: 3,
    special: 4
})

const data = generateIO(build("cell1"), {
    bulletPos: 32,
    laser: 33,
    summon: 34,
    damage: 48,
    shielded: 49,
    breakShield: 50,
    reset: 63
})

const other = generateIO(build("cell2"), {
    laser: 33,
    damage: 48,
    shielded: 49,
    breakShield: 50
})

ifThen(data.reset().notEqual(0), () => {
    status.health(200)
    status.mana(200)
    status.charge(0)
    status.overloaded(1)
    status.special(0)
    data.damage(0)
    data.bulletPos(-1)
    data.laser(-1)
    data.summon(-1)
    data.breakShield(0)
    data.reset(0)
})

function skill(buildName: string, checker: (fail: () => void) => void, process: (end: () => void) => void, other?: () => void){
    const jumps = []
    ifThen(sensor(build(buildName), prop("enabled")).get().notEqual(0), () => {
        checker(() => {
            control(build(buildName)).enabled(0)
            jumps.push(jumpToAfter(always))
        })
        process(() => {
            control(build(buildName)).enabled(0)
        })
    }, other)
    jumps.forEach(j => j.here())
}

function checkProp(prop: (value?: Value<number>) => Var<number>, fail: () => void, cond: (value: Var<number>) => Condition){
    const value = prop()
    ifThen(cond(value), fail)
}

function opProp(prop: (value?: Value<number>) => Var<number>, val: Value<number>){
    const value = prop()
    value.add(val)
    prop(value)
}

ifThen(status.mana().lessThan(200), () => {
    opProp(status.mana, 0.5)
})

ifThen(status.charge().lessThan(100), () => {
    opProp(status.charge, 0.5)
    ifThen(status.charge().greaterThanEq(100), () => {
        status.overloaded(0)
    })
})

// heal
skill("switch1", (fail) => {
    checkProp(status.mana, fail, (mana) => mana.lessThan(2))
    checkProp(status.health, fail, (health) => health.greaterThanEq(200))
}, () => {
    opProp(status.health, 2)
    opProp(status.mana, -2)
})

// shield
skill("switch2", (fail) => {
    checkProp(status.mana, fail, (mana) => mana.lessThan(0.6))
    checkProp(data.breakShield, fail, (v) => v.notEqual(0))
}, () => {
    opProp(status.mana, -0.6)
    data.shielded(1)
    control(build("switch3")).enabled(0)
    control(build("switch4")).enabled(0)
}, () => {
    data.shielded(0)
    data.breakShield(0)
})

// normal attack
skill("switch3", (fail) => {
    checkProp(status.mana, fail, (mana) => mana.lessThan(40))
    checkProp(data.bulletPos, fail, (pos) => pos.notEqual(-1))
}, (end) => {
    opProp(status.mana, -40)
    data.bulletPos(0)
    end()
})
ifThen(data.bulletPos().notEqual(-1), () => {
    const pos = data.bulletPos()
    pos.add(4)
    data.bulletPos(pos)
    ifThen(pos.greaterThan(300), () => {
        data.bulletPos(-1)
        other.damage(1)
    })
})
ifThen(data.damage().equal(1), () => {
    data.damage(0)
    ifThen(data.shielded().equal(0), () => {
        opProp(status.health, -25)
    })
    data.breakShield(1)
})

// laser
skill("switch4", (fail) => {
    checkProp(status.mana, fail, (mana) => mana.lessThan(10))
    checkProp(status.charge, fail, (charge) => charge.lessThan(10))
    checkProp(status.overloaded, fail, (over) => over.notEqual(0))
}, () => {
    opProp(status.mana, -10)
    opProp(status.charge, -10)
    ifThen(data.laser().notEqual(-1), () => {
        data.laser(data.laser().add(0.1))
    }, () => {
        data.laser(1)
    })
    ifThen(status.charge().lessThan(5), () => {
        status.overloaded(1)
        status.special(status.special().add(1))
    })
}, () => {
    data.laser(-1)
})
ifThen(other.laser().notEqual(-1), () => {
    const damage = other.laser().mul(-2)
    ifThen(data.shielded().equal(0), () => {
        opProp(status.health, damage)
    })
})

// summon
skill("switch5", (fail) => {
    checkProp(status.mana, fail, (mana) => mana.lessThan(10))
    checkProp(status.charge, fail, (charge) => charge.lessThan(5))
    checkProp(status.overloaded, fail, (over) => over.notEqual(0))
    checkProp(status.special, fail, (special) => {
        const cond = special.toOpLessThan(1).and(data.summon().toOpEqual(-1))
        return cond.notEqual(0)
    })
}, () => {
    opProp(status.mana, -10)
    opProp(status.charge, -5)
    ifThen(data.summon().notEqual(-1), () => {
        data.summon(data.summon().add(1))
    }, () => {
        data.summon(1)
        opProp(status.special, -1)
    })
}, () => {
    data.summon(-1)
})
ifThen(data.summon().greaterThan(15), () => {
    data.summon(-1)
    other.damage(2)
    control(build("switch5")).enabled(0)
})
ifThen(data.damage().equal(2), () => {
    data.breakShield(1)
    data.damage(0)
    opProp(status.health, -150)
})

ifThen(status.health().lessThan(0), () => {
    const reset = data.reset()
    doWhileLoop(()=>reset.equal(0), ()=>data.reset())
})
