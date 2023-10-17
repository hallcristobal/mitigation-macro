import { useEffect, useMemo, useState } from 'react'
import { Col, Container, Form, InputGroup } from 'react-bootstrap'

type SplitTypes = "none" | "lines" | "phase"
const PHASE_SEPERATOR = "{{==PHASE==}}"

const MacroTextArea = ({ value, split }: { value: string, split?: SplitTypes }) => {
  const box = (v: string, rows: number, id?: string) => (
    <Form.Control
      key={`${id ? id : ""}`}
      as="textarea"
      value={v}
      rows={rows}
      readOnly />
  )

  const lines = value.split("\n")
  const lineCount = lines.length
  if (split === "lines") {
    const macros = Math.ceil(lineCount / 15)
    const elements = []
    for (let macro = 0; macro < macros; macro++) {
      let v = lines.splice(0, 15).join("\n").trim()
      elements.push(box(v, v.split("\n").length, `macro_${macro}`))
    }
    return (<>{elements}</>)
  }
  if (split === "phase") {
    const elements = []
    let currentPhase = ""
    let phaseLines: string[] = []
    for (let i = 0; i < lineCount; i++) {
      const line = lines[i]
      if (line.startsWith(PHASE_SEPERATOR)) {
        const phase = line.replace(PHASE_SEPERATOR, "").trim()
        if (currentPhase !== "" && phase !== currentPhase) {
          phaseLines = phaseLines.filter(l => l.trim().length > 0)
          elements.push(box(phaseLines.join("\n").trim(), phaseLines.length, `macro_${currentPhase}`))
        }
        currentPhase = phase
        phaseLines = []
        continue
      }
      phaseLines.push(line)
    }
    if (phaseLines.length > 0) {
      elements.push(box(phaseLines.join("\n").trim(), phaseLines.length, `macro_${currentPhase}`))
    }
    return (<>{elements}</>)
  }
  return (box(value, lineCount))
}

const MIT_SHEET_MAP = {
  "": "",
  "Breadmines": "/data/breadmines.json",
  "Top MITty": "/data/mapped.json",
}

type MitSheet = {
  [Role: string]: {
    [Phase: string]: {
      [Mechanic: string]: string
    }
  }
}

function App() {
  const [mit, setMit] = useState<MitSheet>({});
  const [roles, setRoles] = useState<string[]>([])
  const [selectedMitSheet, setSelectedMitSheet] = useState<keyof typeof MIT_SHEET_MAP | undefined>()
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [unifiedMacro, setUnifiedMacro] = useState<boolean>(false)
  const [noSpaces, setNoSpaces] = useState<boolean>(false)
  const [splitSelection, setSplitSelection] = useState<SplitTypes>('none')

  useEffect(() => {
    if (selectedMitSheet === undefined) return

    fetch(MIT_SHEET_MAP[selectedMitSheet], {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(res => res.json())
      .then(json => {
        setRoles(() => Object.keys(json))
        setMit(json)
        setSelectedRole(Object.keys(json).sort()[0])
      })
  }, [selectedMitSheet])

  const shown = useMemo(() => {
    return JSON.stringify(mit[selectedRole], null, 2)
  }, [selectedRole, mit])

  const macro = useMemo(() => {
    if (Object.keys(mit).length === 0) return "";
    const role_mit = mit[selectedRole] as Record<string, any>
    const mac = Object.keys(role_mit).map(phase => {
      const splitMitAndAnnotation = (text: string) => {
        if (text.includes("\n")) {
          const [mitigation, ...annotations] = text.split("\n")
          return `${mitigation} ${annotations.map(a => `(${a})`).join(" ")}`
        }
        return text
      }

      let mechs = Object.keys(role_mit[phase])
      if (mechs.length === 0) return undefined
      if (unifiedMacro) {
        return [`${splitSelection === "phase" ? `${PHASE_SEPERATOR}${phase}\n` : ""}`].concat(mechs.map(mech => {
          return `/e ${phase}: ${mech} - ${splitMitAndAnnotation(role_mit[phase][mech])}\n`
        })).join("")
      }

      let r = `${splitSelection === "phase" ? `${PHASE_SEPERATOR}${phase}\n` : ""}`;
      r += `/e ${phase}:`
      if (mechs.length > 1) {
        mechs.forEach(mech => {
          r += `\n/e    ${mech} - ${splitMitAndAnnotation(role_mit[phase][mech])}`
        })
      } else {
        r += ` ${mechs[0]} - ${splitMitAndAnnotation(role_mit[phase][mechs[0]])}`
      }
      return r
    }).filter(x => !!x).join(unifiedMacro ? "" : noSpaces ? "\n" : "\n\n").trim()
    return mac
  }, [selectedRole, unifiedMacro, noSpaces, splitSelection, mit])

  return (
    <Container>
      <Col xl>
        <h1 className='mt-3'>{selectedMitSheet ?? "Select a Sheet:"}</h1>
        <Col xl={4}>
          <InputGroup className='mb-3'>
            <Form.Select value={selectedMitSheet} onChange={(e) => setSelectedMitSheet(() => (e.target.value as any))}>
              {Object.keys(MIT_SHEET_MAP).map((key, i) => <option key={`${key}_${i}`} value={key}>{key}</option>)}
            </Form.Select>
          </InputGroup>
        </Col>
        <hr />
        <InputGroup className='mb-3'>
          <InputGroup.Text>Role:</InputGroup.Text>
          <Form.Select id="roleSelect" value={selectedRole} onChange={(e) => setSelectedRole(() => (e.target.value as any))}>
            {roles.sort().map((r, i) => <option key={`${r}_${i}`}>{r}</option>)}
          </Form.Select>
        </InputGroup>
        <Form.Check type="switch" checked={!noSpaces} disabled={unifiedMacro} onChange={(e) => setNoSpaces(() => !e.target.checked)} label="Blank Lines?" />
        <Form.Check className='mb-3' type="switch" checked={unifiedMacro} onChange={(e) => setUnifiedMacro(() => e.target.checked)} label="Unified Macro?" />
        <fieldset className='mb-3'>
          <Form.Label>Split Macro:</Form.Label>
          <Form.Check type="radio" checked={splitSelection === "none"} onChange={(e) => setSplitSelection(() => "none")} label="None" />
          <Form.Check type="radio" checked={splitSelection === "lines"} onChange={(e) => setSplitSelection(() => "lines")} label="Every 15 Lines" />
          <Form.Check type="radio" checked={splitSelection === "phase"} onChange={(e) => setSplitSelection(() => "phase")} label="By Phase" />
        </fieldset>
        <div>
          <MacroTextArea value={macro} split={splitSelection} />
        </div>
        <hr />
        <p>Lines: {macro.split("\n").filter(l => l !== PHASE_SEPERATOR).length}</p>
        <hr />
        <p>Raw Data:</p>
        <pre><code>{
          shown
        }</code></pre>
      </Col>
    </Container>
  )
}

export default App
