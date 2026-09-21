import { useCallback, useRef, useState } from 'react'

const STORAGE_KEY = 'dashboard-audio-chime'

function getStoredEnabled(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

/**
 * Custom hook quản lý âm thanh chuông báo cho Dashboard.
 * Sử dụng Web Audio API để tạo tiếng "ding" nhẹ nhàng,
 * không cần file .mp3 bên ngoài.
 */
export function useAudioChime() {
  const [isEnabled, setIsEnabled] = useState(getStoredEnabled)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    // Resume nếu bị suspended (do browser policy)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  const playChime = useCallback(() => {
    if (!isEnabled) return

    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      // ── Ding (note cao) ──
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(830, now) // ~G#5
      gain1.gain.setValueAtTime(0.3, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.6)

      // ── Dong (note thấp hơn, delay 150ms) ──
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(620, now + 0.15) // ~D#5
      gain2.gain.setValueAtTime(0, now)
      gain2.gain.setValueAtTime(0.25, now + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.15)
      osc2.stop(now + 0.9)
    } catch {
      // Fallback im lặng nếu Web Audio API không khả dụng
    }
  }, [isEnabled, getAudioContext])

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  return { playChime, isEnabled, toggleEnabled }
}
