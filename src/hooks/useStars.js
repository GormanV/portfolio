import { useEffect } from 'react'

export function useStars(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let stars = []
    let animId

    const init = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      stars = Array.from({ length: 400 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.2,
        alpha: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
      }))
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        const a = s.alpha * (0.75 + 0.25 * Math.sin(s.twinkle + (t / 1000) * s.speed))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,230,255,${a})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }

    init()
    animId = requestAnimationFrame(draw)
    window.addEventListener('resize', init)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', init)
    }
  }, [])
}
