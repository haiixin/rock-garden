const DURATIONS = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
// A focus session you never pause earns the full reward; pausing drops it to the base.
const POINTS = { pomodoro: 5, cleanBonus: 10, todo: 5 };
const POINTS_PER_LEVEL = 50;
const SAVE_KEY = 'rock-garden-v1';

const $ = (id) => document.getElementById(id);
const todayKey = () => new Date().toISOString().slice(0, 10);

// ---------- shop catalog ----------
const SHOP = [
  { id: 'party',   cat: 'hat', name: 'Party hat',  price: 30,  icon: hatIcon('party') },
  { id: 'flower',  cat: 'hat', name: 'Flower',     price: 20,  icon: hatIcon('flower') },
  { id: 'bow',     cat: 'hat', name: 'Bow',        price: 25,  icon: hatIcon('bow') },
  { id: 'glasses', cat: 'hat', name: 'Shades',     price: 40,  icon: hatIcon('glasses') },
  { id: 'tophat',  cat: 'hat', name: 'Top hat',    price: 60,  icon: hatIcon('tophat') },
  { id: 'crown',   cat: 'hat', name: 'Crown',      price: 100, icon: hatIcon('crown') },

  { id: 'granite', cat: 'color', name: 'Granite',     price: 0,  color: '#8d96a0' },
  { id: 'sand',    cat: 'color', name: 'Sandstone',   price: 40, color: '#c9a877' },
  { id: 'rose',    cat: 'color', name: 'Rose quartz', price: 40, color: '#d99aa8' },
  { id: 'jade',    cat: 'color', name: 'Jade',        price: 50, color: '#5fae8c' },
  { id: 'lapis',   cat: 'color', name: 'Lapis',       price: 60, color: '#4f6fc2' },
  { id: 'obsidian',cat: 'color', name: 'Obsidian',    price: 80, color: '#3b3f47' },

  { id: 'night',   cat: 'theme', name: 'Night',  price: 0,  bg: '#1f2326', bar: '#181b1d', accent: '#5b9a6b' },
  { id: 'forest',  cat: 'theme', name: 'Forest', price: 50, bg: '#1d2a22', bar: '#15201a', accent: '#6fbf73' },
  { id: 'ocean',   cat: 'theme', name: 'Ocean',  price: 50, bg: '#1b2733', bar: '#141d27', accent: '#4aa3df' },
  { id: 'sunset',  cat: 'theme', name: 'Sunset', price: 60, bg: '#2d2226', bar: '#241a1e', accent: '#e07a5f' },
  { id: 'plum',    cat: 'theme', name: 'Plum',   price: 60, bg: '#26202e', bar: '#1d1823', accent: '#a37bd6' }
];
const DEFAULT_EQUIPPED = { hat: null, color: 'granite', theme: 'night' };

// ---------- persisted state ----------
const defaults = {
  points: 0,      // spendable coins
  lifetime: 0,    // total ever earned; drives level
  owned: ['granite', 'night'],
  equipped: { ...DEFAULT_EQUIPPED },
  prizes: [],     // user-defined rewards: { id, name, price, claimed }
  vol: { alarm: 100, sfx: 100 }, // 0-100 sliders
  todos: [], days: {}, compact: false, pinned: true, cycle: 0
};
let state = { ...defaults };
try {
  const loaded = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
  state = { ...defaults, ...loaded };
  state.equipped = { ...DEFAULT_EQUIPPED, ...(loaded.equipped || {}) };
  state.vol = { ...defaults.vol, ...(loaded.vol || {}) };
  if (loaded.lifetime === undefined) state.lifetime = state.points; // migrate v1 saves
} catch {}
const save = () => localStorage.setItem(SAVE_KEY, JSON.stringify(state));

// ---------- mascot ----------
$('mascot-slot').innerHTML = MASCOT_SVG;
const mascot = $('mascot');
const bubble = $('bubble');
let bubbleTimer, moodTimer, currentMood = 'idle';

