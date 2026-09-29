import { surfaceGLSL } from "./ribbonSurface";

/* Card plane: a DOM rect pushed to z = 0 and bent onto the ribbon surface.
   The fragment stage cuts the rounded corners as an SDF measured in css px
   (so they hold at any tilt), cover-fits the picture, shades the far parts
   toward the room's black (distance, not a vignette), and lays the caption
   scrim along the bottom edge. GLSL3: three prepends the attribute and
   matrix declarations. */

export const cardVert = /* glsl */ `
  ${surfaceGLSL}
  out vec2 v_uv;
  out vec2 v_local;
  out float v_z;
  void main() {
    v_uv = uv;
    v_local = uv - 0.5;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vec3 p = surface(w.xyz, v_local);
    v_z = p.z;
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`;

export const cardFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D u_map;
  uniform vec2 u_res;
  uniform vec2 u_size;
  uniform float u_corner;
  uniform float u_alpha;
  uniform float u_D;
  uniform float u_shade;
  uniform float u_scrim;
  in vec2 v_uv;
  in vec2 v_local;
  in float v_z;
  out vec4 fragColor;
  void main() {
    float pa = u_size.x / u_size.y;
    float ia = u_res.x / u_res.y;
    vec2 uv = v_uv;
    if (ia > pa) { float s = pa / ia; uv.x = uv.x * s + (1.0 - s) * 0.5; }
    else { float s = ia / pa; uv.y = uv.y * s + (1.0 - s) * 0.5; }
    vec4 c = texture(u_map, uv);
    // rounded box, css px
    vec2 ppx = v_local * u_size;
    vec2 b = u_size * 0.5 - u_corner;
    vec2 d = abs(ppx) - b;
    float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - u_corner;
    float aa = fwidth(sd);
    float box = 1.0 - smoothstep(-aa, aa, sd);
    // depth shade toward the room
    float shade = smoothstep(0.0, -u_D * 1.8, v_z) * u_shade;
    vec3 col = mix(c.rgb, vec3(0.0), shade);
    // caption scrim, squared so it dissolves rather than stopping on a line
    float sc = smoothstep(0.45, 0.0, v_uv.y);
    col = mix(col, vec3(0.0), sc * sc * u_scrim);
    fragColor = vec4(col, box * u_alpha);
  }
`;

/* ── Post: the cursor as a ball under a rubber sheet ──────────────────────
   The pointer paints a height field into a small trail buffer (decay and a
   little diffusion each frame, one gaussian stamp at the cursor). The post
   pass never draws the ball; it resamples the finished frame along the
   field's slope, so the page itself slides as if something rolled under
   it, and the dent dies where it was made. */

export const quadVert = /* glsl */ `
  out vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const trailFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D u_prev;
  uniform vec2 u_texel;
  uniform float u_decay;
  uniform float u_diff;
  uniform vec2 u_pos;
  uniform float u_amp;
  uniform float u_rad;
  uniform float u_aspect;
  in vec2 v_uv;
  out vec4 fragColor;
  void main() {
    float c = texture(u_prev, v_uv).r;
    float n = texture(u_prev, v_uv + vec2(u_texel.x, 0.0)).r
            + texture(u_prev, v_uv - vec2(u_texel.x, 0.0)).r
            + texture(u_prev, v_uv + vec2(0.0, u_texel.y)).r
            + texture(u_prev, v_uv - vec2(0.0, u_texel.y)).r;
    float h = mix(c, n * 0.25, u_diff) * u_decay;
    vec2 d = (v_uv - u_pos) * vec2(1.0, 1.0 / u_aspect);
    float stamp = exp(-dot(d, d) / (u_rad * u_rad)) * u_amp;
    h = min(h + stamp, 1.5);
    fragColor = vec4(h, 0.0, 0.0, 1.0);
  }
`;

export const postFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D u_scene;
  uniform sampler2D u_trail;
  uniform vec2 u_texel;
  uniform float u_push;
  uniform float u_light;
  uniform float u_on;
  in vec2 v_uv;
  out vec4 fragColor;
  void main() {
    vec2 g = vec2(
      texture(u_trail, v_uv + vec2(u_texel.x * 2.0, 0.0)).r - texture(u_trail, v_uv - vec2(u_texel.x * 2.0, 0.0)).r,
      texture(u_trail, v_uv + vec2(0.0, u_texel.y * 2.0)).r - texture(u_trail, v_uv - vec2(0.0, u_texel.y * 2.0)).r
    ) * u_on;
    vec4 sc = texture(u_scene, v_uv - g * u_push);
    // the slope is lit from up-left, toward the viewer
    vec3 col = sc.rgb * (1.0 + dot(g, vec2(-0.7, 0.7)) * u_light);
    // premultiplied: empty parts of the room stay transparent
    fragColor = vec4(col, sc.a);
  }
`;
