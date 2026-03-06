// Shared vertex shader for atmosphere and haze layers
export const SPHERE_RIM_VERTEX_SHADER = `
varying vec3 vNormal;
varying vec3 vPos;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Atmosphere glow: warm-to-cool colour based on sun side, rim-lit
export const ATMOSPHERE_FRAGMENT_SHADER = `
uniform vec3 sunDir;
varying vec3 vNormal;
varying vec3 vPos;
void main() {
  vec3 viewDir = normalize(cameraPosition - vPos);
  float rim = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.5);
  float sunSide = dot(vNormal, sunDir) * 0.5 + 0.5;
  vec3 atmColor = mix(vec3(0.55, 0.28, 0.08), vec3(0.15, 0.35, 0.65), 1.0 - sunSide);
  gl_FragColor = vec4(atmColor, rim * 0.65);
}
`

// Dust haze: warm orange rim glow on the sun-facing limb
export const HAZE_FRAGMENT_SHADER = `
uniform vec3 sunDir;
varying vec3 vNormal;
varying vec3 vPos;
void main() {
  vec3 viewDir = normalize(cameraPosition - vPos);
  float rim = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 6.0);
  float sunny = smoothstep(-0.2, 0.5, dot(vNormal, sunDir));
  gl_FragColor = vec4(vec3(0.9, 0.55, 0.2), rim * sunny * 0.35);
}
`

export const VERTEX_SHADER = `
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const FRAGMENT_SHADER = `
precision mediump float;
uniform float time;
uniform vec3 sunDir;
uniform float featureMix;
uniform float pageId;
uniform float featureU;
uniform float featureV;
varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  for(int i=0;i<6;i++){v+=a*noise(p);p*=2.1;a*=0.5;}
  return v;
}

// Ridged turbulence — creates sharp cliff and canyon lines
float ridgedFbm(vec2 p){
  float v=0.0,a=0.5;
  for(int i=0;i<5;i++){
    float n=1.0-abs(noise(p)*2.0-1.0);
    v+=a*n*n;
    p*=2.1;a*=0.45;
  }
  return v;
}

vec2 lc(vec2 uv){
  float du=uv.x-featureU;
  if(du>0.5)du-=1.0;
  if(du<-0.5)du+=1.0;
  float dv=uv.y-featureV;
  float cosLat=cos((featureV-0.5)*3.14159);
  return vec2(du*cosLat,dv)*3.0;
}

float featureHome(vec2 c){
  float d=length(c);
  float ripple=(sin((d-time*0.003)*200.0)*0.5+0.5)*smoothstep(0.22,0.01,d)*smoothstep(0.0,0.025,d);
  float angle=atan(c.y,c.x);
  float spokes=smoothstep(0.03,0.0,abs(sin(angle*6.0)))*smoothstep(0.20,0.06,d)*smoothstep(0.015,0.05,d);
  return (ripple*0.45+spokes*0.25)*smoothstep(0.24,0.04,d);
}

float featureAbout(vec2 c){
  float d=length(c);
  float mask=smoothstep(0.13,0.01,d);
  vec2 g=fract(c*280.0);
  float streets=clamp(smoothstep(0.86,0.97,g.x)+smoothstep(0.86,0.97,g.y),0.0,1.0);
  vec2 bg=fract(c*52.0);
  float blvd=clamp(smoothstep(0.90,1.0,bg.x)+smoothstep(0.90,1.0,bg.y),0.0,1.0);
  float palace=smoothstep(0.012,0.002,d);
  float wall=smoothstep(0.003,0.0,abs(d-0.055))*mask;
  return (streets*0.45+blvd*0.4+palace+wall*0.45)*mask;
}

float featureSkills(vec2 c){
  float d=length(c);
  float mask=smoothstep(0.20,0.01,d);
  float feat=0.0;
  vec2 dir0=normalize(vec2(cos(0.35),sin(0.35)));vec2 p0=vec2(-dir0.y,dir0.x);float al0=dot(c,dir0);float ac0=dot(c,p0)+sin(al0*55.0)*0.006-0.018;
  feat+=smoothstep(0.005,0.0,abs(ac0))*smoothstep(0.15,0.02,abs(al0))*0.7+smoothstep(0.013,0.007,abs(abs(ac0)-0.010))*smoothstep(0.15,0.02,abs(al0))*0.35;
  vec2 dir1=normalize(vec2(cos(1.60),sin(1.60)));vec2 p1=vec2(-dir1.y,dir1.x);float al1=dot(c,dir1);float ac1=dot(c,p1)+sin(al1*55.0)*0.006;
  feat+=smoothstep(0.005,0.0,abs(ac1))*smoothstep(0.15,0.02,abs(al1))*0.7+smoothstep(0.013,0.007,abs(abs(ac1)-0.010))*smoothstep(0.15,0.02,abs(al1))*0.35;
  vec2 dir2=normalize(vec2(cos(2.85),sin(2.85)));vec2 p2=vec2(-dir2.y,dir2.x);float al2=dot(c,dir2);float ac2=dot(c,p2)+sin(al2*55.0)*0.006+0.018;
  feat+=smoothstep(0.005,0.0,abs(ac2))*smoothstep(0.15,0.02,abs(al2))*0.7+smoothstep(0.013,0.007,abs(abs(ac2)-0.010))*smoothstep(0.15,0.02,abs(al2))*0.35;
  feat+=smoothstep(0.035,0.0,length(c-vec2(0.05,-0.04)))*0.6;
  return feat*mask;
}

float featureExperience(vec2 c){
  float d=length(c);
  float mask=smoothstep(0.15,0.01,d);
  float feat=0.0;
  float ridgeY=noise(vec2(c.x*30.0,1.5))*0.008-0.004;
  feat+=smoothstep(0.004,0.0,abs(c.y-ridgeY))*0.6;
  feat-=smoothstep(0.0,0.025,c.y-ridgeY)*smoothstep(0.04,0.0,c.y-ridgeY)*0.4;
  float cd0=length((c-vec2(-0.056,0.002))/vec2(1.0,0.65));feat-=smoothstep(0.017,0.004,cd0)*0.6;feat+=smoothstep(0.024,0.017,cd0)*(1.0-smoothstep(0.017,0.004,cd0))*0.5;
  float cd1=length((c-vec2(-0.018,0.006))/vec2(1.0,0.65));feat-=smoothstep(0.017,0.004,cd1)*0.6;feat+=smoothstep(0.024,0.017,cd1)*(1.0-smoothstep(0.017,0.004,cd1))*0.5;
  float cd2=length((c-vec2( 0.020,0.001))/vec2(1.0,0.65));feat-=smoothstep(0.017,0.004,cd2)*0.6;feat+=smoothstep(0.024,0.017,cd2)*(1.0-smoothstep(0.017,0.004,cd2))*0.5;
  float cd3=length((c-vec2( 0.058,0.004))/vec2(1.0,0.65));feat-=smoothstep(0.017,0.004,cd3)*0.6;feat+=smoothstep(0.024,0.017,cd3)*(1.0-smoothstep(0.017,0.004,cd3))*0.5;
  return feat*mask;
}

float featureBeyond(vec2 c){
  float d=length(c);
  float mask=smoothstep(0.18,0.01,d);
  vec2 cp=c*115.0;
  vec2 dv=cp+vec2(fbm(cp*0.5)*2.0,fbm(cp*0.5+vec2(5.2,1.3))*2.0);
  vec2 cell=fract(dv)-0.5;
  float crev=1.0-smoothstep(0.0,0.08,min(abs(cell.x),abs(cell.y)));
  return (mask*0.28-crev*mask*0.45+hash(floor(dv))*mask*0.12);
}

float featureContact(vec2 c){
  float d=length(c);
  float mask=smoothstep(0.16,0.01,d);
  float wn=fbm(vec2(c.y*40.0,0.5))*0.010;
  float wall=smoothstep(0.004,0.0,abs(c.x-wn));
  float shad=smoothstep(0.0,0.04,c.x-wn)*smoothstep(0.055,0.0,c.x-wn);
  float pass=smoothstep(0.011,0.003,abs(c.y))*smoothstep(0.003,0.009,abs(c.x));
  return (wall*0.75-shad*0.35+pass*0.5+(sin(c.y*380.0)*0.5+0.5)*wall*0.18)*mask;
}

void main(){
  float n1=fbm(vUv*4.0+vec2(0.3,0.1));
  float n2=fbm(vUv*8.0+vec2(time*0.005,0.2));
  float n3=fbm(vUv*16.0+vec2(0.5,time*0.003));
  float terrain=n1*0.55+n2*0.3+n3*0.15;

  // ── Bump normal from finite differences on the primary terrain layer ──
  // Sampling offsets in UV space; multiply by terrain frequency (4.0) implicitly
  float eps=0.003;
  float bR=fbm((vUv+vec2(eps,0.0))*4.0+vec2(0.3,0.1));
  float bU=fbm((vUv+vec2(0.0,eps))*4.0+vec2(0.3,0.1));
  // Build orthonormal tangent frame from the sphere geometric normal
  vec3 upVec=abs(vNormal.y)<0.99?vec3(0.0,1.0,0.0):vec3(1.0,0.0,0.0);
  vec3 T=normalize(cross(upVec,vNormal));
  vec3 B=normalize(cross(vNormal,T));
  // Perturb normal by height gradient; scale 7.0 gives subtle-but-visible relief
  vec3 bumpNorm=normalize(vNormal+(T*(n1-bR)+B*(n1-bU))*7.0);

  // ── Ridged turbulence — cliffs, escarpments, canyon rims ──
  float ridges=ridgedFbm(vUv*5.5+vec2(1.7,3.2));
  // Second layer of smaller ridges for fine eroded texture
  float ridgesSmall=ridgedFbm(vUv*11.0+vec2(4.1,0.9))*0.5;

  // ── Fine surface grain ──
  float grain=noise(vUv*72.0+vec2(0.4,0.8))*2.0-1.0;

  // ── Base colour (palette unchanged) ──
  vec3 col1=vec3(0.55,0.22,0.05);vec3 col2=vec3(0.78,0.42,0.10);vec3 col3=vec3(0.88,0.65,0.25);vec3 col4=vec3(0.42,0.15,0.03);
  vec3 baseCol=mix(col1,col2,smoothstep(0.2,0.5,terrain));
  baseCol=mix(baseCol,col3,smoothstep(0.5,0.75,terrain));
  baseCol=mix(baseCol,col4,smoothstep(0.75,1.0,terrain));
  baseCol=mix(baseCol,vec3(0.75,0.65,0.55),smoothstep(0.78,0.95,abs(vUv.y-0.5)*2.0)*0.5);
  baseCol+=vec3(0.0,0.08,0.12)*smoothstep(0.35,0.45,n1)*(1.0-smoothstep(0.45,0.55,n1))*fbm(vUv*20.0)*1.5;

  // ── Surface detail overlays ──
  // Ridge crests: warm bright highlight at the top of each ridge
  baseCol+=vec3(0.12,0.07,0.02)*ridges*0.28;
  // Smaller ridges: tighten detail and add slight darkening in troughs
  baseCol-=vec3(0.06,0.03,0.01)*(1.0-ridgesSmall)*0.12;
  // Fine grain: subtle albedo variation across the whole surface
  baseCol+=vec3(0.04,0.02,0.005)*grain*0.55;

  // ── Region feature overlay (unchanged logic) ──
  vec2 c=lc(vUv);
  float feat=featureHome(c)*(1.0-smoothstep(0.49,0.51,abs(pageId-0.0)))
            +featureAbout(c)*(1.0-smoothstep(0.49,0.51,abs(pageId-1.0)))
            +featureSkills(c)*(1.0-smoothstep(0.49,0.51,abs(pageId-2.0)))
            +featureExperience(c)*(1.0-smoothstep(0.49,0.51,abs(pageId-3.0)))
            +featureBeyond(c)*(1.0-smoothstep(0.49,0.51,abs(pageId-4.0)))
            +featureContact(c)*(1.0-smoothstep(0.49,0.51,abs(pageId-5.0)));
  vec3 featCol=mix(baseCol*0.35,baseCol*1.9+vec3(0.10,0.05,0.0),clamp(feat*0.5+0.5,0.0,1.0));
  baseCol=mix(baseCol,featCol,clamp(abs(feat)*featureMix,0.0,0.88));

  // ── Lighting — use bump normal so terrain relief casts directional shading ──
  float diff=max(dot(bumpNorm,sunDir),0.0);
  baseCol*=(0.12+diff*0.88)*(0.3+0.7*smoothstep(-0.05,0.15,dot(bumpNorm,sunDir)));
  gl_FragColor=vec4(baseCol,1.0);
}
`
