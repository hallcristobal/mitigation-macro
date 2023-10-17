const fs = require("fs/promises")
const P1 = {
    "Stack 1": "Stack 1",
    "Stack 2": "Stack 2",
    "Stack 3": "Stack 3",
    "Stack 4": "Stack 4",
    "Pantrokrator": "Pantrokrator"
}
const P2 = {
    "611": "611",
}
const P3 = {
    "Hello World": "Hello World",
    "1st Patch Set": "1st Patch Set",
    "2nd Patch Set": "2nd Patch Set",
    "3rd Patch Set": "3rd Patch Set",
    "4th Patch Set": "4th Patch Set",
    "Critical Error": "Critical Error",
}
const P4 = {
    "Protean 1": "Protean 1",
    "Stack 1__1": "Stack 1",
    "Protean 2": "Protean 2",
    "Stack 2__1": "Stack 2",
    "Protean 3": "Protean 3",
    "Stack 3__1": "Stack 3",
    "Blue Screen": "Blue Screen",
}
const P5 = {
    "Delta Cast": "Delta Cast",
    "Delta Mech": "Delta Mech",
    "Sigma Cast": "Sigma Cast",
    "Sigma Mech": "Sigma Mech",
    "Omega Cast": "Omega Cast",
    "Omega Mech": "Omega Mech",
    "Blind Faith": "Blind Faith"
}
const P6 = {
    "Cosmo Memory": "Cosmo Memory",
    "Cosmo Dive 1": "Cosmo Dive 1",
    "Protean 1__1": "Protean 1",
    "Wave Cannon 1": "Wave Cannon 1",
    "Protean 2__1": "Protean 2",
    "Wave Cannon 2": "Wave Cannon 2",
    "Cosmo Dive 2": "Cosmo Dive 2",
    "Cosmo Meteor": "Cosmo Meteor",
    "Flares": "Flares",
    "Magic Number": "Magic Number 1",
    "Magic Number__1": "Magic Number 2"
}

const Roles = [
    "Tank 1",
    "Tank 2",
    "Scholar",
    "Sage",
    "White Mage",
    "Astro",
    "Melee 1",
    "Melee 2",
    "Phys Range",
    "Caster",
    "Extras"
]

async function run() {
    const ok = Object.keys
    const raw = JSON.parse(await fs.readFile("src/data/top-mitty.json"))
    const mapped = {}
    Roles.forEach(role => {
        const r = mapped[role] || {
            P1: {},
            P2: {},
            P3: {},
            P4: {},
            P5: {},
            P6: {},
        }
        const input = raw[role]
        ok(P1).filter(mech => (input[mech]?.trim()?.length || "") > 0).forEach(mech => r["P1"][P1[mech]] = input[mech])
        ok(P2).filter(mech => (input[mech]?.trim()?.length || "") > 0).forEach(mech => r["P2"][P2[mech]] = input[mech])
        ok(P3).filter(mech => (input[mech]?.trim()?.length || "") > 0).forEach(mech => r["P3"][P3[mech]] = input[mech])
        ok(P4).filter(mech => (input[mech]?.trim()?.length || "") > 0).forEach(mech => r["P4"][P4[mech]] = input[mech])
        ok(P5).filter(mech => (input[mech]?.trim()?.length || "") > 0).forEach(mech => r["P5"][P5[mech]] = input[mech])
        ok(P6).filter(mech => (input[mech]?.trim()?.length || "") > 0).forEach(mech => r["P6"][P6[mech]] = input[mech])

        mapped[role] = r
    })
    await fs.writeFile("src/data/mapped.json", JSON.stringify(mapped))
    return mapped
}


run().then(console.log).catch(console.error)