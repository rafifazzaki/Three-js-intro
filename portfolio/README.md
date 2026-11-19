# Portfolio — Muhammad Rafif Azzaki

Interactive 3D portfolio. Scroll drops objects into a physics scene; click
one to read about the project it represents.

Built with Vite, Three.js and cannon-es — the same stack as the original
`first-portofolio`, restructured.

## Running it

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # -> dist/
npm run preview
npm run models   # re-compress assets/models-src -> public/obj
```

## Layout

```
index.html            markup shell — the HUD is built in JS from projects.js
src/
  main.js             wiring + render loop
  config.js           every tunable number (camera, physics, scroll stages)
  projects.js         all content: projects, attributions, profile links
  core/
    scene.js          renderer, camera, lights, ground
    physics.js        cannon world + PhysicsEntity (mesh <-> body lifecycle)
    objects.js        model loading, normalisation, collision shape fitting
    track.js          the 3D scroll indicator
  ui/
    hud.js            overlay DOM, panels, detail card
    scroll.js         scroll -> stage spawning
    interactions.js   raycast hover + click
    camera.js         tweened camera views
styles/
  base.css            tokens, reset, canvas, scroll track
  hud.css             overlay grid, panels, detail card
  loader.css          loading screen
scripts/
  compress-models.js  Draco + WebP pipeline
