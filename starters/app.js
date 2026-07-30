
(() => {
  const body = document.body;
  const themeBtn = document.getElementById('themeBtn');
  const savedTheme = localStorage.getItem('zeyn-theme');
  if(savedTheme === 'dark') body.classList.add('dark');
  const updateTheme = () => { if(themeBtn) themeBtn.textContent = body.classList.contains('dark') ? '☀ Light mode' : '🌙 Dark mode'; };
  updateTheme();
  themeBtn?.addEventListener('click',()=>{body.classList.toggle('dark');localStorage.setItem('zeyn-theme',body.classList.contains('dark')?'dark':'light');updateTheme();});
  window.addEventListener('load',()=>setTimeout(()=>document.getElementById('loading')?.classList.add('hide'),180));

  const search = document.getElementById('search');
  if(search){
    search.addEventListener('input',()=>{
      const q=search.value.toLowerCase().trim();
      document.querySelectorAll('.test-card').forEach(c=>c.style.display=c.dataset.search.includes(q)?'flex':'none');
    });
  }

  const audio = document.getElementById('audio');
  if(!audio) return;

  const n = Number(body.dataset.test || 0);
  const playMain=document.getElementById('playMain'), waveform=document.getElementById('waveform');
  const progress=document.getElementById('progress'), bar=document.getElementById('bar');
  const timeText=document.getElementById('timeText'), percentText=document.getElementById('percentText');
  const currentBig=document.getElementById('currentBig'), durationBig=document.getElementById('durationBig');
  const statusText=document.getElementById('statusText'), complete=document.getElementById('completePanel');

  const fmt=s=>{if(!Number.isFinite(s)) return '0:00'; const m=Math.floor(s/60), r=Math.floor(s%60); return `${m}:${String(r).padStart(2,'0')}`};
  const sync=()=>{
    const p=audio.duration?audio.currentTime/audio.duration:0;
    bar.style.width=`${p*100}%`; timeText.textContent=`${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    percentText.textContent=`${Math.round(p*100)}%`; currentBig.textContent=fmt(audio.currentTime); durationBig.textContent=fmt(audio.duration);
    if(n) localStorage.setItem(`starters-position-${n}`,String(audio.currentTime));
  };
  audio.addEventListener('loadedmetadata',()=>{
    const saved=Number(localStorage.getItem(`starters-position-${n}`)||0);
    if(saved>0 && saved<audio.duration-3) audio.currentTime=saved;
    sync();
  });
  audio.addEventListener('timeupdate',sync);
  audio.addEventListener('play',()=>{playMain.textContent='❚❚';waveform.classList.add('playing');statusText.textContent='Playing'});
  audio.addEventListener('pause',()=>{playMain.textContent='▶';waveform.classList.remove('playing');statusText.textContent='Paused'});
  audio.addEventListener('ended',()=>{
    localStorage.setItem(`starters-completed-${n}`,'1'); complete.classList.add('show'); statusText.textContent='Completed';
  });
  playMain.addEventListener('click',()=>audio.paused?audio.play():audio.pause());
  document.getElementById('backBtn').addEventListener('click',()=>audio.currentTime=Math.max(0,audio.currentTime-10));
  document.getElementById('forwardBtn').addEventListener('click',()=>audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+10));
  document.getElementById('restartBtn').addEventListener('click',()=>{audio.currentTime=0;audio.play()});
  document.getElementById('speed').addEventListener('change',e=>audio.playbackRate=Number(e.target.value));
  progress.addEventListener('click',e=>{if(audio.duration){const r=progress.getBoundingClientRect();audio.currentTime=((e.clientX-r.left)/r.width)*audio.duration}});

  const offlineBtn=document.getElementById('offlineBtn');
  offlineBtn?.addEventListener('click',()=>{
    const a=document.createElement('a');a.href=audio.src;a.download=`Starters Test ${n}.mp3`;document.body.appendChild(a);a.click();a.remove();
  });
  document.addEventListener('keydown',e=>{
    if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)) return;
    if(e.code==='Space'){e.preventDefault();audio.paused?audio.play():audio.pause()}
    if(e.key==='ArrowLeft') audio.currentTime=Math.max(0,audio.currentTime-10);
    if(e.key==='ArrowRight') audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+10);
    if(e.key.toLowerCase()==='r'){audio.currentTime=0;audio.play()}
  });
})();
