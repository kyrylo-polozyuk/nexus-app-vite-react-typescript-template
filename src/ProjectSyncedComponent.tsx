import type { NexusEntity } from "@audiotool/nexus/document"
import { Ticks } from "@audiotool/nexus/utils"
import { useCallback, useContext, useEffect, useState } from "react"
import { AudiotoolContext } from "./context"

const randomPosition = () => Math.floor(Math.random() * 800) + 100

type TinyGainState = { displayName: string; gain: number }

export const ProjectSyncedComponent = (props: { projectUrl: string }) => {
  const context = useContext(AudiotoolContext)
  const [config, setConfig] = useState<NexusEntity<"config"> | undefined>()
  const [tinyGains, setTinyGains] = useState<Record<string, TinyGainState>>({})

  useEffect(() => {
    if (!context.nexus) return

    context.nexus.events.onCreate("tinyGain", (tinyGain) => {
      if (context.nexus === undefined) {
        return
      }

      const displayName =
        (tinyGain.fields.displayName?.value) ?? "Tiny Gain"
      const initialGain = Number(tinyGain.fields.gain?.value ?? 1)

      setTinyGains((prev) => ({
        ...prev,
        [tinyGain.id]: { displayName, gain: initialGain },
      }))

      context.nexus.events.onUpdate(tinyGain.fields.gain, (value) => {
        const num = Number(value)
        setTinyGains((prev) => {
          const existing = prev[tinyGain.id]
          if (!existing) return prev
          return {
            ...prev,
            [tinyGain.id]: { ...existing, gain: num },
          }
        })
      })

      return () => {
        setTinyGains((prev) =>
          Object.fromEntries(
            Object.entries(prev).filter(([id]) => id !== tinyGain.id),
          ),
        )
      }
    })
  }, [context.nexus])

  useEffect(() => {
    if (!props.projectUrl || !context.nexus) return

    context.nexus.modify((t) => {
      const configEntity = t.entities.ofTypes("config").getOne()
      if (configEntity === undefined) {
        const groove = t.create("groove", {
          displayName: "Default Groove",
          durationTicks: 1920,
          impact: 0.2,
          functionIndex: 1,
        })

        setConfig(
          t.create("config", {
            tempoBpm: 120,
            baseFrequencyHz: 440,
            signatureNumerator: 4,
            signatureDenominator: 4,
            durationTicks: Ticks.Beat * 4 * 64,
            defaultGroove: groove.location,
          }),
        )
      } else {
        setConfig(configEntity)
      }
    })
  }, [context.nexus, props.projectUrl])

  const handleCreateTinyGain = useCallback(() => {
    if (!context.nexus) {
      return
    }

    context.nexus.modify((t) => {
      const positionX = randomPosition()
      const positionY = randomPosition()

      const tinyGain = t.create("tinyGain", {
        displayName: `Tiny Gain (${Object.keys(tinyGains).length + 1})`,
        positionX,
        positionY,
      })

      const mixerChannel = t.create("mixerChannel", {})

      t.create("desktopAudioCable", {
        fromSocket: tinyGain.fields.audioOutput.location,
        toSocket: mixerChannel.fields.audioInput.location,
      })
    })
  }, [context.nexus, tinyGains])

  return (
    <div className="column grow">
      <h2>Examples</h2>
      <blockquote>
        <strong>Project Info</strong>: This displays the project's bpm. The value will update if you update the bpm in the Audiotool Studio.
      </blockquote>
      <div className="row">
        <p>{`Project bpm: ${config?.fields.tempoBpm.value}`}</p>
      </div>
      <div className="column small-gap">
        <blockquote>
          <p>
            <strong>TinyGain demo:</strong> Click the button to create a TinyGain
            device and a new mixer channel, connected together.
          </p>
          <p>
            <strong>Open Studio</strong> in the top bar to open the project in
            Audiotool, then adjust the gain knob on any TinyGain.
          </p>
          <p>
            The value will update below and in the console.
          </p>
        </blockquote>
        <button className="hug primary" onClick={handleCreateTinyGain}>
          Create TinyGain
        </button>
        {Object.entries(tinyGains).map(([id, { displayName, gain }]) => (
          <p key={id}>
            {displayName}, Gain Value: <strong>{gain.toFixed(3)}</strong>
          </p>
        ))}
      </div>
    </div>
  )
}