assets/models-src/    original .glb files (not shipped)
public/obj/*.glb      compressed models (served)
public/draco/         Draco decoder, required to read them back
```

## Editing content

All copy lives in `src/projects.js`. Adding a project to `PROJECTS` puts it
in the CV panel; giving it an `object` id that matches an entry in
`DEFINITIONS` (`src/core/objects.js`) also wires it to that 3D object's
click handler. There is no second copy of this text in the HTML.

`date` is `'YYYY'` or `'YYYY-MM'`. It orders the CV list newest-first and
renders beside each title; `dateLabel` overrides the text where a single
date would mislead. `shortTitle` is what the floating tag in the scene
uses — six full titles at once overlap badly.

| Entry | Date | Shown as |
|---|---|---|
| This portfolio | `2026` | 2023–2024, remade 2026 |
| keypad 4x4 | `2024` | 2024 |
| Dicoding API & Amazon Deployment | `2023-11` | Nov 2023 |
| Zettacamp Assignment API | `2023-08` | Aug 2023 |
| COMPFEST 12 — Postman | `2020` | 2020 |
| Finitra | `2018` | 2018 |
| Robot Soccer | `2018` | 2018 |

Month precision sorts correctly because the month lands in the decimal
places: `2024-05` → `2024.05`, still below `2024-11` → `2024.11`.

Entries with no date render without one and sort to the bottom, rather
than carrying a guessed date on what is effectively a CV.

Still open:

- **`PROFILE.cvUpdated` is unset**, so the download button shows no date.
  Set it to e.g. `'Nov 2026'`.
- **The Dicoding GitHub link 404s.** The repo is no longer on the account.

## What changed from the original

**HUD**

- The overlay is one fixed CSS grid with a row per region, so the detail
  card and the hint line cannot overlap. Previously both were
  `position: fixed; bottom: 0` and drew on top of each other.
- Dropped the `* { font-size: 1.5rem }` rule that forced a size onto every
  element and had to be undone piecemeal elsewhere.
- One `openPanel` state drives the panels instead of inline `style` strings
  written from three different files, so two panels can never stack.
- Explicit z-index tokens; `page.js` (a full duplicate of logic already in
  `main.js`, imported nowhere) is gone.
- Real mobile layout, safe-area insets, Escape to close, focus styles.

**Scroll**

- The stage checks ran *inside* `circles.forEach`, so all six ran six times
  per scroll event, unthrottled. Now: one listener, rAF-deferred, one pass.
- Progress dots wrote a 0–100 number into a CSS alpha slot (0–1), so they
  snapped to solid instead of fading. Fixed.
- Separate spawn/release thresholds give hysteresis, so a stage sitting on
  its boundary cannot flicker.
- Page height comes from one constant (`SCROLL_PAGES`). Previously
  `min-height: 500vh` in one stylesheet fought `height: 200vh` in another.

**Physics**

- Bodies now enter the world only when their stage spawns. Before, every
  body was added at load, so objects fell and settled while invisible.
- Rewinding reset only `position`, leaving velocity, spin and rotation
  intact — objects re-entered mid-flight. `reset()` clears all of it.
- Collision shapes are fitted to each model's measured bounding box, and
  models are re-centred on their pivot. Before, models were nudged inside a
  wrapper group by hand while the group followed the body, so what you saw
  was always offset from what was colliding.
- Models normalise to a target size instead of hand-tuned scale factors.
- Added contact materials, damping and sleeping, so objects come to rest.
- Removed a dynamic `Trimesh` torus (mass 1000) sitting invisibly at the
  origin, which everything landed on.
- Fixed timestep against real frame delta, clamped, stepped only once
  loading is done. Meshes sync before render, not after.

**Other**

- Removed the `PointLightHelper` that shipped to production (the floating
  wireframe diamond on the live site).
- Hover tints `emissive` rather than overwriting `color`, clones materials
  per mesh, and restores every mesh it touched — shared GLTF materials used
  to leave objects stuck red.
- Drag-to-orbit no longer registers as a click.
- Real page title, description, OG tags and favicon.
- `node_modules` is not committed; `.gitignore` is at the repo root.

## Reading the scene

Three pieces, each with a distinct job — none of them duplicates another:

**The 3D track** (`core/track.js`) says *where you are*. A vertical track
at the centre with one ring per object and a marker that descends as you
scroll; each ring lights as its object spawns. It is kept short (`TOP_Y`)
so the marker's start position sits inside the frame.

**The right-hand rail** (`.hud-rail`) says *where you can go*. Clicking a
dot jumps to just past that stage's spawn threshold, so the object is in
the scene when you arrive, and hovering names the project.

**The floating tags** (`ui/labels.js`) say *what each object is*, so the
name and date are readable without clicking. They are DOM elements
projected from world space, not 3D text — crisp at any distance, and free,
where the old site's one piece of 3D text cost 1.1 MB as a mesh. A tag
appears only once its object is at rest, and a greedy pass lifts any that
would collide.

Once all six objects have landed, the track fades out and the name text
fades in. Scrolling back up reverses it.

The hand-off waits for every body to be asleep, *or* for a 3.5s grace
period (`SETTLE_GRACE` in `main.js`) — two objects that land touching can
nudge each other for a long time without tripping cannon's sleep
threshold, and that would otherwise stall the transition forever.

## The bento-tile clip

The hub's three.js tile shows a recorded clip, not a live embed. A live
embed can't work there: the tile sets `pointer-events: none`, so the
scroll that reveals the objects can never fire, and the tile would render
an empty floor after downloading the whole scene.

```bash
npm run dev       # if it is not already running
npm run capture   # prints the URL to open
npm run encode    # -> public/clip/portfolio.{mp4,webm,jpg}
```

Opening `/?capture=1` records itself. The tab title counts frames and then
reads `capture complete`; PNGs land in `assets/capture/frames/` (gitignored
— the encoded clip is the artefact worth keeping).

**Nothing but the canvas is in frame.** Capture mode hides the HUD, the
right-hand progress dots, the hint line and the scrollbar. The live site
is unaffected.

The centre scroll track *is* in the clip, driven by how far through the
drop sequence the simulation is rather than by scroll position — the
marker descends and each ring lights as its object spawns, exactly as it
reads on the site. It fades out once everything has landed.

The project tags are rebuilt as sprites with a canvas texture.
`canvas.toBlob()` only reads the WebGL canvas, so the site's DOM tags
would not appear at all; as sprites they are part of the render and
always face the camera, which keeps them readable through the orbit. They
pop in one at a time, in the order the objects dropped.

**It does not record in real time.** The simulation is advanced by an
exact number of fixed steps per frame and each frame is read back in an
awaited loop, so output is byte-identical between runs and a throttled or
backgrounded tab cannot stutter it. That matters more than it sounds —
`requestAnimationFrame` is throttled in a hidden tab, which is exactly
what makes screen recording and `MediaRecorder` unreliable here.

The shot, 12s at 30fps: objects are already falling at frame 0 (0.75s of
pre-roll), they cascade in over ~3s, the name fades in once they rest,
then the tags appear one by one while the camera orbits.

**It loops.** The camera swings out and comes back on a ping-pong, so the
last frame's camera matches the first frame's exactly — about 60° of
travel at roughly 5°/s. A full 360° would also loop, but at a speed slow
enough to be pleasant it would need a ~45s clip. The scene state can't
match across the seam (it opens on falling objects and ends on settled
ones with tags up), so `encode-capture.js` adds a 0.4s dip to black at
each end to hide it.

Tunables are at the top of `src/capture.js`: duration, fps, resolution,
pre-roll, spawn stagger, label timing and the camera path.

Not a GIF: a dark scene with smooth gradients bands badly at 256 colours,
and GIF would run an order of magnitude larger than either video.

```html
<video autoplay muted loop playsinline preload="metadata"
       poster="portfolio.jpg" style="width:100%;height:100%;object-fit:cover">
  <source src="portfolio.webm" type="video/webm">
  <source src="portfolio.mp4" type="video/mp4">
</video>
```

`playsinline` stops iOS Safari going fullscreen; `muted` is what permits
autoplay at all.

The clip lives in `public/`, so once this site is deployed it is served
alongside it — `https://<your-domain>/clip/portfolio.mp4`. The hub has to
reference that public URL; it cannot reach a dev server on localhost. So
the order is: deploy this site, then point the hub tile at the clip.

## Models

Sources live in `assets/models-src` and are never served. `npm run models`
compresses them into `public/obj` with Draco geometry and WebP textures:

```
contact-linkedin     1126kB ->  12kB
game_controller2     1309kB ->  52kB
keypad                208kB ->   8kB
marble_test           132kB ->  16kB
mech_keyboard        3524kB -> 200kB
omnidirectional      2340kB ->  44kB

total 8.4MB -> 336kB (96% smaller)
```

The decoder in `public/draco` is what reads these back at runtime, wired
up in `src/core/objects.js`. If it goes missing, models stop loading
entirely rather than just loading slowly.

The two unused models from the old repo (`marble_ball.glb`,
`contact-github.glb`, 3.6 MB together) were not carried over.

## Attribution

Models under CC BY 4.0 — credited in the CV panel and in
`src/projects.js`:

- Custom Mechanical Keyboard — unknown.fbx
- marble test! — clairenicole22
- Game Controller — Hasaral Saparamadu
