import type { NexusEntity } from "@audiotool/nexus/document"
import { Ticks } from "@audiotool/nexus/utils"
import { useContext, useEffect, useState } from "react"
import { AudiotoolContext } from "./context"

export const ProjectSyncedComponent = (props: {
  projectUrl: string
}) => {
  const context = useContext(AudiotoolContext)
  const [config, setConfig] = useState<NexusEntity<'config'> | undefined>()
  const [newProject, setNewProject] = useState<boolean>(false)

  useEffect(() => {
    if (props.projectUrl && context.nexus) {
      // check if config exists
      context.nexus.modify((t) => {
        const config = t.entities.ofTypes("config").getOne()
        if (config === undefined) {
          setNewProject(true)
          const groove = t.create("groove", {
            displayName: "Default Groove",
            durationTicks: 1920,
            impact: 0.2,
            functionIndex: 1,
          })

          setConfig(t.create("config", {
            tempoBpm: 120,
            baseFrequencyHz: 440,
            signatureNumerator: 4,
            signatureDenominator: 4,
            durationTicks: Ticks.Beat * 4 * 64,
            defaultGroove: groove.location,
          }))
        } else {
          setConfig(config)
          setNewProject(false)
        }
      })

    }
  }, [context.nexus, props.projectUrl])


  return (
    <div className="column grow full-width">
      <div className="row">
        <p>{newProject ? "Created" : "Opened"} a project with bpm: {config?.fields.tempoBpm.value}</p>
      </div>
    </div>
  )
}
