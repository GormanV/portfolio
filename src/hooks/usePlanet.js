import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { PAGES, REGIONS } from '../data/regions'
import { VERTEX_SHADER, FRAGMENT_SHADER, SPHERE_RIM_VERTEX_SHADER, ATMOSPHERE_FRAGMENT_SHADER, HAZE_FRAGMENT_SHADER } from '../data/shaders'

export function usePlanet(planetCanvasRef) {
  const threeRef = useRef({})
  const rotRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const featureMixRef = useRef({ cur: 0, target: 1 })

  useEffect(() => {
    const canvas = planetCanvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0, 4.5)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const planetGroup = new THREE.Group()
    planetGroup.position.y = -3.1
    scene.add(planetGroup)

    // Planet surface
    const geo = new THREE.SphereGeometry(2.2, 128, 128)
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time:       { value: 0 },
        sunDir:     { value: new THREE.Vector3(-1, 0.4, 1).normalize() },
        featureMix: { value: 0 },
        pageId:     { value: 0 },
        featureU:   { value: 0.5 },
        featureV:   { value: 0.5 - 20 / 180 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    })
    const planetMesh = new THREE.Mesh(geo, mat)
    planetGroup.add(planetMesh)

    // Atmosphere glow
    const atmGeo = new THREE.SphereGeometry(2.35, 64, 64)
    const atmMat = new THREE.ShaderMaterial({
      uniforms: { sunDir: { value: new THREE.Vector3(-1, 0.4, 1).normalize() } },
      vertexShader: SPHERE_RIM_VERTEX_SHADER,
      fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    })
    planetGroup.add(new THREE.Mesh(atmGeo, atmMat))

    // Dust haze
    const hazeGeo = new THREE.SphereGeometry(2.25, 64, 64)
    const hazeMat = new THREE.ShaderMaterial({
      uniforms: { sunDir: { value: new THREE.Vector3(-1, 0.4, 1).normalize() } },
      vertexShader: SPHERE_RIM_VERTEX_SHADER,
      fragmentShader: HAZE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
    })
    planetGroup.add(new THREE.Mesh(hazeGeo, hazeMat))

    // Lights
    const sun = new THREE.DirectionalLight(0xffe8c0, 1.4)
    sun.position.set(-3, 1.2, 3)
    scene.add(sun)
    scene.add(new THREE.AmbientLight(0x0a0820, 0.8))
    const fill = new THREE.DirectionalLight(0x1a3a8f, 0.2)
    fill.position.set(3, -1, -3)
    scene.add(fill)

    threeRef.current = { scene, camera, renderer, planetMesh, planetGroup }

    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let animId
    let accumTime = 0

    const animate = () => {
      animId = requestAnimationFrame(animate)
      // Cap dt so tabbing away and back doesn't cause a huge time jump / spin
      const dt = Math.min(clock.getDelta(), 0.05)
      accumTime += dt

      const { x, y, tx, ty } = rotRef.current
      const speed = 1.8
      let newX = x + (tx - x) * dt * speed
      let dY = ty - y
      while (dY > Math.PI) dY -= Math.PI * 2
      while (dY < -Math.PI) dY += Math.PI * 2
      let newY = y + dY * dt * speed
      rotRef.current = { x: newX, y: newY, tx, ty }

      planetGroup.rotation.x = newX
      // Slow idle auto-rotation via accumTime (pauses naturally when tab is hidden)
      planetGroup.rotation.y = newY + accumTime * 0.012

      const fm = featureMixRef.current
      fm.cur += (fm.target - fm.cur) * Math.min(dt * 4, 1)
      mat.uniforms.time.value = accumTime
      mat.uniforms.featureMix.value = fm.cur

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [])

  const navigatePlanet = useCallback((newPage) => {
    const region = REGIONS[newPage]
    const latRad = region.lat * Math.PI / 180
    const lonRad = region.lon * Math.PI / 180
    rotRef.current.tx = -latRad
    rotRef.current.ty = lonRad
    featureMixRef.current.target = 0

    setTimeout(() => {
      featureMixRef.current.target = 1
      const { planetMesh } = threeRef.current
      if (planetMesh) {
        planetMesh.material.uniforms.pageId.value = PAGES.indexOf(newPage)
        const lon = region.lon < 0 ? region.lon + 360 : region.lon
        planetMesh.material.uniforms.featureU.value = lon / 360
        planetMesh.material.uniforms.featureV.value = 0.5 - region.lat / 180
      }
    }, 450)
  }, [])

  return { navigatePlanet }
}
