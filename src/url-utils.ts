export const AUDIOTOOL_STUDIO_BASE =
  "https://beta.audiotool.com/studio?project="

/** Opens an Audiotool URL in a smaller popup window instead of a new tab */
export const openAudiotoolInWindow = (url: string): void => {
  const width = Math.round(window.innerWidth * 0.85)
  const height = Math.round(window.innerHeight * 0.85)
  const left = Math.round((window.innerWidth - width) / 2)
  const top = Math.round((window.innerHeight - height) / 2)
  const features = `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
  window.open(url, "_blank", features)
}

/** Extracts project ID from https://beta.audiotool.com/studio?project=ID or a bare ID */
export const extractProjectId = (projectUrl: string): string => {
  try {
    const project = new URL(projectUrl).searchParams.get("project")
    return project ?? projectUrl.trim()
  } catch {
    return projectUrl.trim()
  }
}
