interface CaptureResult {
  thumbnailUrl: string | null
  duration: number | null
}

export async function captureVideoThumbnail(file: File): Promise<CaptureResult> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    let settled = false

    const done = (result: CaptureResult) => {
      if (settled) return
      settled = true
      URL.revokeObjectURL(url)
      resolve(result)
    }

    const capture = () => {
      const duration = isFinite(video.duration) && video.duration > 0 ? video.duration : null

      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 360
      const ctx = canvas.getContext('2d')
      if (!ctx) { done({ thumbnailUrl: null, duration }); return }

      const vw = video.videoWidth
      const vh = video.videoHeight
      if (!vw || !vh) { done({ thumbnailUrl: null, duration }); return }

      // Center-crop to 16:9
      const vAspect = vw / vh
      const cAspect = 640 / 360
      let sx = 0, sy = 0, sw = vw, sh = vh
      if (vAspect > cAspect) { sw = vh * cAspect; sx = (vw - sw) / 2 }
      else { sh = vw / cAspect; sy = (vh - sh) / 2 }

      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 640, 360)
      done({ thumbnailUrl: canvas.toDataURL('image/jpeg', 0.8), duration })
    }

    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      video.currentTime = video.duration > 4 ? 4 : video.duration / 2
    }
    video.onseeked = capture
    video.onerror = () => done({ thumbnailUrl: null, duration: null })

    setTimeout(() => done({ thumbnailUrl: null, duration: null }), 8000)

    video.src = url
  })
}
