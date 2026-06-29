export async function captureVideoThumbnail(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    let settled = false

    const done = (result: string | null) => {
      if (settled) return
      settled = true
      URL.revokeObjectURL(url)
      resolve(result)
    }

    const capture = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 320
      canvas.height = 180
      const ctx = canvas.getContext('2d')
      if (!ctx) { done(null); return }

      // Center-crop to 16:9
      const vw = video.videoWidth
      const vh = video.videoHeight
      if (!vw || !vh) { done(null); return }
      const vAspect = vw / vh
      const cAspect = 320 / 180
      let sx = 0, sy = 0, sw = vw, sh = vh
      if (vAspect > cAspect) { sw = vh * cAspect; sx = (vw - sw) / 2 }
      else { sh = vw / cAspect; sy = (vh - sh) / 2 }

      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 320, 180)
      done(canvas.toDataURL('image/jpeg', 0.75))
    }

    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      video.currentTime = video.duration > 4 ? 4 : video.duration / 2
    }
    video.onseeked = capture
    video.onerror = () => done(null)

    // Fallback: give up after 8s
    setTimeout(() => done(null), 8000)

    video.src = url
  })
}
