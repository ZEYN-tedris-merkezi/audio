
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function applyTheme(){
  const dark = localStorage.getItem('zeyn-theme') === 'dark';
  document.body.classList.toggle('dark', dark);
  const btn = $('#themeBtn');
  if(btn) btn.textContent = dark ? '☀️ Light mode' : '🌙 Dark mode';
}

function updateNetwork(){
  $$('.network').forEach(el=>{
    el.textContent = navigator.onLine ? 'Online' : 'Offline mode';
    el.classList.toggle('offline', !navigator.onLine);
  });
}

function setupInstall(){
  let deferred;
  window.addEventListener('beforeinstallprompt', e=>{
    e.preventDefault();
    deferred = e;
    const btn = $('#installBtn');
    if(btn) btn.style.display = 'inline-flex';
  });
  $('#installBtn')?.addEventListener('click', async()=>{
    if(!deferred){
      alert('Use your browser menu and choose “Add to Home Screen”.');
      return;
    }
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    $('#installBtn').style.display = 'none';
  });
}

function setupIndex(){
  const last = Number(localStorage.getItem('zeyn-last-test') || 0);
  if(last >= 1 && last <= 27){
    const c = $('#continueCard');
    if(c){
      c.href = `test${String(last).padStart(2,'0')}.html`;
      $('#continueTitle').textContent = `Movers Test ${last}`;
      c.classList.add('show');
    }
  }

  const completed = [...new Set(JSON.parse(localStorage.getItem('zeyn-completed') || '[]').map(Number))]
    .filter(n=>n>=1 && n<=27);
  const done = completed.length;
  const remain = 27 - done;
  const pct = Math.round(done / 27 * 100);

  if($('#completedCount')) $('#completedCount').textContent = done;
  if($('#remainingCount')) $('#remainingCount').textContent = remain;
  if($('#progressText')) $('#progressText').textContent = `${done} of 27 tests completed`;
  if($('#progressBar')) $('#progressBar').style.width = `${pct}%`;

  $('#search')?.addEventListener('input', e=>{
    const q = e.target.value.trim().toLowerCase();
    $$('.test-card').forEach(card=>{
      card.style.display = card.dataset.search.includes(q) ? 'grid' : 'none';
    });
  });

  document.addEventListener('keydown', e=>{
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k'){
      e.preventDefault();
      $('#search')?.focus();
    }
  });
}

