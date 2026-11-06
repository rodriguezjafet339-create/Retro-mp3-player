const textBox = document.getElementById("text_output");
const authorTrack = document.getElementById("author_track");
const songProgress = document.getElementsByClassName("player-progress");
const playButton = document.getElementById("Play_pause");
const audio = document.querySelector("audio");
const currentTime = document.getElementById("current");
const totalTime = document.getElementById("total");
const progressBar = document.getElementById("progress-bar");
const SKIP_SECONDS = 10;
const RESTART_THRESHOLD = 3;
const themeLink = document.getElementById("theme");
const THEMES = ["classic.css", "wine.css"];
let themeIndex = 0;

let songs = [];
let index = 0;
let isPaused = false;
let textBoxWidth = textBox.clientWidth;
let failedInARow = 0;

const scroller = marquee(textBox, authorTrack, {
  speed: 0.5,
  width: textBoxWidth,
});
let stopBlinks = [];

playButton.textContent = "❚❚";
scroller.start();

playButton.addEventListener("click", () => {
  if (!songs.length || audio.error) return;
  setPaused(!isPaused);
});

document.getElementById("Next").addEventListener("click", () => {
  if (songs.length) changeSong(index + 1);
});

document.getElementById("Previous").addEventListener("click", () => {
  if (!songs.length) return;
  if (audio.currentTime > RESTART_THRESHOLD) {
    audio.currentTime = 0;
    updateProgress();
    scroller.reset();
    if (isPaused) setPaused(false);
  } else {
    changeSong(index - 1);
  }
});

document.getElementById("Volume_up").addEventListener("click", () => {
  setVolume(audio.volume + 0.1);
});

document.getElementById("Volume_down").addEventListener("click", () => {
  setVolume(audio.volume - 0.1);
});

audio.addEventListener("ended", () => loadSong(index + 1));

audio.addEventListener("loadedmetadata", () => {
  failedInARow = 0;
  totalTime.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", updateProgress);

audio.addEventListener("error", () => {
  failedInARow++;
  if (failedInARow >= songs.length) {
    authorTrack.textContent = "No playable songs";
    if (!isPaused) setPaused(true);
    scroller.reset(0);
    return;
  }
  loadSong(index + 1);
});

audio.addEventListener("playing", () => {
  failedInARow = 0;
});

document.getElementById("forwards").addEventListener("click", () => {
  if (!songs.length || !audio.duration) return;
  const target = audio.currentTime + SKIP_SECONDS;
  if (target >= audio.duration) {
    changeSong(index + 1);
    return;
  }
  audio.currentTime = target;
  updateProgress();
});

document.getElementById("backwards").addEventListener("click", () => {
  if (!songs.length) return;
  audio.currentTime = Math.max(0, audio.currentTime - SKIP_SECONDS);
  updateProgress();
});

document.getElementById("glass").addEventListener("dblclick", () => {
  themeIndex = (themeIndex + 1) % THEMES.length;
  applyTheme(THEMES[themeIndex]);
  window.api.saveState({ theme: THEMES[themeIndex] });
});

document
  .getElementById("win-min")
  .addEventListener("click", () => window.api.minimize());
document
  .getElementById("win-close")
  .addEventListener("click", () => window.api.close());

function playAudio() {
  audio.play().catch((err) => {
    if (err.name === "NotAllowedError" && !isPaused) setPaused(true);
  });
}

function loadSong(i) {
  index = (i + songs.length) % songs.length;
  const song = songs[index];
  audio.src = song.url;
  window.api.saveState({ lastSongPath: song.path });
  authorTrack.textContent = song.title;
  scroller.reset();
  updateProgress();
  totalTime.textContent = "0:00";
  if (!isPaused) playAudio();
}

function applyTheme(name) {
  return new Promise((resolve) => {
    if (themeLink.getAttribute("href") === name) return resolve();
    themeLink.addEventListener("load", resolve, { once: true });
    themeLink.addEventListener("error", resolve, { once: true });
    themeLink.href = name;
  });
}

function changeSong(i) {
  failedInARow = 0;
  loadSong(i);
  if (isPaused) setPaused(false);
}

function setPaused(paused) {
  isPaused = paused;
  playButton.textContent = paused ? "▶" : "❚❚";
  if (paused) {
    audio.pause();
    pausedAnimation();
  } else {
    playAudio();
    playAnimation();
  }
}

function setVolume(v) {
  audio.volume = Math.round(Math.min(1, Math.max(0, v)) * 10) / 10;
  window.api.saveState({ volume: audio.volume });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function updateProgress() {
  currentTime.textContent = formatTime(audio.currentTime);
  const percent = audio.duration
    ? (audio.currentTime / audio.duration) * 100
    : 0;
  progressBar.style.width = `${percent}%`;
}

function pausedAnimation() {
  scroller.stop();
  stopBlinks = [
    blink(songProgress[0], { duration: 1000, minOpacity: 0.2 }),
    blink(authorTrack, { duration: 1000, minOpacity: 0.2 }),
  ];
}

function playAnimation() {
  stopBlinks.forEach((stop) => stop());
  stopBlinks = [];
  scroller.start();
}

function marquee(container, track, { speed = 1, width } = {}) {
  const getWidth = () => width ?? container.clientWidth;
  let x = getWidth();
  let frameId = null;

  function applyPosition() {
    track.style.transform = `translateX(${x}px)`;
  }

  function step() {
    x -= speed;

    if (x < -track.offsetWidth) {
      x = getWidth();
    }

    applyPosition();
    frameId = requestAnimationFrame(step);
  }

  return {
    start() {
      if (frameId === null) step();
    },
    stop() {
      cancelAnimationFrame(frameId);
      frameId = null;
    },
    reset(startX = getWidth()) {
      x = startX;
      applyPosition();
    },
  };
}

function blink(el, { duration = 1000, minOpacity = 0 } = {}) {
  const anim = el.animate([{ opacity: 1 }, { opacity: minOpacity }], {
    duration,
    iterations: Infinity,
    direction: "alternate",
    easing: "ease-in-out",
  });
  return () => anim.cancel();
}

async function init() {
  const [list, state] = await Promise.all([
    window.api.getSongs(),
    window.api.getState(),
  ]);
  songs = list;

  themeIndex = Math.max(0, THEMES.indexOf(state.theme));
  await applyTheme(THEMES[themeIndex]);
  document.body.style.visibility = "visible";

  audio.volume = state.volume;

  if (songs.length === 0) {
    authorTrack.textContent = "No songs found in your Music folder";
    return;
  }

  const saved = songs.findIndex((s) => s.path === state.lastSongPath);
  loadSong(saved === -1 ? 0 : saved);
}

init();