function say(text, ms = 3500) {
  bubble.textContent = text;
  bubble.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  syncPet({ say: text, ms });
}
function setMood(mood) {
  currentMood = mood;
  mascot.setAttribute('class', mood);
  syncPet({ mood });
}
function restingMood() {
  if (timer.running) return timer.mode === 'focus' ? 'focus' : 'rest';
  return 'idle';
}
function cheer(text) {
  setMood('cheer');
  say(text, 4000);
  clearTimeout(moodTimer);
  moodTimer = setTimeout(() => setMood(restingMood()), 2200);
}

// what the mascot looks like right now (shared by the in-app rock and the desktop pet)
function currentLook() {
  const find = (id) => SHOP.find((i) => i.id === id);
  const lvl = Math.floor(state.lifetime / POINTS_PER_LEVEL) + 1; // moss grows with level
  return {
    hat: state.equipped.hat,
    color: (find(state.equipped.color) || find('granite')).color,
    moss: Math.min(1, (lvl - 1) / 3)
  };
}
function refreshLook() {
  const look = currentLook();
  applyMascotLook(mascot, look);
  syncPet({ look });
}
function updateMoss() { refreshLook(); }

// apply equipped shop items to the mascot and window
function applyLook() {
  const theme = SHOP.find((i) => i.id === state.equipped.theme);
  if (theme) {
    const r = document.documentElement.style;
    r.setProperty('--bg', theme.bg);
    r.setProperty('--bar', theme.bar);
    r.setProperty('--accent', theme.accent);
  }
  refreshLook();
}

// ---------- desktop pet ----------
let petOut = false;
function syncPet(msg) { if (petOut) window.win.petSync(msg); }
let launching = false;
function setPetOut(on, announce = true) {
  petOut = on;
  state.petOut = on;
  $('btn-pet').title = on ? 'Bring the rock back into the app' : 'Let the rock out on your desktop';
  save();
  // clicking the button (announce) makes the rock crouch and jump out of the app onto the desktop
  const wrap = document.querySelector('#top #mascot-wrap');
  const r = wrap.getBoundingClientRect();
  if (on && announce && r.width > 0) {
    launching = true;
    wrap.classList.add('launch');
    setTimeout(() => window.win.pet(true, { left: r.left, bottom: r.bottom, width: r.width }), 220);
    return;
  }
  launching = false;
  wrap.classList.remove('launch');
  document.body.classList.toggle('pet-out', on);
  window.win.pet(on);
  if (on && announce) say('Free at last! Drag me anywhere.', 4000);
}
$('btn-pet').onclick = () => { if (!launching) setPetOut(!petOut); };
// the pet window asks for the full picture when it opens
window.win.onPetNeedSync(() => {
  if (launching) {            // the pet has taken over: the in-app rock is gone
    launching = false;
    document.body.classList.add('pet-out');
    document.querySelector('#top #mascot-wrap').classList.remove('launch');
  }
  syncPet({ look: currentLook(), mood: currentMood });
});
// double-clicking the pet sends it home
window.win.onPetHome(() => setPetOut(false, false));

// ---------- points ----------
// Coins are spendable; lifetime only goes up (except when a task is un-done) and sets the level.
function addPoints(n) {
  const before = Math.floor(state.lifetime / POINTS_PER_LEVEL);
  state.points = Math.max(0, state.points + n);
  state.lifetime = Math.max(0, state.lifetime + n);
  const after = Math.floor(state.lifetime / POINTS_PER_LEVEL);
  save();
  renderPoints();
  return after > before;
}
function renderPoints() {
  const lvl = Math.floor(state.lifetime / POINTS_PER_LEVEL) + 1;
  $('level').textContent = 'Lv ' + lvl;
  $('pts').innerHTML = icon('coins', 14) + ' ' + state.points;
  $('shop-bal').innerHTML = icon('coins', 14) + ' ' + state.points;
  $('today').innerHTML = 'Today ' + icon('timer', 14) + ' ' + (state.days[todayKey()] || 0);
  $('bar-fill').style.width = ((state.lifetime % POINTS_PER_LEVEL) / POINTS_PER_LEVEL * 100) + '%';
  updateMoss();
  if (!$('screen-shop').hidden) renderShop();
}

