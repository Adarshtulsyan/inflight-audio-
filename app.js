const audio = document.getElementById("audio");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const status = document.getElementById("status");
const player = document.getElementById("player");
const progressFill = document.getElementById("progress-fill");
const currentTimeEl = document.getElementById("current-time");
const remainingTimeEl = document.getElementById("remaining-time");
const downloadPrompt = document.getElementById("download-prompt");
const earphoneRow = document.getElementById("earphone-row");
const earphoneText = document.getElementById("earphone-text");
const confirmBtn = document.getElementById("confirm-earphones");

let timeoutId = null;
let audioReady = false;
let earphonesConfirmed = false;

const GLOBAL_START_TIME = new Date("2026-04-20T18:20:00").getTime();

// ── Earphone confirmation ─────────────────────────────────────────────────────

earphoneText.innerText = "Plug in earphones or connect Bluetooth, then tap below";
confirmBtn.style.display = "inline-block";

confirmBtn.onclick = () => {
  earphonesConfirmed = true;
  earphoneRow.className = "confirmed";
  earphoneText.innerText = "Earphones confirmed";
  confirmBtn.style.display = "none";
  updateStartButton();
};

// ── Audio file check ──────────────────────────────────────────────────────────

audio.addEventListener("loadedmetadata", () => {
  audioReady = true;
  status.innerText = "Ready";
  downloadPrompt.style.display = "none";
  updateStartButton();
});

audio.addEventListener("error", () => {
  audioReady = false;
  status.innerText = "Audio unavailable";
  downloadPrompt.style.display = "block";
  updateStartButton();
});

function updateStartButton() {
  startBtn.disabled = !(audioReady && earphonesConfirmed);
}

// ── Playback ──────────────────────────────────────────────────────────────────

function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

audio.addEventListener("timeupdate", () => {
  if (!audio.duration || isNaN(audio.duration)) return;
  const current = audio.currentTime;
  const remaining = audio.duration - current;
  progressFill.style.width = `${(current / audio.duration) * 100}%`;
  currentTimeEl.innerText = formatTime(current);
  remainingTimeEl.innerText = `-${formatTime(remaining)}`;
});

function showPlayer() { player.style.display = "block"; }

function hidePlayer() {
  player.style.display = "none";
  progressFill.style.width = "0%";
  currentTimeEl.innerText = "0:00";
  remainingTimeEl.innerText = "-0:00";
}

startBtn.onclick = async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  try {
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
  } catch (e) {
    console.log("Audio unlock failed:", e);
  }

  const now = Date.now();
  const delay = GLOBAL_START_TIME - now;

  if (delay > 0) {
    status.innerText = `⏳ Starts in ${Math.floor(delay / 1000)}s`;
    timeoutId = setTimeout(() => {
      audio.currentTime = 0;
      audio.play().catch(err => console.log("Play error:", err));
      status.innerText = "▶️ Playing";
      showPlayer();
    }, delay);
  } else {
    const secondsLate = Math.abs(delay) / 1000;
    audio.currentTime = secondsLate;
    audio.play().catch(err => console.log("Play error:", err));
    status.innerText = "▶️ Joined in sync";
    showPlayer();
  }
};

stopBtn.onclick = () => {
  if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
  audio.pause();
  audio.currentTime = 0;
  status.innerText = "Stopped";
  stopBtn.disabled = true;
  startBtn.disabled = !earphonesConfirmed;
  hidePlayer();
};
