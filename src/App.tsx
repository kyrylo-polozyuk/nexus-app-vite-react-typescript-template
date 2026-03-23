import { type AudiotoolClient, type SyncedDocument } from "@audiotool/nexus"
import { useEffect, useState } from "react"
import { AudiotoolContext } from "./context"
import { DialogProvider } from "./dialog/DialogContext"
import { ErrorBoundary } from "./ErrorBoundary"
import { ErrorHandler } from "./ErrorHandler"
import { useAuth } from "./hooks/useAuth"
import { LoginScreen } from "./LoginScreen"
import { ProjectSelector } from "./project-selector/ProjectSelector"
import { ProjectSyncedComponent } from "./ProjectSyncedComponent"
import {
  AUDIOTOOL_STUDIO_BASE,
  extractProjectId,
  openAudiotoolInWindow,
} from "./url-utils"

export const App = () => {
  const { loginStatus, authStatus, loading, authError } = useAuth()

  const [client, setClient] = useState<AudiotoolClient | undefined>(undefined)
  const [syncedDocument, setSyncedDocument] = useState<
    SyncedDocument | undefined
  >(undefined)
  const [projectUrl, setProjectUrl] = useState<string>("")

  // Read projectUrl from URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlParam = params.get("projectUrl")
    if (urlParam) {
      setProjectUrl(urlParam)
    }
  }, [])

  const handleLogout = async () => {
    if (loginStatus?.loggedIn !== true) {
      return
    }

    // Clear client and nexus connections
    setSyncedDocument(undefined)
    setClient(undefined)

    // Clear project URL
    setProjectUrl("")

    // Clear URL parameters
    window.history.replaceState({}, "", window.location.pathname)

    loginStatus?.logout()
  }

  const handleProjectConnected = async (
    client: AudiotoolClient,
    newDocument: SyncedDocument,
    projectUrl: string,
  ) => {
    setClient(client)
    setSyncedDocument(newDocument)
    setProjectUrl(projectUrl)
  }

  const getAppContents = (): React.ReactNode => {
    // Don't show project connection if not logged in (LoginScreen handles that)
    if (authStatus !== "logged-in") {
      return null
    }

    // Show project connection screen if authenticated but not connected
    if (syncedDocument === undefined) {
      return (
        <ProjectSelector
          loginStatus={loginStatus}
          onProjectConnected={handleProjectConnected}
          projectUrl={projectUrl}
          onProjectUrlChange={setProjectUrl}
        />
      )
    }

    // connected to a project, start the generator
    return (
      <ProjectSyncedComponent projectUrl={projectUrl} />
    )
  }

  return (
    <DialogProvider>
      <ErrorHandler />
      <ErrorBoundary>
        <AudiotoolContext.Provider value={{ client, nexus: syncedDocument }}>
          <div className="column full-height app-container">
            <div className="row full-width top-bar">
              <div className="title-container">
                <p className="title">Nexus App</p>
              </div>
              {authStatus === "logged-in" && (
                <div className="user-info">
                  {syncedDocument && client && projectUrl && (
                    <>
                      <button
                        className="hug"
                        onClick={async () => {
                          const params = new URLSearchParams(
                            window.location.search,
                          )
                          params.delete("projectUrl")
                          window.history.replaceState(
                            {},
                            "",
                            `${window.location.pathname}?${params.toString()}`,
                          )
                          if (syncedDocument !== undefined) {
                            await syncedDocument.stop()
                          }
                          setClient(undefined)
                          setSyncedDocument(undefined)
                        }}
                      >
                        <span className="material-symbols-outlined">
                          arrow_back
                        </span>
                        <span>Change Project</span>
                      </button>
                      <button
                        className="hug"
                        onClick={() => {
                          const projectId = extractProjectId(projectUrl)
                          openAudiotoolInWindow(
                            `${AUDIOTOOL_STUDIO_BASE}${projectId}`,
                          )
                        }}
                      >
                        <span className="material-symbols-outlined">
                          play_arrow
                        </span>
                        <span>Open Studio</span>
                      </button>
                    </>
                  )}
                  <button className="hug" onClick={handleLogout}>
                    <span className="material-symbols-outlined">logout</span>
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
            <div className="column grow full-width">
              <LoginScreen
                loginStatus={loginStatus}
                authStatus={authStatus}
                loading={loading}
                authError={authError}
              />
              {getAppContents()}
            </div>
          </div>
        </AudiotoolContext.Provider>
      </ErrorBoundary>
    </DialogProvider>
  )
}
