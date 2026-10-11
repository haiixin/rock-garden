// Shared mascot artwork + look helper (used by the main window and the desktop pet window).
const MASCOT_SVG = `<svg id="mascot" viewBox="0 0 100 90" class="idle">
          <ellipse cx="50" cy="84" rx="30" ry="5" fill="rgba(0,0,0,.25)"/>
          <path id="rock" d="M14 74 C8 50 22 22 50 18 C78 22 92 50 86 74 C80 82 20 82 14 74 Z" fill="#8d96a0"/>
          <path d="M30 34 C38 26 50 24 58 26" stroke="#ffffff" stroke-opacity=".35" stroke-width="4" fill="none" stroke-linecap="round"/>
          <circle cx="70" cy="68" r="3" fill="#000" fill-opacity=".12"/><circle cx="26" cy="70" r="2.4" fill="#000" fill-opacity=".12"/>
          <g id="moss" opacity="0">
            <path d="M30 24 C36 14 44 18 50 20 C56 14 66 14 70 26 C60 24 40 24 30 24Z" fill="#6fae5a"/>
            <circle cx="40" cy="19" r="3" fill="#8bc873"/>
          </g>
          <ellipse class="eye" cx="38" cy="52" rx="4" ry="5" fill="#222"/>
          <ellipse class="eye" cx="62" cy="52" rx="4" ry="5" fill="#222"/>
          <path d="M43 62 Q50 68 57 62" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <ellipse cx="30" cy="60" rx="4" ry="2.5" fill="#e59aa0" opacity=".6"/>
          <ellipse cx="70" cy="60" rx="4" ry="2.5" fill="#e59aa0" opacity=".6"/>

          <!-- accessories (one equipped at a time) -->
          <g class="acc" id="acc-party">
            <path d="M38 24 L50 -4 L62 24 Z" fill="#e2557a"/>
            <path d="M43 14 L57 14" stroke="#ffd34d" stroke-width="3"/>
            <circle cx="50" cy="-5" r="3.2" fill="#ffd34d"/>
          </g>
          <g class="acc" id="acc-crown">
            <path d="M34 24 L36 6 L43 15 L50 3 L57 15 L64 6 L66 24 Z" fill="#f2c230" stroke="#c99a12" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="50" cy="17" r="2.2" fill="#d6405a"/><circle cx="41" cy="19" r="1.6" fill="#4aa3df"/><circle cx="59" cy="19" r="1.6" fill="#4aa3df"/>
          </g>
          <g class="acc" id="acc-tophat">
            <rect x="38" y="2" width="24" height="20" rx="2" fill="#2b2b2b"/>
            <rect x="38" y="14" width="24" height="4" fill="#b33a3a"/>
            <rect x="31" y="20" width="38" height="5" rx="2.5" fill="#1b1b1b"/>
          </g>
          <g class="acc" id="acc-glasses">
            <circle cx="38" cy="52" r="7.5" fill="#111"/><circle cx="62" cy="52" r="7.5" fill="#111"/>
            <path d="M45 51 H55" stroke="#111" stroke-width="2.4"/>
            <path d="M34 48 L38 46" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M58 48 L62 46" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/>
          </g>
          <g class="acc" id="acc-bow">
            <path d="M64 24 L77 16 L77 32 Z" fill="#e2557a"/><path d="M64 24 L51 16 L51 32 Z" fill="#e2557a"/>
            <circle cx="64" cy="24" r="3.8" fill="#c23f63"/>
          </g>
          <g class="acc" id="acc-flower">
            <g fill="#fff"><circle cx="66" cy="19" r="3.4"/><circle cx="71" cy="24" r="3.4"/><circle cx="66" cy="29" r="3.4"/><circle cx="61" cy="24" r="3.4"/></g>
            <circle cx="66" cy="24" r="3" fill="#f2c230"/>
          </g>

          <text id="zzz" x="72" y="30" font-size="12" fill="#cfd8e3" opacity="0">z z</text>
        </svg>`;

// look = { hat: id|null, color: '#hex', moss: 0..1 }
function applyMascotLook(svg, look) {
  svg.querySelectorAll('.acc').forEach((g) => g.classList.toggle('on', g.id === 'acc-' + look.hat));
  svg.querySelector('#rock').setAttribute('fill', look.color);
  svg.querySelector('#moss').setAttribute('opacity', look.moss);
}
