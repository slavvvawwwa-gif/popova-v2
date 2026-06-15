import { useEffect, useRef } from "react";

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Dark flow-field shader — ink bleeding in water, site palette #080808 / #d6303c
const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),             hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p  = rot * p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  // account for aspect
  vec2 st = uv * vec2(uRes.x / uRes.y, 1.0);

  float t = uTime * 0.055;

  // two-layer flow warp
  vec2 q = vec2(
    fbm(st * 2.2 + vec2(0.0, 0.0) + t * 0.4),
    fbm(st * 2.2 + vec2(5.2, 1.3) + t * 0.35)
  );
  vec2 r = vec2(
    fbm(st * 2.0 + q * 1.4 + vec2(1.7, 9.2) + t * 0.3),
    fbm(st * 2.0 + q * 1.4 + vec2(8.3, 2.8) + t * 0.25)
  );
  float f = fbm(st + r * 1.1 + t * 0.2);

  // palette: near-black → dark crimson → faint rose
  vec3 bg     = vec3(0.031, 0.031, 0.031);  // #080808
  vec3 accent = vec3(0.839, 0.188, 0.235);  // #d6303c
  vec3 mid    = vec3(0.10,  0.04,  0.05);

  vec3 col = mix(bg, mid, clamp(f * 2.0, 0.0, 1.0));
  col = mix(col, accent * 0.65, clamp(pow(f, 2.5) * 1.2, 0.0, 1.0));

  // red bloom — center-bottom where title sits
  float bloom = 1.0 - smoothstep(0.0, 0.75, length(uv - vec2(0.5, 0.62)));
  col += accent * bloom * 0.10;

  // radial vignette — edges darker
  float vig = 1.0 - smoothstep(0.38, 1.15, length(uv - vec2(0.5)));
  col *= vig * 0.92 + 0.08;

  // cinematic-dark but slightly more present
  col *= 0.62;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes  = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");

    let raf = 0;
    const start = performance.now();

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const render = () => {
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        display: "block", pointerEvents: "none",
      }}
    />
  );
}
