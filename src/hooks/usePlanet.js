import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { PAGES, REGIONS } from '../data/regions'
import { VERTEX_SHADER, FRAGMENT_SHADER } from '../data/shaders'

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
      vertexShader: `varying vec3 vNormal;varying vec3 vPos;void main(){vNormal=normalize(normalMatrix*normal);vPos=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `uniform vec3 sunDir;varying vec3 vNormal;varying vec3 vPos;void main(){vec3 viewDir=normalize(cameraPosition-vPos);float rim=1.0-max(dot(viewDir,vNormal),0.0);rim=pow(rim,3.5);float sunSide=dot(vNormal,sunDir)*0.5+0.5;vec3 atmColor=mix(vec3(0.55,0.28,0.08),vec3(0.15,0.35,0.65),1.0-sunSide);gl_FragColor=vec4(atmColor,rim*0.65);}`,
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
      vertexShader: `varying vec3 vNormal;varying vec3 vPos;void main(){vNormal=normalize(normalMatrix*normal);vPos=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `uniform vec3 sunDir;varying vec3 vNormal;varying vec3 vPos;void main(){vec3 viewDir=normalize(cameraPosition-vPos);float rim=1.0-max(dot(viewDir,vNormal),0.0);rim=pow(rim,6.0);float sunny=smoothstep(-0.2,0.5,dot(vNormal,sunDir));gl_FragColor=vec4(vec3(0.9,0.55,0.2),rim*sunny*0.35);}`,
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

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const dt = clock.getDelta()
      const elapsed = clock.getElapsedTime()

      const { x, y, tx, ty } = rotRef.current
      const speed = 1.8
      let newX = x + (tx - x) * dt * speed
      let dY = ty - y
      while (dY > Math.PI) dY -= Math.PI * 2
      while (dY < -Math.PI) dY += Math.PI * 2
      let newY = y + dY * dt * speed
      rotRef.current = { x: newX, y: newY, tx, ty }

      planetGroup.rotation.x = newX
      planetGroup.rotation.y = newY + elapsed * 0.012

      const fm = featureMixRef.current
      fm.cur += (fm.target - fm.cur) * Math.min(dt * 4, 1)
      mat.uniforms.time.value = elapsed
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