function fmt(seconds){
  if(!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds/60);
  const s = Math.floor(seconds%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

async function swMessage(message){
  if(!('serviceWorker' in navigator)) throw new Error('Service Worker unavailable');
  const reg = await navigator.serviceWorker.ready;
  if(!reg.active) throw new Error('Service Worker inactive');
  return new Promise((resolve,reject)=>{
    const channel = new MessageChannel();
    channel.port1.onmessage = e=>{
      if(e.data?.ok) resolve(e.data);
      else reject(new Error(e.data?.error || 'Offline action failed'));
    };
    reg.active.postMessage(message,[channel.port2]);
  });
}

function setupPlayer(){
  const audio = $('#audio');
  if(!audio) return;

  const test = Number(document.body.dataset.test);
  localStorage.setItem('zeyn-last-test', String(test));

  const playBtn = $('#playMain');
  const status = $('#status');
  const statusText = $('#statusText');
  const bar = $('#bar');
  const time = $('#timeText');
  const percent = $('#percentText');
  const speed = $('#speed');
  const savedSpeed = Number(localStorage.getItem('zeyn-speed') || 1);
  audio.playbackRate = savedSpeed;
  speed.value = String(savedSpeed);

  function setStatus(textValue, cls=''){
    statusText.textContent = textValue;
    status.className = `status ${cls}`;
  }

  function updatePlayIcon(){
    playBtn.textContent = audio.paused ? '▶' : 'Ⅱ';
  }

  audio.addEventListener('loadedmetadata', ()=>{
    const saved = Number(localStorage.getItem(`zeyn-progress-${test}`) || 0);
    if(saved > 5 && saved < audio.duration - 10) audio.currentTime = saved;
    time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  });

  audio.addEventListener('play', ()=>{
    setStatus('Listening…','playing');
    updatePlayIcon();
  });

  audio.addEventListener('pause', ()=>{
    if(!audio.ended) setStatus('Paused');
    updatePlayIcon();
  });

  audio.addEventListener('timeupdate', ()=>{
    const pct = audio.duration ? (audio.currentTime/audio.duration)*100 : 0;
    bar.style.width = `${pct}%`;
    time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    percent.textContent = `${Math.round(pct)}%`;
    localStorage.setItem(`zeyn-progress-${test}`, String(audio.currentTime));
  });

  playBtn.addEventListener('click', ()=> audio.paused ? audio.play() : audio.pause());
  $('#backBtn').addEventListener('click', ()=> audio.currentTime = Math.max(0, audio.currentTime-10));
  $('#forwardBtn').addEventListener('click', ()=> audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime+10));
  $('#restartBtn').addEventListener('click', ()=>{audio.currentTime=0;audio.play();});
  speed.addEventListener('change', ()=>{
    audio.playbackRate = Number(speed.value);
    localStorage.setItem('zeyn-speed', speed.value);
  });

  $('#progress').addEventListener('click', e=>{
    if(!audio.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX-r.left)/r.width)*audio.duration;
  });

  document.addEventListener('keydown', e=>{
    if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)) return;
    if(e.code==='Space'){e.preventDefault();audio.paused?audio.play():audio.pause();}
    if(e.key==='ArrowLeft') audio.currentTime=Math.max(0,audio.currentTime-10);
    if(e.key==='ArrowRight') audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+10);
    if(e.key==='ArrowUp') audio.volume=Math.min(1,audio.volume+.1);
    if(e.key==='ArrowDown') audio.volume=Math.max(0,audio.volume-.1);
    if(e.key.toLowerCase()==='r'){audio.currentTime=0;audio.play();}
  });

  let timer;
  audio.addEventListener('ended', ()=>{
    setStatus('Completed','done');
    localStorage.removeItem(`zeyn-progress-${test}`);
    const completed = JSON.parse(localStorage.getItem('zeyn-completed') || '[]');
    if(!completed.includes(test)){
      completed.push(test);
      localStorage.setItem('zeyn-completed', JSON.stringify(completed));
    }
    $('#completePanel').classList.add('show');
    if(test < 27){
      let n = 5;
      $('#countdown').textContent = n;
      timer = setInterval(()=>{
        n--;
        $('#countdown').textContent = n;
        if(n<=0){
          clearInterval(timer);
          location.href = `test${String(test+1).padStart(2,'0')}.html`;
        }
      },1000);
    }
  });

  $('#cancelNext')?.addEventListener('click', ()=>{
    clearInterval(timer);
    $('#completePanel').classList.remove('show');
  });

  async function refreshOffline(){
    const btn = $('#offlineBtn');
    const label = $('#offlineLabel');
    if(!('serviceWorker' in navigator)){
      btn.disabled = true;
      btn.textContent = 'Offline unavailable';
      label.textContent = 'This browser does not support offline mode.';
      return;
    }
    try{
      const result = await swMessage({type:'IS_AUDIO_CACHED',url:audio.src});
      if(result.cached){
        btn.disabled = true;
        btn.classList.add('ready');
        btn.textContent = '✓ Saved Offline';
        label.textContent = 'This test is available without internet.';
      }
    }catch(e){}
  }

  $('#offlineBtn').addEventListener('click', async()=>{
    const btn = $('#offlineBtn');
    const label = $('#offlineLabel');
    btn.disabled = true;
    btn.textContent = 'Downloading…';
    label.textContent = 'Keep this page open until the download finishes.';
    try{
      await swMessage({type:'CACHE_AUDIO',url:audio.src});
      btn.classList.add('ready');
      btn.textContent = '✓ Saved Offline';
      label.textContent = 'This test is now available without internet.';
    }catch(e){
      btn.disabled = false;
      btn.textContent = 'Download for Offline';
      label.textContent = 'Download failed. Check your internet connection and try again.';
    }
  });

  refreshOffline();
}

document.addEventListener('DOMContentLoaded', ()=>{
  applyTheme();
  updateNetwork();
  setupInstall();
  setupIndex();
  setupPlayer();
  $('#themeBtn')?.addEventListener('click', ()=>{
    const dark = !document.body.classList.contains('dark');
    localStorage.setItem('zeyn-theme', dark ? 'dark' : 'light');
    applyTheme();
  });
});

window.addEventListener('online', updateNetwork);
window.addEventListener('offline', updateNetwork);
window.addEventListener('load', ()=> setTimeout(()=>$('#loading')?.classList.add('hide'),250));

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=> navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
