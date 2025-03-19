const powerStatus = document.getElementById('power-status');
const volumeDisplay = document.getElementById('volume');
const channelDisplay = document.getElementById('channel');
const ottStatus = document.getElementById('ott-status');
const ottContent = document.getElementById('ott-content');
const favoritesList = document.getElementById('favorites-list');
const powerBtn = document.getElementById('power');
const voiceBtn = document.getElementById('voice');
const touchpad = document.getElementById('touchpad');
const volUp = document.getElementById('vol-up');
const volDown = document.getElementById('vol-down');
const chUp = document.getElementById('ch-up');
const chDown = document.getElementById('ch-down');
const muteBtn = document.getElementById('mute');
const backBtn = document.getElementById('back');
const homeBtn = document.getElementById('home');
const favBtn = document.getElementById('fav');
const youtubeBtn = document.getElementById('youtube');
const netflixBtn = document.getElementById('netflix');
const favoritesBtn = document.getElementById('favorites-btn');
const settingsBtn = document.getElementById('settings-btn');
const ottPlay = document.getElementById('ott-play');
const ottPause = document.getElementById('ott-pause');
const ottStop = document.getElementById('ott-stop');
const ottPrev = document.getElementById('ott-prev');
const ottNext = document.getElementById('ott-next');
const ottBack = document.getElementById('ott-back');
const favBack = document.getElementById('fav-back');
const settingsBack = document.getElementById('settings-back');
const numButtons = document.querySelectorAll('.numpad button');
const navButtonsMain = document.querySelectorAll('#main-page .navigation button');
const navButtonsOtt = document.querySelectorAll('#ott-page .navigation button');
let isOn = false;
let volume = 50;
let currentChannel = 1;
let favoriteChannels = [];
let channelInput = '';
let currentPage = 'main-page';
let ottMode = null;
let ottPlaying = false;
let ottPosition = 0;

let beepVolume = 1;
let vibrationEnabled = true;
let speechEnabled = true;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(frequency = 440, duration = 0.1) {
  if (beepVolume <= 0) return;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gainNode.gain.value = beepVolume;
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

function vibrate(duration = 100) {
  if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(duration);
}

function speak(text) {
  if (speechEnabled) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
}

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  currentPage = pageId;
  playBeep(550);
  vibrate(50);
  speak(`${pageId.replace('-page', '')} page`);
  if (pageId === 'favorites-page') updateFavoritesList();
}

function updateDisplay(action = '') {
  powerStatus.textContent = action || `Power: ${isOn ? 'On' : 'Off'}`;
  volumeDisplay.textContent = `Volume: ${volume}%`;
  channelDisplay.textContent = `Channel: ${currentChannel}${favoriteChannels.includes(currentChannel) ? ' ⭐' : ''}`;
}

function updateOttDisplay(action = '') {
  ottStatus.textContent = action || (ottMode ? `${ottMode.charAt(0).toUpperCase() + ottMode.slice(1)} Mode` : 'OTT Mode');
  ottContent.textContent = ottPlaying ? `Playing (Pos: ${ottPosition})` : 'Paused/Stopped';
}

function updateFavoritesList() {
  favoritesList.innerHTML = '';
  favoriteChannels.forEach(channel => {
    const btn = document.createElement('button');
    btn.textContent = `${channel} ⭐`;
    btn.addEventListener('click', () => {
      if (isOn) {
        currentChannel = channel;
        switchPage('main-page');
        updateDisplay(`Switched to Channel ${channel}`);
        speak(`Channel ${channel}`);
      }
    });
    favoritesList.appendChild(btn);
  });
  if (favoriteChannels.length === 0) {
    favoritesList.innerHTML = '<span style="font-size: 12px; color: #b0bec5;">No favorites yet</span>';
  }
}

powerBtn.addEventListener('click', () => {
  isOn = !isOn;
  powerBtn.textContent = isOn ? '🟢' : '🔴';
  powerBtn.classList.toggle('on', isOn);
  playBeep(isOn ? 600 : 400);
  vibrate(200);
  speak(isOn ? 'Power on' : 'Power off');
  updateDisplay();
});