// ---------- timer ----------
const timer = { mode: 'focus', remaining: DURATIONS.focus, running: false, endAt: 0, tick: null, clean: true };

function fmt(s) {
  const m = Math.floor(s / 60), r = s % 60;
  return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
}
function renderTimer() {
  $('time').textContent = fmt(timer.remaining);
  $('btn-start').textContent = timer.running ? 'Pause' : 'Start';
  document.title = (timer.running ? fmt(timer.remaining) + ' · ' : '') + 'Rock Garden';
  document.querySelectorAll('#modes button').forEach((b) =>
    b.classList.toggle('active', b.dataset.mode === timer.mode));
}
function setMode(mode) {
  stop();
  timer.mode = mode;
  timer.remaining = DURATIONS[mode];
  setMood('idle');
  renderTimer();
}
function start() {
  if (timer.running) return;
  // a fresh focus session starts "clean"; resuming after a pause stays unclean
  if (timer.remaining === DURATIONS[timer.mode]) timer.clean = true;
  timer.running = true;
  timer.endAt = Date.now() + timer.remaining * 1000;
  timer.tick = setInterval(onTick, 250);
  setMood(restingMood());
  if (timer.mode !== 'focus') say('Rest up. Breathe.');
  else if (timer.clean) say(`Don't pause: uninterrupted earns ${POINTS.pomodoro + POINTS.cleanBonus} coins.`, 5000);
  else say("Back at it. I'm right here.");
  renderTimer();
}
function stop() {
  timer.running = false;
  clearInterval(timer.tick);
  setMood('idle');
  renderTimer();
}
function onTick() {
  timer.remaining = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
  renderTimer();
  if (timer.remaining === 0) complete();
}
function complete() {
  const wasFocus = timer.mode === 'focus';
  stop();
  beep();
  window.win.alert();
  if (wasFocus) {
    state.days[todayKey()] = (state.days[todayKey()] || 0) + 1;
    state.cycle += 1;
    const reward = POINTS.pomodoro + (timer.clean ? POINTS.cleanBonus : 0);
    const leveled = addPoints(reward);
    cheer(leveled ? 'Level up!' : timer.clean ? `Uninterrupted! +${reward} coins` : `Done. +${reward} coins (no pauses = ${POINTS.pomodoro + POINTS.cleanBonus})`);
    setMode(state.cycle % 4 === 0 ? 'long' : 'short');
  } else {
    cheer('Break over. Ready?');
    setMode('focus');
  }
  save();
  renderPoints();
}
function beep() {
  try {
    const ctx = new AudioContext();
    [660, 880, 1100].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.18;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.15 * state.vol.alarm / 100), t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.start(t); o.stop(t + 0.18);
    });
  } catch {}
}

// ---------- button sounds ----------
let sfxCtx;
function blip(freqs, dur = 0.07, vol = 0.08) {
  try {
    sfxCtx = sfxCtx || new AudioContext();
    freqs.forEach((f, i) => {
      const o = sfxCtx.createOscillator(), g = sfxCtx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      o.connect(g); g.connect(sfxCtx.destination);
      const t = sfxCtx.currentTime + i * dur;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * state.vol.sfx / 100), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.02);
    });
  } catch {}
}
// capture phase so the sound plays even if the handler re-renders the button away
document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.classList.contains('buy')) blip([880, 1320], 0.08);       // purchase: coin-ish
  else if (b.id === 'btn-start') blip(timer.running ? [520, 400] : [520, 780]); // pause / start
  else if (b.classList.contains('del') || b.id === 'btn-close') blip([300], 0.09);
  else blip([660]);
}, true);
document.addEventListener('change', (e) => {
  if (e.target.type === 'checkbox') blip(e.target.checked ? [700, 990] : [500]);
}, true);

