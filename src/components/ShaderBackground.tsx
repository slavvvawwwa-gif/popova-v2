import { useEffect, useRef } from "react";

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform float uHue;
uniform vec2  uMouse;

vec2 ghash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

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

float fbm4(vec2 p) {
  float v=0.0,a=0.5; mat2 r=mat2(0.80,0.60,-0.60,0.80);
  for(int i=0;i<4;i++){v+=a*gnoise(p);p=r*p*2.07+vec2(1.7,9.2);a*=0.50;} return v;
}
float fbm3(vec2 p) {
  float v=0.0,a=0.5; mat2 r=mat2(0.80,0.60,-0.60,0.80);
  for(int i=0;i<3;i++){v+=a*gnoise(p);p=r*p*2.07+vec2(1.7,9.2);a*=0.50;} return v;
}
float fbm2(vec2 p) {
  float v=0.0,a=0.5; mat2 r=mat2(0.80,0.60,-0.60,0.80);
  for(int i=0;i<2;i++){v+=a*gnoise(p);p=r*p*2.07+vec2(5.3,2.8);a*=0.50;} return v;
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

  vec2 q0 = vec2(fbm3(st*1.0 + t*0.20), fbm3(st*1.0 + vec2(5.2,1.3) + t*0.18));
  float bg  = fbm4(st*1.1 + q0*1.8 + t*0.10);

  vec2 q1 = vec2(fbm3(st*1.9 + t*0.35), fbm3(st*1.9 + vec2(3.7,8.1) + t*0.28));
  float mid  = fbm3(st*1.6 + q1*1.3 + t*0.18);
  float wisp = fbm2(st*4.2 + q1*0.7 + t*0.55);
  float cloud = bg*0.50 + mid*0.35 + wisp*0.15;

  float heightFade = smoothstep(0.0, 1.3, uv.y + bg*0.3);

  vec3 abyss  = hsl2rgb(uHue,        0.30, 0.028);
  vec3 shadow = hsl2rgb(uHue + 12.0, 0.22, 0.052);
  vec3 mist   = hsl2rgb(uHue +  5.0, 0.38, 0.088);
  vec3 glow   = hsl2rgb(uHue,        0.72, 0.500);
  vec3 copper = hsl2rgb(uHue + 22.0, 0.52, 0.380);

  vec3 col = mix(abyss, shadow, clamp(bg*2.8, 0.0, 1.0));
  col = mix(col, mist, clamp(mid*2.4 - 0.3, 0.0, 1.0));
  col += glow   * clamp(pow(cloud, 3.0)*1.8, 0.0, 1.0) * heightFade * 0.36;
  col += copper * clamp(q1.y*0.55, 0.0, 1.0) * 0.16;

  float stageDist = length((uv - vec2(0.5, 1.1)) * vec2(1.0, 0.5));
  col += glow * smoothstep(0.9, 0.0, stageDist) * 0.09 * (0.7 + cloud*0.5);

  col += mist * wisp * 0.06 * (1.0 - heightFade*0.4);

  // Cursor warmth — fog brightens and warms near the mouse
  vec2 uvAR    = uv    * vec2(uRes.x / uRes.y, 1.0);
  vec2 mouseAR = uMouse * vec2(uRes.x / uRes.y, 1.0);
  float mDist  = length(uvAR - mouseAR);
  float mGlow  = smoothstep(1.00, 0.0, mDist);
  col += glow * mGlow * 0.10;
  col *= 1.0 + mGlow * 0.10;

  float vig = 1.0 - smoothstep(0.22, 1.20, length((uv - vec2(0.5,0.48)) * vec2(0.95,1.05)));
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
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const hueRef        = useRef(hue);          // target hue (from prop)
  const currentHueRef = useRef(hue);          // rendered hue (lerps toward target)
  const mouseRef      = useRef({ x: 0.5, y: 0.5 });

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

    const uRes    = gl.getUniformLocation(prog, "uRes");
    const uTime   = gl.getUniformLocation(prog, "uTime");
    const uHueL   = gl.getUniformLocation(prog, "uHue");
    const uMouseL = gl.getUniformLocation(prog, "uMouse");

    let raf = 0;
    let lastFrame = 0;
    const FRAME_MS = 1000 / 30; // throttle to 30fps
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

    // Mouse tracking — Y is flipped for GL coords
    const onMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      currentHueRef.current += (hueRef.current - currentHueRef.current) * 0.03;

      gl.uniform1f(uTime,  (now - start) / 1000);
      gl.uniform1f(uHueL,  currentHueRef.current);
      gl.uniform2f(uMouseL, mouseRef.current.x, mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
    />
  );
}
