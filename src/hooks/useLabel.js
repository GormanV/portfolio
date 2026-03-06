import { useEffect, useRef } from 'react'

export function useLabel(canvasRef, region) {
  const alphaRef = useRef(1)
  const fadingRef = useRef('none')
  const displayRegionRef = useRef(region)
  const pendingRegionRef = useRef(null)

  useEffect(() => {
    pendingRegionRef.current = region
    fadingRef.current = 'out'
  }, [region])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animId
    let last = performance.now()

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = Math.floor(window.innerHeight * 0.20)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = (now) => {
      animId = requestAnimationFrame(draw)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const speed = 2.5

      if (fadingRef.current === 'out') {
        alphaRef.current -= dt * speed
        if (alphaRef.current <= 0) {
          alphaRef.current = 0
          fadingRef.current = 'in'
          displayRegionRef.current = pendingRegionRef.current
        }
      } else if (fadingRef.current === 'in') {
        alphaRef.current += dt * speed
        if (alphaRef.current >= 1) {
          alphaRef.current = 1
          fadingRef.current = 'none'
        }
      }

      const alpha = alphaRef.current
      const r = displayRegionRef.current
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (alpha <= 0 || !r) return

      const cx = canvas.width / 2
      const cy = canvas.height * 0.55
      const hex = r.color
      const rr = parseInt(hex.slice(1, 3), 16)
      const rg = parseInt(hex.slice(3, 5), 16)
      const rb = parseInt(hex.slice(5, 7), 16)
      const fontSize = Math.max(13, Math.round(canvas.width * 0.019))

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0,0,0,0.9)'
      ctx.shadowBlur = 16
      ctx.shadowOffsetY = 2
      ctx.font = `${fontSize}px 'Cinzel', serif`
      ctx.fillStyle = `rgba(${rr + 60},${rg + 40},${rb + 20},${alpha * 0.9})`
      ctx.fillText(r.name.toUpperCase(), cx, cy)

      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      const lw = Math.min(180, canvas.width * 0.12)
      const ly = cy + fontSize * 0.85
      const grad = ctx.createLinearGradient(cx - lw, ly, cx + lw, ly)
      grad.addColorStop(0, `rgba(${rr},${rg},${rb},0)`)
      grad.addColorStop(0.5, `rgba(${Math.min(255, rr + 80)},${Math.min(255, rg + 60)},${Math.min(255, rb + 30)},${alpha * 0.7})`)
      grad.addColorStop(1, `rgba(${rr},${rg},${rb},0)`)
      ctx.strokeStyle = grad
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx - lw, ly)
      ctx.lineTo(cx + lw, ly)
      ctx.stroke()

      const subSize = Math.round(fontSize * 0.55)
      ctx.font = `${subSize}px 'Share Tech Mono', monospace`
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 8
      ctx.fillStyle = `rgba(240,220,180,${alpha * 0.5})`
      ctx.fillText(r.subtitle.toUpperCase(), cx, cy + fontSize * 1.4)
      ctx.shadowBlur = 0
      ctx.shadowColor = 'transparent'
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])
}