$('btn-start').onclick = () => {
  if (!timer.running) return start();
  if (timer.mode === 'focus') timer.clean = false;
  stop();
  say('Paused. (No uninterrupted bonus this round.)');
};
$('btn-reset').onclick = () => setMode(timer.mode);
$('btn-skip').onclick = () => setMode(timer.mode === 'focus' ? 'short' : 'focus');
document.querySelectorAll('#modes button').forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));

// ---------- todos ----------
function renderTodos() {
  const ul = $('todo-list');
  ul.innerHTML = '';
  // open tasks first, done ones sink to the bottom
  const sorted = [...state.todos].sort((a, b) => a.done - b.done);
  if (!sorted.length) {
    const li = document.createElement('li');
    li.className = 'empty-note';
    li.textContent = 'No tasks yet. Add one above and earn coins for finishing it.';
    ul.appendChild(li);
    return;
  }
  for (const t of sorted) {
    const li = document.createElement('li');
    li.className = t.done ? 'done' : '';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = t.done;
    cb.onchange = () => toggleTodo(t.id);
    const span = document.createElement('span');
    span.className = 'txt';
    span.textContent = t.text;
    span.title = t.text;
    const del = document.createElement('button');
    del.className = 'del';
    del.innerHTML = icon('x', 12);
    del.setAttribute('aria-label', 'Delete task');
    del.onclick = () => removeTodo(t.id);
    li.append(cb, span, del);
    ul.appendChild(li);
  }
}
function toggleTodo(id) {
  const t = state.todos.find((x) => x.id === id);
  if (!t) return;
  t.done = !t.done;
  // points follow the checkbox so un-checking can't be farmed
  const leveled = addPoints(t.done ? POINTS.todo : -POINTS.todo);
  if (t.done) cheer(leveled ? 'Level up!' : `Done! +${POINTS.todo} coins`);
  save();
  renderTodos();
}
function removeTodo(id) {
  // done tasks already paid out; removing one keeps the points
  state.todos = state.todos.filter((x) => x.id !== id);
  save();
  renderTodos();
}
$('todo-form').onsubmit = (e) => {
  e.preventDefault();
  const text = $('todo-input').value.trim();
  if (!text) return;
  state.todos.push({ id: Date.now() + Math.random(), text, done: false });
  $('todo-input').value = '';
  save();
  renderTodos();
};
$('clear-done').onclick = () => {
  // done tasks already paid out; clearing them keeps the points
  state.todos = state.todos.filter((t) => !t.done);
  save();
  renderTodos();
};

// ---------- window chrome ----------
function applyCompact() {
  document.body.classList.toggle('compact', state.compact);
  $('btn-compact').classList.toggle('on', state.compact);
  $('btn-compact').title = state.compact ? 'Full size' : 'Compact mode';
}
function applyPin() { $('btn-pin').classList.toggle('on', state.pinned); }

$('btn-close').onclick = () => window.win.close();
$('btn-min').onclick = () => window.win.minimize();
$('btn-pin').onclick = () => { state.pinned = !state.pinned; window.win.pin(state.pinned);
if (state.petOut) setPetOut(true, false); applyPin(); save(); };
$('btn-compact').onclick = () => {
  state.compact = !state.compact;
  if (state.compact) showScreen('main');
  window.win.compact(state.compact);
  applyCompact();
  save();
};

