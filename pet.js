const PW = 120, PH = 95;
const TICK_MS = 33;

const $ = (id) => document.getElementById(id);
$('mascot-slot').innerHTML = MASCOT_SVG;
const svg = $('mascot');
const flip = $('flip');
const bubble = $('bubble');

let mood = 'idle';
let x = 0, y = 0, area = null;
let vy = 0;
let dir = 1;
let action = 'sit', actionUntil = 0;
let dragging = false;
let lastSent = '';

// ---------- messages from the app window ----------
let bubbleTimer;
function say(text, ms = 3500) {
  bubble.textContent = text;
  bubble.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
}
window.win.onSync((msg) => {
  if (msg.look) applyMascotLook(svg, msg.look);
  if (msg.mood) { mood = msg.mood; svg.setAttribute('class', mood); }
  if (msg.say) say(msg.say, msg.ms);
  if (msg.held !== undefined) {       // still being dragged by the app window's pointer
    dragging = msg.held;
    if (msg.held) { x = msg.x; y = msg.y; vy = 0; flip.classList.remove('walk'); send(); }
    else {
      window.win.petInfo().then((i) => { if (i) area = i.area; });
      actionUntil = Date.now() + 1500;
    }
  }
});

// ---------- behaviour: the rock does its own thing ----------
const rand = (a, b) => a + Math.random() * (b - a);
function anim(cls, ms) {
  flip.classList.add(cls);
  setTimeout(() => flip.classList.remove(cls), ms);
}
function pick() {
  const now = Date.now();
  const r = Math.random();
  if (mood === 'rest') {            // on a break: nap
    action = 'sit'; actionUntil = now + rand(4000, 8000); return;
  }
  const focus = mood === 'focus';   // while studying: mostly sit quietly, don't distract
  const walkChance = focus ? 0.2 : 0.5;
  if (r < walkChance) {
    action = 'walk';
    dir = Math.random() < 0.5 ? -1 : 1;
    actionUntil = now + rand(2000, 5000);
  } else if (r < walkChance + 0.12 && !focus) {
    action = 'hop'; actionUntil = now + 700; anim('hop', 600);
  } else if (r < walkChance + 0.25) {
    action = 'sit'; dir = -dir; actionUntil = now + rand(1500, 3000); // look the other way
  } else {
    action = 'sit'; actionUntil = now + rand(3000, 7000);
  }
}

// ---------- jumping out of the app ----------
// The window is oversized for the jump; the rock flies a parabolic arc inside it using a
// transform on every animation frame, then the window shrinks back onto the landing spot.
let jump = null, landing = false;
const JUMP_MS = 800;
const stage = $('stage');
function startJump(launch, box) {
  const t = launch.target;
  jump = { t0: performance.now(), x0: launch.start.x, y0: launch.start.y, x1: t.x, y1: t.y, lift: launch.lift,
           baseY: box.y + window.innerHeight - PH, boxX: box.x };
  dir = t.x >= launch.start.x ? 1 : -1;
  flip.style.transform = `scaleX(${dir})`;
  requestAnimationFrame(stepJump);
}
function stepJump(now) {
  if (!jump) return;
  const t = Math.min(1, (now - jump.t0) / JUMP_MS);
  const e = t * t * (3 - 2 * t);                            // smoothstep: eases in and out horizontally
  x = jump.x0 + (jump.x1 - jump.x0) * e;
  y = jump.y0 + (jump.y1 - jump.y0) * t - jump.lift * 4 * t * (1 - t);
  stage.style.transform = `translate(${x - jump.boxX}px, ${y - jump.baseY}px)`;
  flip.style.transform = `scaleX(${dir}) rotate(${dir * 360 * t}deg)`;
  if (t < 1) return requestAnimationFrame(stepJump);
  x = jump.x1; y = jump.y1; jump = null; landing = true;
  window.win.petSetPos(x, y);                               // shrink the window onto the rock...
  window.win.petInfo().then((i) => {                        // ...and only then drop the offset
    if (i) area = i.area;
    stage.style.transform = '';
    flip.style.transform = `scaleX(${dir})`;
    landing = false;
    vy = 0;
    anim('squash', 250);
    action = 'sit'; actionUntil = Date.now() + 1500;
    say('Free at last! Drag me anywhere.', 4000);
  });
}

function tick() {
  if (!area || dragging) return;
  if (jump || landing) return;
  const floorY = area.y + area.height - PH;

  if (y < floorY) {                 // falling after being dropped
    vy += 1.4;
    y = Math.min(floorY, y + vy);
    if (y >= floorY) { vy = 0; anim('squash', 250); action = 'sit'; actionUntil = Date.now() + 1200; }
  } else {
    if (y > floorY) y = floorY;     // taskbar/work area moved
    if (Date.now() > actionUntil) pick();
    if (action === 'walk' && mood !== 'rest') {
      x += dir * (mood === 'focus' ? 0.9 : 1.6);
      const min = area.x - 25, max = area.x + area.width - PW + 25;
      if (x <= min) { x = min; dir = 1; }
      if (x >= max) { x = max; dir = -1; }
    }
  }
  flip.classList.toggle('walk', action === 'walk' && y >= floorY && mood !== 'rest');
  flip.style.transform = `scaleX(${dir})`;
  send();
}
function send() {
  const key = Math.round(x) + ',' + Math.round(y);
  if (key === lastSent) return;
  lastSent = key;
  window.win.petSetPos(x, y);
}

// ---------- drag to move / click to pet / double-click to send home ----------
const talk = ['Rock solid!', 'You got this.', 'One thing at a time.', 'Hydrate!', 'Stretch your shoulders.', '...pet accepted.', "I'm not going anywhere."];
let drag = null;
flip.addEventListener('pointerdown', (e) => {
  flip.setPointerCapture(e.pointerId);
  drag = { sx: e.screenX, sy: e.screenY, x, y, moved: false };
});
flip.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.screenX - drag.sx, dy = e.screenY - drag.sy;
  if (!drag.moved && Math.hypot(dx, dy) < 4) return;
  drag.moved = true;
  dragging = true;
  if (jump) { jump = null; flip.style.transform = `scaleX(${dir})`; }
  flip.classList.add('dragging');
  flip.classList.remove('walk');
  vy = 0;
  x = drag.x + dx;
  y = Math.min(drag.y + dy, area.y + area.height - PH + 0);
  send();
});
flip.addEventListener('pointerup', (e) => {
  flip.releasePointerCapture(e.pointerId);
  if (drag && !drag.moved) {
    say(talk[Math.floor(Math.random() * talk.length)]);
    anim('hop', 600);
  }
  drag = null;
  dragging = false;
  flip.classList.remove('dragging');
  // refresh which monitor's work area we're on, then gravity takes over
  window.win.petInfo().then((info) => { if (info) area = info.area; });
  actionUntil = Date.now() + 1500;
});
flip.addEventListener('dblclick', () => window.win.petGoHome());

// ---------- start ----------
window.win.petInfo().then((info) => {
  if (!info) return;
  x = info.x; y = info.y; area = info.area;
  window.win.petReady();
  if (info.launch) startJump(info.launch, info);
  else say('Hi! Drag me anywhere.', 3500);
  setInterval(tick, TICK_MS);
  setInterval(() => window.win.petInfo().then((i) => { if (i && !dragging) area = i.area; }), 3000);
});
