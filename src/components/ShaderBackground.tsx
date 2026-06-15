import { useEffect, useRef } from "react";

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Velvet Stage — warm atmospheric fog. Colors driven by uHue uniform (0–360).
const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform float uHue;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i+vec2(1,0)), f.x),
    mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p) {
  float v=0.0, a=0.5;
  mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
  for(int i=0;i<5;i++){ v+=a*noise(p); p=rot*p*2.1+vec2(1.7,9.2); a*=0.5; }
  return v;
}

// Compact HSL→RGB — hue in degrees 0-360
vec3 hsl2rgb(float h, float s, float l) {
  float c = (1.0 - abs(2.0*l - 1.0)) * s;
  vec3 rgb = clamp(abs(mod(h/60.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return l + c * (rgb - 0.5);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 st = uv * vec2(uRes.x / uRes.y, 1.0);
  float t = uTime * 0.04;

  vec2 q = vec2(fbm(st*1.8 + t*0.5), fbm(st*1.8 + vec2(5.2,1.3) + t*0.4));
  vec2 r = vec2(fbm(st*1.5 + q*1.2 + vec2(1.7,9.2) + t*0.3), fbm(st*1.5 + q*1.2 + vec2(8.3,2.8) + t*0.25));
  float f = fbm(st + r * 0.9 + t * 0.15);

  // Dynamic palette — driven by uHue
  vec3 dark   = hsl2rgb(uHue,        0.28, 0.035);  // deep bg
  vec3 mid    = hsl2rgb(uHue + 10.0, 0.35, 0.070);  // warm mid-tone
  vec3 gold   = hsl2rgb(uHue,        0.68, 0.520);  // accent bright
  vec3 copper = hsl2rgb(uHue + 22.0, 0.50, 0.400);  // secondary accent

  vec3 col = mix(dark, mid, clamp(f * 2.2, 0.0, 1.0));
  col = mix(col, gold * 0.5, clamp(pow(f, 3.0) * 1.4, 0.0, 1.0));
  col = mix(col, copper * 0.3, clamp(q.y * 0.6, 0.0, 1.0));

  // Warm top glow
  float topGlow = smoothstep(0.55, 1.0, uv.y) * 0.12;
  col += gold * topGlow;

  // Radial vignette
  float vig = 1.0 - smoothstep(0.30, 1.10, length(uv - vec2(0.5, 0.55)));
  col *= vig * 0.88 + 0.12;

  // Center bloom
  float bloom = 1.0 - smoothstep(0.0, 0.65, length(uv - vec2(0.5, 0.58)));
  col += gold * bloom * 0.07;

  col *= 0.55;

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

  // Keep hueRef current without restarting the WebGL context
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
  }, []); // only runs once — hue is read via ref

  return (
    <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", display:"block", pointerEvents:"none" }}/>
  );
}
