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
// Starts on top of the in-app rock and flies in an arc down to the desktop floor.
let jump = null;
const JUMP_MS = 750;
function startJump(target) {
  jump = { t0: performance.now(), x0: x, y0: y, x1: target.x, y1: target.y,
           lift: Math.max(70, Math.abs(target.y - y) * 0.25 + 70) };
  dir = target.x >= x ? 1 : -1;
  flip.style.transform = `scaleX(${dir})`;
}
function stepJump() {
  const t = Math.min(1, (performance.now() - jump.t0) / JUMP_MS);
  const e = t * (2 - t) * 0.35 + t * 0.65;                 // slight ease-out on the horizontal travel
  x = jump.x0 + (jump.x1 - jump.x0) * e;
  y = jump.y0 + (jump.y1 - jump.y0) * t - jump.lift * 4 * t * (1 - t);
  flip.style.transform = `scaleX(${dir}) rotate(${dir * 360 * t}deg)`;
  if (t >= 1) {
    jump = null;
    flip.style.transform = `scaleX(${dir})`;
    vy = 0;
    anim('squash', 250);
    action = 'sit'; actionUntil = Date.now() + 1500;
    say('Free at last! Drag me anywhere.', 4000);
  }
  send();
}

function tick() {
  if (!area || dragging) return;
  if (jump) { stepJump(); return; }
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
  if (info.launch) startJump(info.launch.target);
  else say('Hi! Drag me anywhere.', 3500);
  setInterval(tick, TICK_MS);
  setInterval(() => window.win.petInfo().then((i) => { if (i && !dragging) area = i.area; }), 3000);
});