volUp.addEventListener('click', () => {
  if (isOn && volume < 100) {
    volume = Math.min(100, volume + 10);
    playBeep(500);
    vibrate(50);
    speak(`Volume ${volume} percent`);
    updateDisplay(`Volume Up ${volume}%`);
  }
});
volDown.addEventListener('click', () => {
  if (isOn && volume > 0) {
    volume = Math.max(0, volume - 10);
    playBeep(450);
    vibrate(50);
    speak(`Volume ${volume} percent`);
    updateDisplay(`Volume Down ${volume}%`);
  }
});
chUp.addEventListener('click', () => {
  if (isOn) {
    currentChannel = Math.min(999, currentChannel + 1);
    channelInput = '';
    playBeep(520);
    vibrate(50);
    speak(`Channel ${currentChannel}`);
    updateDisplay(`Channel Up ${currentChannel}`);
  }
});
chDown.addEventListener('click', () => {
  if (isOn && currentChannel > 1) {
    currentChannel = Math.max(1, currentChannel - 1);
    channelInput = '';
    playBeep(480);
    vibrate(50);
    speak(`Channel ${currentChannel}`);
    updateDisplay(`Channel Down ${currentChannel}`);
  }
});

numButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (isOn) {
      channelInput += btn.textContent;
      if (channelInput.length > 3) channelInput = channelInput.slice(-3);
      playBeep(500 + parseInt(btn.textContent) * 10);
      vibrate(30);
      speak(btn.textContent);
      updateDisplay(`Entering Channel ${channelInput}`);
    }
  });
});

document.querySelector('#main-page .ok').addEventListener('click', () => {
  if (isOn && channelInput) {
    currentChannel = Math.max(1, Math.min(999, parseInt(channelInput)));
    channelInput = '';
    playBeep(600);
    vibrate(100);
    speak(`Channel ${currentChannel} set`);
    updateDisplay(`Set to Channel ${currentChannel}`);
  }
});

navButtonsMain.forEach(btn => {
  if (btn !== document.querySelector('#main-page .ok')) {
    btn.addEventListener('click', () => {
      if (isOn) {
        const direction = btn.textContent === '⬆️' ? 'Up' :
                         btn.textContent === '⬇️' ? 'Down' :
                         btn.textContent === '⬅️' ? 'Left' : 'Right';
        playBeep(550);
        vibrate(50);
        speak(`Navigate ${direction}`);
        updateDisplay(`Navigate ${direction}`);
      }
    });
  }
});

navButtonsOtt.forEach(btn => {
  btn.addEventListener('click', () => {
    if (isOn && ottMode) {
      const direction = btn.textContent;
      if (direction === '⬆️' && volume < 100) volume = Math.min(100, volume + 10);
      else if (direction === '⬇️' && volume > 0) volume = Math.max(0, volume - 10);
      else if (direction === '➡️') ottPosition += 10;
      else if (direction === '⬅️' && ottPosition > 0) ottPosition -= 10;
      else if (direction === '✅' && !ottPlaying) {
        ottPlaying = true;
        updateOttDisplay(`${ottMode} Playing`);
        speak(`${ottMode} playing`);
        return;
      }
      playBeep(550);
      vibrate(50);
      speak(direction === '⬆️' || direction === '⬇️' ? `Volume ${volume} percent` : `Navigate ${direction === '➡️' ? 'Forward' : 'Backward'}`);
      updateOttDisplay();
    }
  });
});

muteBtn.addEventListener('click', () => {
  if (isOn) {
    volume = 0;
    playBeep(400);
    vibrate(150);
    speak('Muted');
    updateDisplay('Muted');
  }
});
backBtn.addEventListener('click', () => {
  if (isOn) {
    playBeep(500);
    vibrate(50);
    speak('Back');
    updateDisplay('Back');
  }
});
homeBtn.addEventListener('click', () => {
  if (isOn) {
    switchPage('main-page');
    updateDisplay('Home');
  }
});

favBtn.addEventListener('click', () => {
  if (isOn) {
    if (favoriteChannels.includes(currentChannel)) {
      favoriteChannels = favoriteChannels.filter(ch => ch !== currentChannel);
      playBeep(450);
      speak('Favorite removed');
      updateDisplay('Favorite Removed');
    } else if (favoriteChannels.length < 9) {
      favoriteChannels.push(currentChannel);
      playBeep(600);
      speak(`Favorite set to channel ${currentChannel}`);
      updateDisplay(`Favorite Set to ${currentChannel}`);
    }
    vibrate(100);
  }
});