// ---------- info / settings ----------
function showPanel(which) {
  const open = !$('panel').hidden && !$(which).hidden;
  $('info').hidden = which !== 'info';
  $('settings').hidden = which !== 'settings';
  $('panel').hidden = open;
}
$('btn-info').onclick = () => showPanel('info');
$('btn-settings').onclick = () => showPanel('settings');
$('panel').onclick = (e) => { if (e.target === $('panel')) $('panel').hidden = true; };
for (const [id, key] of [['vol-alarm', 'alarm'], ['vol-sfx', 'sfx']]) {
  $(id).value = state.vol[key];
  $(id).oninput = () => { state.vol[key] = Number($(id).value); save(); };
  $(id).onchange = () => (key === 'alarm' ? beep() : blip([660])); // preview on release
}

// ---------- shop ----------
let shopCat = 'hat';

function showScreen(name) {
  const shop = name === 'shop';
  if (shop && state.compact) { // shop needs the full window
    state.compact = false;
    window.win.compact(false);
    applyCompact();
    save();
  }
  $('screen-main').hidden = shop;
  $('screen-shop').hidden = !shop;
  document.body.classList.toggle('in-shop', shop);
  // the same mascot element is reused as the shop's live preview
  const wrap = $('mascot-wrap');
  if (shop) $('shop-preview').appendChild(wrap);
  else $('top').prepend(wrap);
  if (shop) renderShop();
}

function renderShop() {
  document.querySelectorAll('#shop-tabs button').forEach((b) =>
    b.classList.toggle('active', b.dataset.cat === shopCat));
  const grid = $('shop-grid');
  grid.innerHTML = '';
  $('prize-form').hidden = shopCat !== 'prize';
  if (shopCat === 'prize') return renderPrizes(grid);
  for (const item of SHOP.filter((i) => i.cat === shopCat)) {
    const owned = state.owned.includes(item.id);
    const equipped = state.equipped[item.cat] === item.id;
    const card = document.createElement('div');
    card.className = 'item' + (equipped ? ' equipped' : '');

    const ico = document.createElement('div');
    ico.className = 'ico';
    if (item.icon) ico.innerHTML = item.icon;
    else {
      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.background = item.color || `linear-gradient(135deg, ${item.bg} 50%, ${item.accent} 50%)`;
      ico.appendChild(sw);
    }
    const nm = document.createElement('div');
    nm.className = 'nm';
    nm.textContent = item.name;

    const btn = document.createElement('button');
    if (!owned) {
      btn.className = 'buy';
      btn.innerHTML = icon('coins', 13) + ' ' + item.price;
      btn.disabled = state.points < item.price;
      btn.onclick = () => buy(item);
    } else if (equipped) {
      btn.className = 'on';
      // hats can be taken off; colors and themes always have one active
      btn.textContent = item.cat === 'hat' ? 'Remove' : 'Equipped';
      btn.disabled = item.cat !== 'hat';
      if (item.cat === 'hat') btn.onclick = () => equip(item, true);
    } else {
      btn.className = 'eq';
      btn.textContent = 'Equip';
      btn.onclick = () => equip(item);
    }
    card.append(ico, nm, btn);
    grid.appendChild(card);
  }
}

// ---------- purchase confirmation ----------
function showReceipt({ head, icon, swatch, name, sub }) {
  $('rc-head').textContent = head;
  $('rc-name').textContent = name;
  $('rc-sub').textContent = sub;
  const ico = $('rc-ico');
  ico.innerHTML = '';
  if (icon) ico.innerHTML = icon;
  else {
    const sw = document.createElement('div');
    sw.className = 'swatch';
    sw.style.background = swatch;
    ico.appendChild(sw);
  }
  $('receipt').hidden = false;
}
$('receipt').onclick = () => { $('receipt').hidden = true; };

