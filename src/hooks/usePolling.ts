import { useEffect, useRef, useState, useCallback } from 'react'

interface UsePollingResult<T> {
  data: T | null
  isPolling: boolean
  error: Error | null
  stop: () => void
}

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  isTerminal: (data: T) => boolean,
  intervalMs: number = 3000
): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stoppedRef = useRef(false)
  const retriesRef = useRef(0)
  const MAX_RETRIES = 3

  const stop = useCallback(() => {
    stoppedRef.current = true
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPolling(false)
  }, [])

  const poll = useCallback(async () => {
    if (stoppedRef.current) return

    try {
      const result = await fetchFn()
      retriesRef.current = 0
      setData(result)
      setError(null)

      if (isTerminal(result)) {
        stop()
        return
      }
    } catch (e) {
      retriesRef.current += 1
      if (retriesRef.current >= MAX_RETRIES) {
        setError(e instanceof Error ? e : new Error('Polling failed'))
        setIsPolling(false)
        return
      }
    }

    if (!stoppedRef.current) {
      timerRef.current = setTimeout(poll, intervalMs)
    }
  }, [fetchFn, isTerminal, intervalMs, stop])

  const start = useCallback(() => {
    stoppedRef.current = false
    retriesRef.current = 0
    setIsPolling(true)
    poll()
  }, [poll])

  useEffect(() => {
    start()
    return () => {
      stoppedRef.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [start])

  return { data, isPolling, error, stop }
}
