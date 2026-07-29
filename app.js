
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function applyTheme(){
  const saved=localStorage.getItem('zeyn-theme');
  if(saved==='dark') document.body.classList.add('dark');
  const b=$('#themeBtn'); if(b) b.textContent=document.body.classList.contains('dark')?'☀️ Light mode':'🌙 Dark mode';
}
function toggleTheme(){
  document.body.classList.toggle('dark');
  localStorage.setItem('zeyn-theme',document.body.classList.contains('dark')?'dark':'light');
  applyTheme();
}
function setupInstall(){
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault(); deferredPrompt=e;
    const b=$('#installBtn'); if(b) b.style.display='inline-flex';
  });
  const b=$('#installBtn');
  if(b) b.addEventListener('click',async()=>{
    if(!deferredPrompt){alert('Use your browser menu and choose “Add to Home Screen”.');return}
    deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; b.style.display='none';
  });
}
function setupIndex(){
  const last=localStorage.getItem('zeyn-last-test');
  if(last){
    const n=parseInt(last,10), c=$('#continueCard');
    c.href=`test${String(n).padStart(2,'0')}.html`;
    $('#continueTitle').textContent=`Movers Test ${n}`;
    c.classList.add('show');
  }
  const search=$('#search');
  if(search) search.addEventListener('input',()=>{
    const q=search.value.trim().toLowerCase();
    $$('.test-card').forEach(card=>{
      card.style.display=card.dataset.search.includes(q)?'grid':'none';
    });
  });
}
function fmt(s){if(!Number.isFinite(s))return '0:00';const m=Math.floor(s/60),x=Math.floor(s%60).toString().padStart(2,'0');return `${m}:${x}`}
function setupPlayer(){
  const audio=$('#audio'); if(!audio)return;
  const test=Number(document.body.dataset.test);
  localStorage.setItem('zeyn-last-test',String(test));
  const savedSpeed=Number(localStorage.getItem('zeyn-speed')||1);
  audio.playbackRate=savedSpeed; $('#speed').value=String(savedSpeed);
  const status=$('#status'), text=$('#statusText'), bar=$('#bar'), time=$('#timeText'), percent=$('#percentText');
  const setStatus=(label,cls='')=>{text.textContent=label;status.className='status '+cls}
  audio.addEventListener('play',()=>setStatus('Listening…','listening'));
  audio.addEventListener('pause',()=>{if(!audio.ended)setStatus('Paused')});
  audio.addEventListener('loadedmetadata',()=>time.textContent=`0:00 / ${fmt(audio.duration)}`);
  audio.addEventListener('timeupdate',()=>{
    const p=audio.duration?audio.currentTime/audio.duration*100:0;
    bar.style.width=p+'%'; time.textContent=`${fmt(audio.currentTime)} / ${fmt(audio.duration)}`; percent.textContent=Math.round(p)+'%';
    localStorage.setItem(`zeyn-progress-${test}`,String(audio.currentTime));
  });
  const old=Number(localStorage.getItem(`zeyn-progress-${test}`)||0);
  audio.addEventListener('loadedmetadata',()=>{if(old>5&&old<audio.duration-10)audio.currentTime=old},{once:true});
  $('#backBtn').onclick=()=>audio.currentTime=Math.max(0,audio.currentTime-10);
  $('#forwardBtn').onclick=()=>audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+10);
  $('#restartBtn').onclick=()=>{audio.currentTime=0;audio.play()};
  $('#playBtn').onclick=()=>audio.paused?audio.play():audio.pause();
  $('#speed').onchange=e=>{audio.playbackRate=Number(e.target.value);localStorage.setItem('zeyn-speed',e.target.value)};
  $('#progress').onclick=e=>{if(audio.duration){const r=e.currentTarget.getBoundingClientRect();audio.currentTime=((e.clientX-r.left)/r.width)*audio.duration}};
  document.addEventListener('keydown',e=>{
    if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))return;
    if(e.code==='Space'){e.preventDefault();audio.paused?audio.play():audio.pause()}
    if(e.key==='ArrowLeft')audio.currentTime=Math.max(0,audio.currentTime-10);
    if(e.key==='ArrowRight')audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+10);
    if(e.key==='ArrowUp')audio.volume=Math.min(1,audio.volume+.1);
    if(e.key==='ArrowDown')audio.volume=Math.max(0,audio.volume-.1);
    if(e.key.toLowerCase()==='r'){audio.currentTime=0;audio.play()}
  });
  let timer;
  audio.addEventListener('ended',()=>{
    setStatus('Completed','done');localStorage.removeItem(`zeyn-progress-${test}`);
    const panel=$('#completePanel');panel.classList.add('show');
    if(test<27){let n=5;$('#countdown').textContent=n;timer=setInterval(()=>{n--;$('#countdown').textContent=n;if(n<=0){clearInterval(timer);location.href=`test${String(test+1).padStart(2,'0')}.html`}},1000)}
  });
  $('#cancelNext')?.addEventListener('click',()=>{clearInterval(timer);$('#completePanel').classList.remove('show')});
}
window.addEventListener('load',()=>setTimeout(()=>$('#loading')?.classList.add('hide'),350));
document.addEventListener('DOMContentLoaded',()=>{applyTheme();$('#themeBtn')?.addEventListener('click',toggleTheme);setupInstall();setupIndex();setupPlayer()});
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));


