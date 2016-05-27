"use strict";
const player = document.getElementById('player'),
  width = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth,
  match = player.currentSrc.match(/^(.+)\-\d+\.(.+)$/);

if (width > 1280) {
  player.src = match[1] + '-720.' + match[2];
} else if (width > 854) {
  player.src = match[1] + '-480.' + match[2];
}
