
(()=>{const T=27,b=document.body,q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const theme=q('#themeBtn');if(localStorage.getItem('zeyn-theme')==='dark')b.classList.add('dark');
function th(){if(theme)theme.textContent=b.classList.contains('dark')?'☀ Light mode':'🌙 Dark mode'}th();
theme?.addEventListener('click',()=>{b.classList.toggle('dark');localStorage.setItem('zeyn-theme',b.classList.contains('dark')?'dark':'light');th()});
window.addEventListener('load',()=>setTimeout(()=>q('#loading')?.classList.add('hide'),160));
const done=n=>localStorage.getItem(`zeyn-flyers-completed-${n}`)==='1';
if(q('#search')){let c=0;for(let i=1;i<=T;i++)if(done(i))c++;
q('#completedCount').textContent=c;q('#remainingCount').textContent=T-c;q('#progressText').textContent=`${c} of ${T} tests completed`;q('#progressPercent').textContent=`${Math.round(c/T*100)}%`;q('#progressBar').style.width=`${c/T*100}%`;q('#progressRing').style.background=`conic-gradient(var(--primary) ${c/T*360}deg,#e8edf8 0deg)`;
qa('.test-card').forEach(x=>{const n=+x.dataset.test;if(done(n)){const d=document.createElement('span');d.className='done-badge';d.textContent='✓ Completed';x.appendChild(d)}});
const last=+localStorage.getItem('zeyn-flyers-last-test')||0;if(last){const cc=q('#continueCard');cc.classList.add('show');cc.href=`test${String(last).padStart(2,'0')}.html`;q('#continueTitle').textContent=`Flyers Test ${last}`;}
q('#search').addEventListener('input',e=>{const v=e.target.value.toLowerCase();qa('.test-card').forEach(x=>x.style.display=x.dataset.search.includes(v)?'flex':'none')});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();q('#search').focus()}});
q('#installBtn')?.addEventListener('click',()=>alert('On your phone, use the browser menu and choose “Add to Home screen”.'));
return}
const a=q('#audio');if(!a)return;const n=+b.dataset.test;localStorage.setItem('zeyn-flyers-last-test',n);
const play=q('#playMain'),wave=q('#waveform'),bar=q('#bar'),prog=q('#progress'),status=q('#statusText'),complete=q('#completePanel');
const fmt=s=>!isFinite(s)?'0:00':`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function sync(){const p=a.duration?a.currentTime/a.duration:0;bar.style.width=`${p*100}%`;q('#timeText').textContent=`${fmt(a.currentTime)} / ${fmt(a.duration)}`;q('#percentText').textContent=`${Math.round(p*100)}%`;q('#currentBig').textContent=fmt(a.currentTime);q('#durationBig').textContent=fmt(a.duration);localStorage.setItem(`zeyn-flyers-position-${n}`,a.currentTime)}
a.addEventListener('loadedmetadata',()=>{const s=+localStorage.getItem(`zeyn-flyers-position-${n}`)||0;if(s>0&&s<a.duration-3)a.currentTime=s;if(done(n)){complete.classList.add('show');status.textContent='Completed'}sync()});
a.addEventListener('timeupdate',sync);a.addEventListener('play',()=>{play.textContent='❚❚';wave.classList.add('playing');status.textContent='Playing'});a.addEventListener('pause',()=>{play.textContent='▶';wave.classList.remove('playing');if(!a.ended)status.textContent='Paused'});a.addEventListener('ended',()=>{localStorage.setItem(`zeyn-flyers-completed-${n}`,'1');complete.classList.add('show');status.textContent='Completed'});
play.onclick=()=>a.paused?a.play():a.pause();q('#backBtn').onclick=()=>a.currentTime=Math.max(0,a.currentTime-10);q('#forwardBtn').onclick=()=>a.currentTime=Math.min(a.duration||Infinity,a.currentTime+10);q('#restartBtn').onclick=()=>{a.currentTime=0;a.play()};q('#speed').onchange=e=>a.playbackRate=+e.target.value;prog.onclick=e=>{if(a.duration){const r=prog.getBoundingClientRect();a.currentTime=(e.clientX-r.left)/r.width*a.duration}};
q('#offlineBtn').onclick=()=>{const x=document.createElement('a');x.href=a.src;x.download=`Flyers Test ${n}.mp3`;x.click()};
document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();a.paused?a.play():a.pause()}if(e.key==='ArrowLeft')a.currentTime=Math.max(0,a.currentTime-10);if(e.key==='ArrowRight')a.currentTime=Math.min(a.duration||Infinity,a.currentTime+10);if(e.key.toLowerCase()==='r'){a.currentTime=0;a.play()}});
})();