/* =============================================================
   Karaya — fond animé du hero
   Surface d'eau en WebGL : bruit fractal replié sur lui-même,
   nervures de caustiques, halo qui suit le curseur.
   Si WebGL manque, le dégradé CSS du canvas reste visible.
   ============================================================= */

(function () {
  "use strict";

  var canvas = document.getElementById("water");
  if (!canvas) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var gl =
    canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }) ||
    canvas.getContext("experimental-webgl");
  if (!gl) return;

  /* ---------------------------------------------------------- shaders */

  var VERT = [
    "attribute vec2 aPos;",
    "void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }"
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "uniform vec2  uRes;",
    "uniform float uTime;",
    "uniform vec2  uMouse;",   // 0..1, lissé
    "uniform float uHold;",    // intensité du halo curseur

    "float hash(vec2 p){",
    "  p = fract(p * vec2(123.34, 456.21));",
    "  p += dot(p, p + 45.32);",
    "  return fract(p.x * p.y);",
    "}",

    "float noise(vec2 p){",
    "  vec2 i = floor(p), f = fract(p);",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  float a = hash(i);",
    "  float b = hash(i + vec2(1.0, 0.0));",
    "  float c = hash(i + vec2(0.0, 1.0));",
    "  float d = hash(i + vec2(1.0, 1.0));",
    "  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);",
    "}",

    "float fbm(vec2 p){",
    "  float s = 0.0, a = 0.5;",
    "  for(int i = 0; i < 5; i++){",
    "    s += a * noise(p);",
    "    p = p * 2.02 + vec2(1.7, 9.2);",
    "    a *= 0.5;",
    "  }",
    "  return s;",
    "}",

    // nervures : on garde la crête du bruit
    "float veins(vec2 p, float t, float sharp){",
    "  vec2 q = vec2(fbm(p + t * 0.06), fbm(p + vec2(4.3, 1.7) - t * 0.05));",
    "  float n = fbm(p * 1.6 + q * 1.9 + vec2(t * 0.035, -t * 0.028));",
    "  float v = 1.0 - abs(n * 2.0 - 1.0);",
    "  return pow(clamp(v, 0.0, 1.0), sharp);",
    "}",

    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / uRes.xy;",
    "  float asp = uRes.x / uRes.y;",
    "  vec2 p = vec2(uv.x * asp, uv.y);",
    "  float t = uTime;",

    // déformation douce autour du curseur
    "  vec2 m = vec2(uMouse.x * asp, uMouse.y);",
    "  float dm = distance(p, m);",
    "  float ripple = exp(-dm * 3.4) * uHold;",
    "  p += normalize(p - m + 0.0001) * sin(dm * 9.0 - t * 1.4) * 0.018 * ripple;",

    // deux échelles de caustiques
    "  float c1 = veins(p * 2.1, t, 7.0);",
    "  float c2 = veins(p * 4.2 + vec2(3.1, 0.6), t * 1.2, 10.0);",
    "  float mask = smoothstep(0.32, 0.92, fbm(p * 0.9 + t * 0.02));",
    "  float light = c1 * 0.62 * (0.18 + mask) + c2 * 0.3 * mask;",

    // palette
    "  vec3 abyss  = vec3(0.027, 0.078, 0.071);",
    "  vec3 sea    = vec3(0.063, 0.180, 0.169);",
    "  vec3 lagoon = vec3(0.24,  0.47,  0.45);",
    "  vec3 foam   = vec3(0.82,  0.89,  0.86);",

    "  float depth = smoothstep(-0.15, 1.15, uv.y);",
    "  vec3 col = mix(abyss, sea, depth);",
    "  float halo = exp(-distance(vec2(uv.x * asp, uv.y), vec2(0.70 * asp, 0.90)) * 1.35);",
    "  col = mix(col, lagoon, halo * 0.6);",
    "  col = mix(col, lagoon * 1.15, ripple * 0.3);",

    "  col += foam * light * (0.07 + 0.30 * depth * depth);",
    "  col += foam * ripple * 0.06;",

    // vignette + léger grain
    "  vec2 d = uv - 0.5;",
    "  col *= 1.0 - dot(d, d) * 0.55;",
    "  col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) * 0.016;",

    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  /* ---------------------------------------------------------- programme */

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("shader", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, "uRes");
  var uTime = gl.getUniformLocation(prog, "uTime");
  var uMouse = gl.getUniformLocation(prog, "uMouse");
  var uHold = gl.getUniformLocation(prog, "uHold");

  /* ---------------------------------------------------------- état */

  var dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    var w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    var h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }

  var target = { x: 0.62, y: 0.55 };
  var mouse = { x: 0.62, y: 0.55 };
  var hold = 0;
  var holdTarget = 0;

  window.addEventListener(
    "pointermove",
    function (e) {
      var r = canvas.getBoundingClientRect();
      if (e.clientY > r.bottom) return;
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
      holdTarget = 1;
    },
    { passive: true }
  );
  window.addEventListener("pointerdown", function () { holdTarget = 1.8; }, { passive: true });
  window.addEventListener("pointerup", function () { holdTarget = 1; }, { passive: true });
  canvas.addEventListener("pointerleave", function () { holdTarget = 0; }, { passive: true });

  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) { visible = entries[0].isIntersecting; },
      { threshold: 0 }
    ).observe(canvas);
  }

  var running = true;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  window.addEventListener("resize", resize);
  resize();

  /* ---------------------------------------------------------- boucle */

  var start = performance.now();

  function draw(t) {
    mouse.x += (target.x - mouse.x) * 0.055;
    mouse.y += (target.y - mouse.y) * 0.055;
    hold += (holdTarget - hold) * 0.05;
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uHold, hold);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    if (!running) return;
    if (visible) draw((now - start) / 1000);
    requestAnimationFrame(frame);
  }

  if (reduce) {
    resize();
    draw(12.0);
  } else {
    requestAnimationFrame(frame);
  }
})();
