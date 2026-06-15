import { useEffect, useRef } from "react";

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Volumetric fog/cloud shader — layered depth with gradient noise
const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform float uHue;

// Gradient noise hash — returns random 2D vector per cell
vec2 ghash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

// Perlin-style gradient noise — quintic smoothing, [0,1] output
float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(dot(ghash(i),            f),
        dot(ghash(i+vec2(1,0)),  f-vec2(1,0)), u.x),
    mix(dot(ghash(i+vec2(0,1)), f-vec2(0,1)),
        dot(ghash(i+vec2(1,1)), f-vec2(1,1)), u.x),
    u.y) * 0.5 + 0.5;
}

// FBM at fixed octave counts — rotation keeps details isotropic
float fbm7(vec2 p) {
  float v=0.0, a=0.5;
  mat2 r=mat2(0.80,0.60,-0.60,0.80);
  for(int i=0;i<7;i++){v+=a*gnoise(p);p=r*p*2.07+vec2(1.7,9.2);a*=0.50;}
  return v;
}
float fbm5(vec2 p) {
  float v=0.0, a=0.5;
  mat2 r=mat2(0.80,0.60,-0.60,0.80);
  for(int i=0;i<5;i++){v+=a*gnoise(p);p=r*p*2.07+vec2(1.7,9.2);a*=0.50;}
  return v;
}
float fbm4(vec2 p) {
  float v=0.0, a=0.5;
  mat2 r=mat2(0.80,0.60,-0.60,0.80);
  for(int i=0;i<4;i++){v+=a*gnoise(p);p=r*p*2.07+vec2(5.3,2.8);a*=0.50;}
  return v;
}

vec3 hsl2rgb(float h, float s, float l) {
  float c = (1.0 - abs(2.0*l - 1.0)) * s;
  vec3 rgb = clamp(abs(mod(h/60.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return l + c * (rgb - 0.5);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 st = uv * vec2(uRes.x / uRes.y, 1.0);
  float t  = uTime * 0.022;

  // ── Layer 1: deep background fog — slow, large scale, high octave detail
  vec2 q0 = vec2(
    fbm5(st * 1.0 + t * 0.20),
    fbm5(st * 1.0 + vec2(5.2, 1.3) + t * 0.18)
  );
  float bg = fbm7(st * 1.1 + q0 * 1.8 + t * 0.10);

  // ── Layer 2: mid-distance cloud mass — medium speed & scale
  vec2 q1 = vec2(
    fbm5(st * 1.9 + t * 0.35),
    fbm5(st * 1.9 + vec2(3.7, 8.1) + t * 0.28)
  );
  float mid = fbm5(st * 1.6 + q1 * 1.3 + t * 0.18);

  // ── Layer 3: foreground wisps — fine, fast, transparent
  float wisp = fbm4(st * 4.2 + q1 * 0.7 + t * 0.55);

  // Weighted depth composite
  float cloud = bg * 0.50 + mid * 0.35 + wisp * 0.15;

  // Height fade — denser fog at bottom, light breaks through at top
  float heightFade = smoothstep(0.0, 1.3, uv.y + bg * 0.3);

  // ── Hue-driven palette (all colours from the theme wheel)
  vec3 abyss  = hsl2rgb(uHue,        0.30, 0.028); // deepest void
  vec3 shadow = hsl2rgb(uHue + 12.0, 0.22, 0.052); // cloud shadow
  vec3 mist   = hsl2rgb(uHue +  5.0, 0.38, 0.088); // fog body
  vec3 glow   = hsl2rgb(uHue,        0.72, 0.500); // lit cloud
  vec3 copper = hsl2rgb(uHue + 22.0, 0.52, 0.380); // warm secondary

  // ── Depth compositing — each layer reveals the one beneath
  vec3 col = mix(abyss, shadow, clamp(bg * 2.8, 0.0, 1.0));
  col = mix(col, mist, clamp(mid * 2.4 - 0.3, 0.0, 1.0));

  // Cloud highlights — golden glow where clouds catch the light
  col += glow   * clamp(pow(cloud, 3.0) * 1.8, 0.0, 1.0) * heightFade * 0.36;
  col += copper * clamp(q1.y * 0.55, 0.0, 1.0) * 0.16;

  // ── Stage light from above — a soft cone from top-center
  float stageDist = length((uv - vec2(0.5, 1.1)) * vec2(1.0, 0.5));
  col += glow * smoothstep(0.9, 0.0, stageDist) * 0.09 * (0.7 + cloud * 0.5);

  // ── Wisp brightening — near wisps catch ambient light slightly
  col += mist * wisp * 0.06 * (1.0 - heightFade * 0.4);

  // ── Vignette — corner depth, open centre
  float vig = 1.0 - smoothstep(0.22, 1.20, length((uv - vec2(0.5, 0.48)) * vec2(0.95, 1.05)));
  col *= vig * 0.82 + 0.18;

  col *= 0.60;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export default function ShaderBackground({ hue = 45 }: { hue?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueRef    = useRef(hue);

  useEffect(() => { hueRef.current = hue; }, [hue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes  = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uHueL = gl.getUniformLocation(prog, "uHue");

    let raf = 0;
    const start = performance.now();

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const render = () => {
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform1f(uHueL, hueRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    render();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); gl.deleteProgram(prog); gl.deleteBuffer(buf); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", display:"block", pointerEvents:"none" }}/>
  );
}