youtubeBtn.addEventListener('click', () => {
  if (isOn) {
    ottMode = 'youtube';
    ottPosition = 0;
    switchPage('ott-page');
    updateOttDisplay('YouTube Selected');
    speak('YouTube mode');
  }
});

netflixBtn.addEventListener('click', () => {
  if (isOn) {
    ottMode = 'netflix';
    ottPosition = 0;
    switchPage('ott-page');
    updateOttDisplay('Netflix Selected');
    speak('Netflix mode');
  }
});

ottPlay.addEventListener('click', () => {
  if (isOn && ottMode) {
    ottPlaying = true;
    playBeep(600);
    vibrate(50);
    speak(`${ottMode} playing`);
    updateOttDisplay(`${ottMode} Playing`);
  }
});
ottPause.addEventListener('click', () => {
  if (isOn && ottMode) {
    ottPlaying = false;
    playBeep(550);
    vibrate(50);
    speak(`${ottMode} paused`);
    updateOttDisplay(`${ottMode} Paused`);
  }
});
ottStop.addEventListener('click', () => {
  if (isOn && ottMode) {
    ottPlaying = false;
    ottPosition = 0;
    playBeep(500);
    vibrate(50);
    speak(`${ottMode} stopped`);
    updateOttDisplay(`${ottMode} Stopped`);
  }
});
ottPrev.addEventListener('click', () => {
  if (isOn && ottMode && ottPosition > 0) {
    ottPosition -= 10;
    playBeep(520);
    vibrate(50);
    speak(`${ottMode} previous`);
    updateOttDisplay(`${ottMode} Previous`);
  }
});
ottNext.addEventListener('click', () => {
  if (isOn && ottMode) {
    ottPosition += 10;
    playBeep(540);
    vibrate(50);
    speak(`${ottMode} next`);
    updateOttDisplay(`${ottMode} Next`);
  }
});
ottBack.addEventListener('click', () => {
  if (isOn) {
    ottMode = null;
    ottPlaying = false;
    switchPage('main-page');
    updateDisplay('Home');
  }
});

favoritesBtn.addEventListener('click', () => {
  if (isOn) {
    switchPage('favorites-page');
  }
});

favBack.addEventListener('click', () => {
  if (isOn) {
    switchPage('main-page');
    updateDisplay('Home');
  }
});

settingsBtn.addEventListener('click', () => {
  if (isOn) {
    switchPage('settings-page');
  }
});

settingsBack.addEventListener('click', () => {
  if (isOn) {
    switchPage('main-page');
    updateDisplay('Home');
  }
});

document.getElementById('beep-volume').addEventListener('change', (e) => {
  beepVolume = parseFloat(e.target.value);
  playBeep(500);
  speak(`Beep volume ${beepVolume === 0 ? 'off' : beepVolume > 1 ? 'high' : beepVolume < 1 ? 'low' : 'normal'}`);
});
document.getElementById('vibration').addEventListener('change', (e) => {
  vibrationEnabled = e.target.value === 'true';
  vibrate(100);
  speak(`Vibration ${vibrationEnabled ? 'on' : 'off'}`);
});
document.getElementById('speech').addEventListener('change', (e) => {
  speechEnabled = e.target.value === 'true';
  speak(`Speech ${speechEnabled ? 'on' : 'off'}`);
});
document.getElementById('theme').addEventListener('change', (e) => {
  const theme = e.target.value;
  document.body.style.background = theme === 'light' ?
    'linear-gradient(to bottom, #eceff1, #b0bec5)' :
    'linear-gradient(to bottom, #cfd8dc, #90a4ae)';
  speak(`Theme set to ${theme}`);
});