// ---------- custom prizes ----------
// Rewards the user defines themselves (e.g. an online purchase); claiming spends coins.
function renderPrizes(grid) {
  if (!state.prizes.length) {
    const note = document.createElement('div');
    note.className = 'empty-note';
    note.textContent = 'Add something you want to treat yourself to, set a price in coins, and earn it.';
    grid.appendChild(note);
    return;
  }
  for (const p of state.prizes) {
    const card = document.createElement('div');
    card.className = 'item prize' + (p.claimed ? ' claimed' : '');

    const ico = document.createElement('div');
    ico.className = 'ico';
    ico.innerHTML = icon(p.claimed ? 'check-circle' : 'gift', 26);
    const nm = document.createElement('div');
    nm.className = 'nm';
    nm.textContent = p.name;
    nm.title = p.name;

    const btn = document.createElement('button');
    if (p.claimed) {
      btn.className = 'on';
      btn.textContent = 'Claimed';
      btn.disabled = true;
    } else {
      btn.className = 'buy';
      btn.innerHTML = 'Claim ' + icon('coins', 13) + ' ' + p.price;
      btn.disabled = state.points < p.price;
      btn.onclick = () => claimPrize(p.id);
    }
    const rm = document.createElement('button');
    rm.className = 'rm';
    rm.innerHTML = icon('x', 12);
    rm.setAttribute('aria-label', 'Remove prize');
    rm.title = 'Remove';
    rm.onclick = () => { state.prizes = state.prizes.filter((x) => x.id !== p.id); save(); renderShop(); };

    card.append(ico, nm, btn, rm);
    grid.appendChild(card);
  }
}
function claimPrize(id) {
  const p = state.prizes.find((x) => x.id === id);
  if (!p || p.claimed || state.points < p.price) return;
  state.points -= p.price; // spend coins only; lifetime (level) is untouched
  p.claimed = true;
  save();
  renderPoints();
  renderShop();
  cheer(`Enjoy: ${p.name}!`);
  showReceipt({ head: 'Prize claimed', icon: icon('gift', 56), name: p.name, sub: `${p.price} coins spent, ${state.points} left` });
}
$('prize-form').onsubmit = (e) => {
  e.preventDefault();
  const name = $('prize-name').value.trim();
  const price = Math.floor(Number($('prize-price').value));
  if (!name || !(price > 0)) return;
  state.prizes.push({ id: Date.now() + Math.random(), name, price, claimed: false });
  $('prize-name').value = '';
  $('prize-price').value = '';
  save();
  renderShop();
};

function buy(item) {
  if (state.owned.includes(item.id) || state.points < item.price) return;
  state.points -= item.price; // spend coins only; lifetime (level) is untouched
  state.owned.push(item.id);
  state.equipped[item.cat] = item.id;
  save();
  applyLook();
  renderPoints();
  renderShop();
  cheer(`Ooh, ${item.name.toLowerCase()}!`);
  showReceipt({
    head: 'Purchased', icon: item.icon,
    swatch: item.color || `linear-gradient(135deg, ${item.bg} 50%, ${item.accent} 50%)`,
    name: item.name, sub: `${item.price} coins spent, ${state.points} left`
  });
}
function equip(item, remove = false) {
  state.equipped[item.cat] = remove ? null : item.id;
  save();
  applyLook();
  renderShop();
}

$('btn-shop').onclick = () => showScreen($('screen-shop').hidden ? 'shop' : 'main');
$('shop-back').onclick = () => showScreen('main');
document.querySelectorAll('#shop-tabs button').forEach((b) => (b.onclick = () => { shopCat = b.dataset.cat; renderShop(); }));
mascot.onclick = () => {
  const lines = ['Rock solid!', 'You got this.', 'One thing at a time.', 'Hydrate!', 'Stretch your shoulders.', '...pet accepted.'];
  cheer(lines[Math.floor(Math.random() * lines.length)]);
};

// ---------- init ----------
applyLook();
renderTimer();
renderPoints();
renderTodos();
applyCompact();
applyPin();
window.win.pin(state.pinned);
if (state.compact) window.win.compact(true);
setTimeout(() => say('Hi! Ready to focus?'), 400);