function setupDashboard(){
  const completed = JSON.parse(localStorage.getItem('zeyn-completed') || '[]');
  const unique = [...new Set(completed.map(Number).filter(n=>n>=1&&n<=27))];
  const done = unique.length, remaining = 27-done, pct = Math.round(done/27*100);
  const c=document.querySelector('#completedCount'), r=document.querySelector('#remainingCount'),
        p=document.querySelector('#dashboardBar'), t=document.querySelector('#dashboardText');
  if(c)c.textContent=done;
  if(r)r.textContent=remaining;
  if(p)p.style.width=pct+'%';
  if(t)t.textContent=`${done} of 27 tests completed`;
}
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){
    e.preventDefault();document.querySelector('#search')?.focus();
  }
});
document.addEventListener('DOMContentLoaded',setupDashboard);

const originalSetupPlayer = setupPlayer;
setupPlayer = function(){
  originalSetupPlayer();
  const audio=document.querySelector('#audio');
  if(!audio)return;
  const test=Number(document.body.dataset.test);
  audio.addEventListener('ended',()=>{
    const completed=JSON.parse(localStorage.getItem('zeyn-completed')||'[]');
    if(!completed.includes(test)){completed.push(test);localStorage.setItem('zeyn-completed',JSON.stringify(completed))}
  });
};


async function getSWRegistration(){
  if(!('serviceWorker' in navigator)) return null;
  try{
    return await navigator.serviceWorker.ready;
  }catch(e){
    return null;
  }
}

function sendSWMessage(message){
  return new Promise(async(resolve,reject)=>{
    const reg=await getSWRegistration();
    if(!reg || !reg.active){reject(new Error('Service Worker unavailable'));return;}
    const channel=new MessageChannel();
    channel.port1.onmessage=e=>{
      if(e.data && e.data.ok) resolve(e.data);
      else reject(new Error((e.data && e.data.error) || 'Offline operation failed'));
    };
    reg.active.postMessage(message,[channel.port2]);
  });
}

async function isAudioCached(url){
  try{
    const result=await sendSWMessage({type:'IS_AUDIO_CACHED',url});
    return !!result.cached;
  }catch(e){
    return false;
  }
}

async function updateOfflineButton(){
  const btn=document.querySelector('#offlineBtn');
  const audio=document.querySelector('#audio');
  const status=document.querySelector('#offlineStatus');
  if(!btn || !audio) return;

  if(!('serviceWorker' in navigator)){
    btn.disabled=true;
    btn.textContent='Offline not supported';
    if(status) status.textContent='This browser does not support offline mode.';
    return;
  }

  const cached=await isAudioCached(audio.src);
  if(cached){
    btn.disabled=true;
    btn.classList.add('ready');
    btn.textContent='✓ Saved Offline';
    if(status){
      status.classList.add('ready');
      status.textContent='This audio is available without internet.';
    }
  }
}

function setupOfflineAudio(){
  const btn=document.querySelector('#offlineBtn');
  const audio=document.querySelector('#audio');
  const status=document.querySelector('#offlineStatus');
  if(!btn || !audio) return;

  updateOfflineButton();

  btn.addEventListener('click',async()=>{
    btn.disabled=true;
    btn.textContent='Downloading…';
    if(status){
      status.classList.remove('ready');
      status.textContent='Keep this page open until the download finishes.';
    }

    try{
      await sendSWMessage({type:'CACHE_AUDIO',url:audio.src});
      btn.classList.add('ready');
      btn.textContent='✓ Saved Offline';
      if(status){
        status.classList.add('ready');
        status.textContent='This audio is now available without internet.';
      }
    }catch(e){
      btn.disabled=false;
      btn.textContent='Download for Offline';
      if(status) status.textContent='Download failed. Check your internet connection and try again.';
    }
  });
}

window.addEventListener('online',()=>document.querySelectorAll('.network-state').forEach(x=>x.textContent='Online'));
window.addEventListener('offline',()=>document.querySelectorAll('.network-state').forEach(x=>x.textContent='Offline mode'));
document.addEventListener('DOMContentLoaded',()=>{
  setupOfflineAudio();
  document.querySelectorAll('.network-state').forEach(x=>x.textContent=navigator.onLine?'Online':'Offline mode');
});