let startX = 0, startY = 0;
touchpad.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  playBeep(500);
  vibrate(30);
});
touchpad.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
touchpad.addEventListener('touchend', e => {
  if (!isOn) return;
  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
    currentChannel = deltaX > 0 ? Math.min(999, currentChannel + 1) : Math.max(1, currentChannel - 1);
    playBeep(deltaX > 0 ? 520 : 480);
    speak(`Channel ${currentChannel}`);
    updateDisplay(deltaX > 0 ? 'Channel Up' : 'Channel Down');
  } else if (Math.abs(deltaY) > 30) {
    volume = deltaY > 0 ? Math.max(0, volume - 10) : Math.min(100, volume + 10);
    playBeep(deltaY > 0 ? 450 : 500);
    speak(`Volume ${volume} percent`);
    updateDisplay(deltaY > 0 ? 'Volume Down' : 'Volume Up');
  }
  vibrate(50);
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let listeningInterval;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;

  voiceBtn.addEventListener('click', () => {
    if (isOn) {
      recognition.start();
      voiceBtn.classList.add('listening');
      playBeep(600);
      vibrate(100);
      speak('Listening');
      powerStatus.textContent = 'Listening... 🎤';
      listeningInterval = setInterval(() => {
        if (voiceBtn.classList.contains('listening')) {
          speak('Say a command');
          playBeep(550, 0.05);
        }
      }, 3000);
    }
  });

  recognition.onresult = event => {
    const command = event.results[0][0].transcript.toLowerCase();
    clearInterval(listeningInterval);
    powerStatus.textContent = `Heard: ${command}`;
    playBeep(700);
    vibrate(150);
    if (command.includes('power off') && isOn) {
      isOn = false;
      powerBtn.textContent = '🔴';
      powerBtn.classList.remove('on');
      speak('Power off');
    } else if (command.includes('power on') && !isOn) {
      isOn = true;
      powerBtn.textContent = '🟢';
      powerBtn.classList.add('on');
      speak('Power on');
    } else if (isOn) {
      if (command.includes('volume up')) {
        volume = Math.min(100, volume + 10);
        speak(`Volume ${volume} percent`);
      } else if (command.includes('volume down')) {
        volume = Math.max(0, volume - 10);
        speak(`Volume ${volume} percent`);
      } else if (command.includes('channel up')) {
        currentChannel = Math.min(999, currentChannel + 1);
        speak(`Channel ${currentChannel}`);
      } else if (command.includes('channel down')) {
        currentChannel = Math.max(1, currentChannel - 1);
        speak(`Channel ${currentChannel}`);
      } else if (command.includes('mute')) {
        volume = 0;
        speak('Muted');
      } else if (command.includes('favorite')) {
        if (!favoriteChannels.includes(currentChannel) && favoriteChannels.length < 9) {
          favoriteChannels.push(currentChannel);
          speak(`Favorite set to channel ${currentChannel}`);
        }
      } else if (command.includes('go to favorite') && favoriteChannels.length > 0) {
        currentChannel = favoriteChannels[0];
        speak(`Channel ${currentChannel}`);
      } else if (command.match(/channel \d+/)) {
        const channel = parseInt(command.match(/\d+/)[0]);
        currentChannel = Math.max(1, Math.min(999, channel));
        speak(`Channel ${currentChannel}`);
      } else if (command.includes('youtube')) {
        ottMode = 'youtube';
        ottPosition = 0;
        switchPage('ott-page');
        speak('YouTube mode');
      } else if (command.includes('netflix')) {
        ottMode = 'netflix';
        ottPosition = 0;
        switchPage('ott-page');
        speak('Netflix mode');
      } else if (command.includes('play') && ottMode) {
        ottPlaying = true;
        speak(`${ottMode} playing`);
        updateOttDisplay(`${ottMode} Playing`);
      } else if (command.includes('pause') && ottMode) {
        ottPlaying = false;
        speak(`${ottMode} paused`);
        updateOttDisplay(`${ottMode} Paused`);
      } else if (command.includes('stop') && ottMode) {
        ottPlaying = false;
        ottPosition = 0;
        speak(`${ottMode} stopped`);
        updateOttDisplay(`${ottMode} Stopped`);
      } else if (command.includes('favorites')) {
        switchPage('favorites-page');
      } else if (command.includes('settings')) {
        switchPage('settings-page');
      }
    }
    setTimeout(() => currentPage === 'main-page' ? updateDisplay() : currentPage === 'ott-page' ? updateOttDisplay() : null, 1000);
  };

  recognition.onend = () => {
    clearInterval(listeningInterval);
    voiceBtn.classList.remove('listening');
    currentPage === 'main-page' ? updateDisplay() : currentPage === 'ott-page' ? updateOttDisplay() : null;
  };

  recognition.onerror = event => {
    clearInterval(listeningInterval);
    powerStatus.textContent = `Voice Error: ${event.error}`;
    voiceBtn.classList.remove('listening');
    speak(`Error: ${event.error}`);
    setTimeout(updateDisplay, 1000);
  };
} else {
  voiceBtn.textContent = '🎙️';
  voiceBtn.disabled = true;
}

updateDisplay();