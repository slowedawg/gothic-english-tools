import { useState, useEffect, useRef, useCallback } from 'react'

const TEACHER_PASS = 'RAVEN'

const TECHS = [
  {id:'gothic',   name:'Gothic Atmosphere',        color:'#d4902a', bg:'rgba(212,144,42,.2)'},
  {id:'pathetic', name:'Pathetic Fallacy',          color:'#7090c0', bg:'rgba(112,144,192,.2)'},
  {id:'allit',    name:'Alliteration / Sibilance',  color:'#b080e0', bg:'rgba(176,128,224,.2)'},
  {id:'person',   name:'Personification',           color:'#d07030', bg:'rgba(208,112,48,.2)'},
  {id:'rep',      name:'Repetition',                color:'#c05060', bg:'rgba(192,80,96,.2)'},
  {id:'imagery',  name:'Imagery',                   color:'#70b080', bg:'rgba(112,176,128,.18)'},
  {id:'fore',     name:'Foreshadowing',             color:'#a890d0', bg:'rgba(168,144,208,.2)'},
]

const TARGETS = [
  {id:0, label:'Gothic Opening',
   hint:"In line 1, two consecutive words — one names the hour, one names the mood. Together they plunge the reader into Gothic dread before the narrative begins.",
   check:w=>w.includes('midnight')&&w.includes('dreary'), validTechs:['gothic','imagery'],
   explanation:"'Midnight dreary' establishes Gothic atmosphere immediately — midnight is the witching hour, the time of the supernatural, while 'dreary' creates hopelessness. The reader is submerged in dread before anything has even happened.", pts:300},
  {id:1, label:'Sound Device',
   hint:"At the very end of the first line, two words beginning with the same letter describe the narrator's exhausted state.",
   check:w=>w.includes('weak')&&w.includes('weary'), validTechs:['allit'],
   explanation:"The repeated 'w' in 'weak and weary' is alliteration that drags the rhythm down, pulling the reader into the narrator's fragile condition. His vulnerability makes what follows all the more terrifying.", pts:300},
  {id:2, label:'Pathetic Fallacy',
   hint:"Stanza II names a cold, dead winter month to reflect the narrator's grief — not just to tell us the season.",
   check:w=>w.includes('bleak')&&w.includes('december'), validTechs:['pathetic','gothic'],
   explanation:"'Bleak December' is pathetic fallacy — the dead month mirrors the narrator's grief for Lenore. Nature mourns alongside him, making the setting feel like an extension of his inner suffering.", pts:300},
  {id:3, label:'Supernatural Imagery',
   hint:"In Stanza II, a dying fire casts a shadow described as something supernatural — before any true supernatural event has occurred.",
   check:w=>w.includes('ghost')&&(w.includes('floor')||w.includes('wrought')), validTechs:['person','imagery','fore'],
   explanation:"'Wrought its ghost upon the floor' personifies the dying fire's shadow as a ghost — the natural world conjures the supernatural. This masterfully foreshadows the Raven; the room is already haunted.", pts:400},
  {id:4, label:'Sibilance',
   hint:"In Stanza III, three consecutive words describing the curtains all begin with 's'. Read them aloud — what sound do they create?",
   check:w=>w.includes('silken')&&w.includes('sad')&&(w.includes('uncertain')||w.includes('rustling')), validTechs:['allit','imagery'],
   explanation:"'Silken, sad, uncertain' creates sibilance — the hissing 's' sounds whisper and unsettle, making even ordinary curtains feel sinister. Sound itself becomes a Gothic instrument.", pts:400},
  {id:5, label:'Repetition for Dread',
   hint:"In Stanza I, Poe writes the exact same word twice consecutively — mimicking the relentless sound at the door.",
   check:w=>w.filter(x=>x==='rapping').length>=2, validTechs:['rep'],
   explanation:"'Rapping, rapping' uses repetition to recreate the relentless, inescapable sound — we feel trapped with the narrator. Repetition is a key Gothic technique for building mounting dread.", pts:300},
]

const RAW = [
  {s:0,lines:[
    "Once upon a midnight dreary, while I pondered, weak and weary,",
    "Over many a quaint and curious volume of forgotten lore—",
    "While I nodded, nearly napping, suddenly there came a tapping,",
    "As of some one gently rapping, rapping at my chamber door.",
    "\"'Tis some visitor,\" I muttered, \"tapping at my chamber door—",
    "    Only this and nothing more.\""
  ]},
  {s:1,lines:[
    "Ah, distinctly I remember it was in the bleak December;",
    "And each separate dying ember wrought its ghost upon the floor;",
    "Eagerly I wished the morrow;—vainly I had sought to borrow",
    "From my books surcease of sorrow—sorrow for the lost Lenore—",
    "For the rare and radiant maiden whom the angels name Lenore—",
    "    Nameless here for evermore."
  ]},
  {s:2,lines:[
    "And the silken, sad, uncertain rustling of each purple curtain",
    "Thrilled me—filled me with fantastic terrors never felt before;",
    "So that now, to still the beating of my heart, I stood repeating",
    "\"'Tis some visitor entreating entrance at my chamber door—",
    "Some late visitor entreating entrance at my chamber door;—",
    "    This it is and nothing more.\""
  ]}
]

const TOKENS = []
let _tid = 0
RAW.forEach(({s,lines})=>lines.forEach((line,li)=>line.split(' ').filter(w=>w!=='').forEach(w=>TOKENS.push({id:_tid++,display:w,clean:w.toLowerCase().replace(/[^a-z]/g,''),s,li}))))
const ROMAN = ['I','II','III']

// ── LOCAL STORAGE HELPERS ──
// All students on the same device/browser share localStorage.
// For a full class-wide teacher view, see README for Firebase setup.
function saveStudentData(name, score, targetsFound, annotations) {
  try {
    const key = `raven_${name.toLowerCase().replace(/[^a-z0-9]/g,'_')}`
    const anns = annotations.map(a => ({
      phrase: TOKENS.filter(t=>t.id>=a.start&&t.id<=a.end).map(t=>t.display).join(' '),
      techId: a.technique,
      techName: TECHS.find(t=>t.id===a.technique)?.name,
      effect: a.effect,
      isTarget: a.isTarget,
      targetId: a.targetId,
      targetLabel: a.isTarget ? TARGETS.find(t=>t.id===a.targetId)?.label : null,
    }))
    localStorage.setItem(key, JSON.stringify({
      name, score,
      targetsFound: Array.from(targetsFound),
      annotations: anns,
      complete: targetsFound.size === TARGETS.length,
      saved: Date.now()
    }))
  } catch(e) {}
}

function loadAllStudentData() {
  const out = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('raven_')) {
        try { out.push(JSON.parse(localStorage.getItem(key))) } catch(e) {}
      }
    }
  } catch(e) {}
  return out.sort((a,b) => b.score - a.score)
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --night:#07050e;--study:#0e091c;
  --amber:#c8882a;--amber2:#e0a848;--candle:#f0d080;
  --ember:#b03010;--ash:#7a5028;
  --text:#dcc8a8;--text2:#b8a888;--text3:#8a7a68;
  --border:rgba(200,136,42,.18);--border2:rgba(200,136,42,.08);
  --silk:#3a1255;
}
body{background:var(--night);font-family:'Lora',serif;color:var(--text);min-height:100vh;overflow-x:hidden}
.study-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse at 50% 28%,rgba(180,110,20,.12) 0%,rgba(140,80,10,.06) 25%,transparent 55%),radial-gradient(ellipse at 50% 100%,rgba(80,10,10,.2) 0%,transparent 40%),radial-gradient(ellipse at 0% 0%,rgba(58,18,85,.12) 0%,transparent 40%),radial-gradient(ellipse at 100% 100%,rgba(58,18,85,.1) 0%,transparent 40%)}
.ember{position:fixed;bottom:0;left:0;right:0;height:3px;z-index:0;pointer-events:none;background:linear-gradient(90deg,transparent 10%,rgba(176,48,16,.35) 40%,rgba(200,80,20,.4) 50%,rgba(176,48,16,.35) 60%,transparent 90%);filter:blur(1px)}
.overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(4,2,10,.96);padding:20px;overflow-y:auto}
.card{background:linear-gradient(160deg,rgba(20,12,36,.97),rgba(10,6,20,.98));border:1px solid var(--border);position:relative}
.display{font-family:'Playfair Display',serif}
.orn{display:flex;align-items:center;gap:10px;margin:14px 0}
.orn-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--amber),transparent)}
.orn-g{color:var(--amber);font-size:13px;opacity:.6}
.btn-amber{font-family:'Playfair Display',serif;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--night);background:linear-gradient(135deg,var(--amber),var(--amber2),var(--amber));border:none;padding:14px 40px;cursor:pointer;transition:all .25s;clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)}
.btn-amber:hover{background:linear-gradient(135deg,var(--amber2),var(--candle),var(--amber2));transform:translateY(-1px);box-shadow:0 4px 20px rgba(200,136,42,.4)}
.btn-amber:disabled{opacity:.35;cursor:default;transform:none}
.btn-ghost{font-family:'Lora',serif;font-size:12px;letter-spacing:2px;color:var(--text3);background:transparent;border:1px solid rgba(200,136,42,.2);padding:10px 22px;cursor:pointer;transition:all .25s}
.btn-ghost:hover{border-color:var(--amber);color:var(--amber)}
.btn-sm{font-size:11px;padding:10px 22px}
.ink-input{width:100%;background:transparent;border:none;border-bottom:1px solid var(--border);color:var(--text);font-family:'Playfair Display',serif;font-size:20px;padding:12px 0;text-align:center;outline:none;transition:border-color .3s;letter-spacing:1px}
.ink-input:focus{border-bottom-color:var(--amber)}
.ink-input::placeholder{color:var(--text3);font-style:italic;font-size:17px}
.ink-select{width:100%;background:rgba(10,6,20,.9);border:none;border-bottom:1px solid var(--border);color:var(--text);font-family:'EB Garamond',serif;font-size:17px;padding:10px 8px;outline:none;cursor:pointer;appearance:none;transition:border-color .3s}
.ink-select:focus{border-bottom-color:var(--amber)}
.ink-select option{background:#0e091c;color:var(--text)}
.ink-ta{width:100%;background:transparent;border:none;border-bottom:1px solid rgba(200,136,42,.15);color:var(--text);font-family:'Lora',serif;font-style:italic;font-size:15px;padding:10px 8px;outline:none;resize:vertical;min-height:62px;line-height:1.6}
.ink-ta:focus{border-bottom-color:var(--border)}
.ink-ta::placeholder{color:var(--text3)}
.app-hdr{position:sticky;top:0;z-index:50;background:rgba(5,3,12,.97);border-bottom:1px solid var(--border2);padding:10px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.hdr-title{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(11px,2vw,15px);color:var(--amber)}
.hdr-sub{font-family:'Lora',serif;font-size:9px;letter-spacing:3px;color:var(--text3);margin-top:1px}
.hdr-dots{display:flex;gap:6px;align-items:center}
.pdot{width:8px;height:8px;border-radius:50%;border:1px solid var(--text3);transition:all .4s}
.pdot.done{background:var(--amber);border-color:var(--amber);box-shadow:0 0 6px rgba(200,136,42,.5)}
.pdot.cur{border-color:var(--ember);animation:flk .8s ease-in-out infinite alternate}
@keyframes flk{from{box-shadow:0 0 2px rgba(176,48,16,.3)}to{box-shadow:0 0 8px rgba(176,48,16,.8)}}
.hdr-stat{font-family:'Lora',serif;font-size:10px;color:var(--text3);text-align:right}
.hdr-stat span{display:block;font-family:'Playfair Display',serif;font-size:16px;color:var(--amber2)}
.app-body{display:flex;position:relative;z-index:1;min-height:calc(100vh - 52px)}
.sidebar{width:256px;flex-shrink:0;background:rgba(8,5,18,.7);border-right:1px solid var(--border2);padding:18px 14px;overflow-y:auto;max-height:calc(100vh - 52px);position:sticky;top:52px;align-self:flex-start}
.poem-area{flex:1;padding:30px 36px 100px;max-width:720px}
.sb-hd{font-family:'Playfair Display',serif;font-size:11px;letter-spacing:3px;color:var(--amber);margin-bottom:12px;font-weight:700}
.cc{background:rgba(14,9,28,.6);border:1px solid var(--border2);padding:10px 12px;margin-bottom:7px;cursor:pointer;transition:border-color .2s}
.cc:hover{border-color:rgba(200,136,42,.3)}
.cc.found{border-color:rgba(112,176,128,.3);background:rgba(40,70,40,.15);cursor:default}
.cc.open{border-color:rgba(200,136,42,.25)}
.cc-top{display:flex;align-items:center;gap:7px}
.cc-n{font-family:'Lora',serif;font-size:10px;color:var(--ash);letter-spacing:2px}
.cc-l{font-family:'Playfair Display',serif;font-size:13px;color:var(--text2);flex:1}
.cc-arr{font-size:10px;color:var(--text3)}
.cc.found .cc-l{color:#90c890}
.cc-hint{display:none;margin-top:8px;font-family:'Lora',serif;font-style:italic;font-size:13px;color:var(--text3);line-height:1.55;border-top:1px solid var(--border2);padding-top:8px}
.cc.open .cc-hint,.cc.found .cc-hint{display:block}
.cc.found .cc-hint{color:rgba(140,200,140,.6);font-style:normal;font-size:12px}
.sb-sep{height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent);margin:14px 0}
.sb-leg-hd{font-family:'Playfair Display',serif;font-size:10px;letter-spacing:3px;color:var(--text3);margin-bottom:10px}
.leg-r{display:flex;align-items:center;gap:8px;margin-bottom:5px;font-family:'Lora',serif;font-size:12px;color:var(--text2)}
.leg-sw{width:28px;height:8px;border-radius:1px;flex-shrink:0}
.poem-hd{margin-bottom:22px;text-align:center}
.poem-hd::after{content:'';display:block;width:100%;height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent);margin-top:14px}
.poem-title{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(28px,5vw,46px);color:var(--text);line-height:1;margin-bottom:4px;text-shadow:0 0 40px rgba(200,136,42,.15)}
.poem-byline{font-family:'Lora',serif;font-style:italic;font-size:13px;color:var(--text3);letter-spacing:1px}
.poem-instr{background:rgba(58,18,85,.15);border-left:2px solid var(--silk);padding:12px 16px;font-family:'Lora',serif;font-style:italic;font-size:14px;color:var(--text3);line-height:1.7;margin-bottom:26px}
.poem-instr strong{font-style:normal;font-family:'Playfair Display',serif;font-size:10px;letter-spacing:3px;color:var(--text2);display:block;margin-bottom:5px}
.stanza{margin-bottom:4px}
.stanza-n{font-family:'Playfair Display',serif;font-size:11px;letter-spacing:4px;color:var(--ash);opacity:.7;margin-top:26px;margin-bottom:10px}
.poem-line{font-family:'EB Garamond',serif;font-size:clamp(17px,2.5vw,21px);line-height:2.7;color:var(--text);user-select:none;flex-wrap:wrap}
.word{cursor:pointer;display:inline-block;padding:1px 3px;margin:0 1px;border-bottom:2px solid transparent;border-radius:1px;transition:background .1s;line-height:1.2}
.word:hover{background:rgba(200,136,42,.08)}
.word.sel-start{background:rgba(200,136,42,.2);border-bottom-color:var(--amber);animation:wp .7s ease-in-out infinite alternate}
@keyframes wp{from{box-shadow:0 2px 4px rgba(200,136,42,.15)}to{box-shadow:0 2px 14px rgba(200,136,42,.45)}}
.word.hover-r{background:rgba(200,136,42,.12);border-bottom-color:rgba(200,136,42,.35)}
.word.in-sel{background:rgba(200,136,42,.22);border-bottom-color:var(--amber)}
.sel-hint{font-family:'Playfair Display',serif;font-style:italic;font-size:12px;color:var(--ember);padding:6px 0 2px;animation:fdin .3s ease}
@keyframes fdin{from{opacity:0}to{opacity:1}}
.stanza-gap{height:20px}
.saved-hd{font-family:'Playfair Display',serif;font-size:11px;letter-spacing:3px;color:var(--text3);margin-bottom:12px;margin-top:32px}
.sa-row{display:flex;gap:10px;padding:9px 13px;background:rgba(14,9,28,.6);border:1px solid var(--border2);margin-bottom:5px;align-items:flex-start;animation:fdin .3s ease}
.sa-sw{width:10px;height:10px;border-radius:1px;flex-shrink:0;margin-top:4px}
.sa-q{font-family:'EB Garamond',serif;font-style:italic;font-size:15px;color:var(--text2);line-height:1.4}
.sa-t{font-family:'Lora',serif;font-size:11px;color:var(--amber);margin-top:2px}
.sa-e{font-family:'Lora',serif;font-size:13px;color:var(--text3);font-style:italic;margin-top:2px;line-height:1.4}
.ann-panel{position:fixed;bottom:0;left:0;right:0;z-index:80;background:linear-gradient(180deg,rgba(12,7,24,.98),rgba(7,5,14,1));border-top:1px solid var(--border);box-shadow:0 -8px 40px rgba(0,0,0,.5);padding:18px 28px 22px;transform:translateY(100%);transition:transform .38s cubic-bezier(.4,0,.2,1);max-height:80vh;overflow-y:auto}
.ann-panel.open{transform:translateY(0)}
.ap-hdr{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}
.ap-lbl{font-family:'Playfair Display',serif;font-size:10px;letter-spacing:4px;color:var(--amber);margin-bottom:5px}
.ap-phrase{font-family:'EB Garamond',serif;font-style:italic;font-size:20px;color:var(--text);line-height:1.4;max-width:580px}
.ap-sep{height:1px;background:linear-gradient(90deg,var(--border),transparent);margin:12px 0}
.ap-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.ap-f label{font-family:'Playfair Display',serif;font-size:9px;letter-spacing:4px;color:var(--text3);display:block;margin-bottom:8px}
.ap-foot{display:flex;align-items:flex-start;gap:14px;margin-top:16px;flex-wrap:wrap}
.ap-fb{flex:1;font-family:'Lora',serif;font-style:italic;font-size:14px;line-height:1.6;min-width:160px}
.fb-ok{color:#90c870}.fb-warn{color:#d4a840}.fb-bad{color:var(--ember)}.fb-info{color:var(--text3)}
.comp-card{padding:44px 52px;max-width:600px;width:100%;text-align:center}
.comp-pre{font-family:'Lora',serif;font-style:italic;font-size:11px;letter-spacing:4px;color:var(--text3);margin-bottom:12px}
.comp-title{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(24px,5vw,38px);color:var(--amber2);margin-bottom:6px}
.comp-name{font-family:'EB Garamond',serif;font-style:italic;font-size:18px;color:var(--text3);margin-bottom:18px}
.comp-sc{font-family:'Playfair Display',serif;font-size:clamp(52px,12vw,72px);font-weight:700;line-height:1;color:var(--amber);text-shadow:0 0 40px rgba(200,136,42,.4)}
.comp-sub{font-family:'Lora',serif;font-style:italic;font-size:13px;color:var(--text3);margin:6px 0 18px}
.comp-verd{font-family:'EB Garamond',serif;font-style:italic;font-size:17px;line-height:1.7;color:var(--text2);padding:16px 20px;border-top:1px solid var(--border2);border-bottom:1px solid var(--border2);margin:0 auto 24px;max-width:440px}
.comp-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:24px}
.fl-hd{font-family:'Playfair Display',serif;font-size:10px;letter-spacing:4px;color:var(--text3);margin-bottom:10px;text-align:left}
.fl-row{padding:12px 14px;background:rgba(40,60,40,.15);border:1px solid rgba(112,176,128,.15);border-left:2px solid rgba(112,176,128,.35);margin-bottom:6px;text-align:left}
.fl-lbl{font-family:'Playfair Display',serif;font-size:11px;color:#90c870;letter-spacing:1px;margin-bottom:4px}
.fl-exp{font-family:'Lora',serif;font-style:italic;font-size:13px;color:var(--text2);line-height:1.6}
.dash-wrap{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:28px 24px 60px}
.dash-hd{font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(22px,4vw,32px);color:var(--amber);margin-bottom:4px}
.dash-sub{font-family:'Lora',serif;font-style:italic;font-size:14px;color:var(--text3);margin-bottom:20px}
.dash-note{background:rgba(58,18,85,.15);border-left:2px solid rgba(200,136,42,.3);padding:10px 14px;font-family:'Lora',serif;font-style:italic;font-size:13px;color:var(--text3);line-height:1.6;margin-bottom:20px}
.dash-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
.stat-box{background:rgba(14,9,28,.7);border:1px solid var(--border2);padding:14px;text-align:center}
.stat-n{font-family:'Playfair Display',serif;font-size:28px;color:var(--amber)}
.stat-l{font-family:'Lora',serif;font-size:11px;color:var(--text3);letter-spacing:2px;margin-top:2px}
.th-hd{font-family:'Playfair Display',serif;font-size:10px;letter-spacing:3px;color:var(--text3);margin-bottom:10px}
.th-row{display:flex;align-items:center;gap:10px;margin-bottom:7px}
.th-bar-bg{flex:1;height:8px;background:rgba(200,136,42,.08);border-radius:1px;overflow:hidden}
.th-bar{height:100%;background:linear-gradient(90deg,var(--amber),var(--amber2));transition:width .8s ease}
.th-lbl{font-family:'Lora',serif;font-size:12px;color:var(--text3);width:160px;flex-shrink:0}
.th-pct{font-family:'Playfair Display',serif;font-size:11px;color:var(--amber);width:30px;text-align:right;flex-shrink:0}
.sc-card{background:rgba(14,9,28,.7);border:1px solid var(--border2);margin-bottom:10px;overflow:hidden}
.sc-hdr{display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;transition:background .2s}
.sc-hdr:hover{background:rgba(200,136,42,.04)}
.sc-sname{font-family:'Playfair Display',serif;font-size:15px;color:var(--text);flex:1}
.sc-pts{font-family:'Playfair Display',serif;font-size:16px;color:var(--amber);flex-shrink:0}
.sc-badge{font-family:'Lora',serif;font-size:10px;letter-spacing:2px;padding:3px 8px;border:1px solid;flex-shrink:0}
.sc-badge.done{color:#90c870;border-color:rgba(144,200,112,.3)}
.sc-badge.prog{color:var(--amber);border-color:rgba(200,136,42,.3)}
.sc-body{padding:0 16px 14px;display:none;border-top:1px solid var(--border2)}
.sc-body.open{display:block}
.sc-ann-hd{font-family:'Playfair Display',serif;font-size:9px;letter-spacing:3px;color:var(--text3);margin:10px 0 8px}
.sc-ann-row{padding:8px 12px;background:rgba(8,5,16,.5);border:1px solid var(--border2);margin-bottom:5px}
.sc-ann-top{display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap}
.sc-ann-q{font-family:'EB Garamond',serif;font-style:italic;font-size:15px;color:var(--text2)}
.sc-tech{font-family:'Lora',serif;font-size:10px;padding:2px 8px;border:1px solid;border-radius:2px;flex-shrink:0}
.sc-tgt{font-family:'Lora',serif;font-size:9px;letter-spacing:1px;color:#90c870;border:1px solid rgba(144,200,112,.3);padding:2px 6px;flex-shrink:0}
.sc-fx{font-family:'Lora',serif;font-style:italic;font-size:14px;color:var(--text2);line-height:1.5;padding-top:4px}
.sc-fx-empty{font-family:'Lora',serif;font-style:italic;font-size:13px;color:var(--text3);opacity:.5}
.dd-row{display:flex;gap:5px;align-items:center}
.dd{width:7px;height:7px;border-radius:50%;border:1px solid var(--text3);flex-shrink:0}
.dd.f{background:var(--amber);border-color:var(--amber)}
.empty-dash{font-family:'EB Garamond',serif;font-style:italic;font-size:18px;color:var(--text3);text-align:center;padding:40px}
@media(max-width:700px){
  .app-body{flex-direction:column}
  .sidebar{width:100%;max-height:none;position:static;border-right:none;border-bottom:1px solid var(--border2)}
  .poem-area{padding:18px 14px 100px}
  .ap-grid{grid-template-columns:1fr}
  .dash-stats{grid-template-columns:1fr 1fr}
  .comp-card{padding:28px 18px}
}
`

export default function RavenTool({ onBack }) {
  const [screen, setScreen] = useState('landing')
  const [playerName, setPlayerName] = useState('')
  const [score, setScore] = useState(0)
  const [selStart, setSelStart] = useState(null)
  const [selEnd, setSelEnd] = useState(null)
  const [hoverEnd, setHoverEnd] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [annotations, setAnnotations] = useState([])
  const [targetsFound, setTargetsFound] = useState(new Set())
  const [elapsed, setElapsed] = useState(0)
  const [openCC, setOpenCC] = useState(null)
  const [apTech, setApTech] = useState('')
  const [apFx, setApFx] = useState('')
  const [apFb, setApFb] = useState(null)
  const [teacherPass, setTeacherPass] = useState('')
  const [teacherErr, setTeacherErr] = useState('')
  const [studentData, setStudentData] = useState([])
  const [expandedStudent, setExpandedStudent] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (screen === 'game') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else clearInterval(timerRef.current)
    return () => clearInterval(timerRef.current)
  }, [screen])

  const fmtTime = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`
  const addScore = useCallback(pts => setScore(s => Math.max(0, s + pts)), [])

  useEffect(() => {
    if (screen === 'game' && annotations.length > 0) {
      saveStudentData(playerName, score, targetsFound, annotations)
    }
  }, [annotations, score])

  const buildAnnMap = useCallback(() => {
    const m = {}
    annotations.forEach(a => { for (let i=a.start;i<=a.end;i++) m[i]=a })
    return m
  }, [annotations])

  const submitAnn = () => {
    if (!apTech) { setApFb({type:'bad', msg:'Please select a technique first.'}); return }
    const lo=Math.min(selStart,selEnd), hi=Math.max(selStart,selEnd)
    const words=TOKENS.filter(t=>t.id>=lo&&t.id<=hi).map(t=>t.clean)
    let hit=null, wrongTech=null
    for (const tgt of TARGETS) {
      if (targetsFound.has(tgt.id)) continue
      if (tgt.check(words)) {
        if (tgt.validTechs.includes(apTech)) { hit=tgt; break }
        else { wrongTech=tgt; break }
      }
    }
    if (hit) {
      const newAnn={id:Date.now(),start:lo,end:hi,technique:apTech,effect:apFx,isTarget:true,targetId:hit.id}
      const newAnns=[...annotations,newAnn]
      const newTF=new Set([...targetsFound,hit.id])
      const pts=hit.pts+(apFx.length>20?120:apFx.length>8?60:0)
      setAnnotations(newAnns); setTargetsFound(newTF); addScore(pts)
      setApFb({type:'ok',msg:`✓ Target found: ${hit.label} (+${pts} pts) — ${hit.explanation}${apFx?` Your effect: "${apFx}"`.' Add an effect next time for bonus points.'}`})
      setTimeout(()=>{
        closePanel()
        if(newTF.size===TARGETS.length){saveStudentData(playerName,score+pts,newTF,newAnns);setTimeout(()=>setScreen('complete'),700)}
      },4000)
    } else if (wrongTech) {
      addScore(75)
      const cn=wrongTech.validTechs.map(id=>TECHS.find(t=>t.id===id).name).join(' or ')
      setApFb({type:'warn',msg:`Good phrase — but better identified as ${cn}. Re-select it for full marks. (+75 pts)`})
      setTimeout(closePanel,3200)
    } else {
      const newAnn={id:Date.now(),start:lo,end:hi,technique:apTech,effect:apFx,isTarget:false,targetId:null}
      const pts=80+(apFx.length>20?80:apFx.length>8?40:0)
      setAnnotations(a=>[...a,newAnn]); addScore(pts)
      const tn=TECHS.find(t=>t.id===apTech)?.name
      setApFb({type:'info',msg:`Annotated as ${tn} (+${pts} pts). ${apFx?'Good analysis.':'Add an effect for more points.'} ${TARGETS.length-targetsFound.size} target${TARGETS.length-targetsFound.size!==1?'s':''} remaining.`})
      setTimeout(()=>{closePanel();},2400)
    }
  }

  const closePanel=()=>{setPanelOpen(false);setSelStart(null);setSelEnd(null);setHoverEnd(null);setApFb(null)}
  const cancelPanel=closePanel

  const handleWordClick=(id)=>{
    if(panelOpen)return
    const am=buildAnnMap()
    if(selStart===null){
      if(am[id])return
      setSelStart(id);setSelEnd(null);setHoverEnd(null)
    } else if(selEnd===null){
      if(id===selStart){setSelStart(null);return}
      setSelEnd(id);setHoverEnd(null);setApTech('');setApFx('');setApFb(null);setPanelOpen(true)
      setTimeout(()=>document.getElementById('ap-tech-sel')?.focus(),380)
    }
  }

  const getVerdict=(sc)=>{
    if(sc>=3000)return'Exceptional. You read Poe with the precision of a trained analyst — every technique identified, every effect articulated. This is what A-grade close reading looks like.'
    if(sc>=2200)return'Excellent close reading. You understood how Poe constructs Gothic dread. Push further by describing the precise effect on the reader.'
    if(sc>=1400)return"Good technique identification. The next step: fully explain the reader's experience — not just the technique, but how it unsettles and why it works."
    return"You found the targets, which is the foundation. Now practise explaining: how does each technique make the reader feel, and why did Poe choose it at that moment?"
  }

  const renderPoem=()=>{
    const am=buildAnnMap()
    const lo=selStart!==null&&selEnd!==null?Math.min(selStart,selEnd):null
    const hi=selStart!==null&&selEnd!==null?Math.max(selStart,selEnd):null
    const hLo=selStart!==null&&selEnd===null&&hoverEnd!==null?Math.min(selStart,hoverEnd):null
    const hHi=selStart!==null&&selEnd===null&&hoverEnd!==null?Math.max(selStart,hoverEnd):null
    return RAW.map(({s,lines})=>(
      <div className="stanza" key={s}>
        <div className="stanza-n">Stanza {ROMAN[s]}</div>
        {lines.map((_,li)=>{
          const lt=TOKENS.filter(t=>t.s===s&&t.li===li)
          return(
            <div className="poem-line" key={li}>
              {lt.map(tok=>{
                const ann=am[tok.id]
                const inSel=lo!==null&&tok.id>=lo&&tok.id<=hi
                const inHov=hLo!==null&&tok.id>=hLo&&tok.id<=hHi&&!ann
                const isStart=selStart!==null&&selEnd===null&&tok.id===selStart
                let cls='word',style={}
                if(inSel){cls+=' in-sel'}
                else if(isStart){cls+=' sel-start'}
                else if(inHov){cls+=' hover-r'}
                else if(ann){const tech=TECHS.find(t=>t.id===ann.technique);if(tech)style={background:tech.bg,borderBottom:`2px solid ${tech.color}`};cls+=' annotated'}
                return(<span key={tok.id} className={cls} style={style}
                  onClick={()=>handleWordClick(tok.id)}
                  onMouseOver={()=>{if(selStart!==null&&selEnd===null&&!panelOpen)setHoverEnd(tok.id)}}
                  onMouseOut={()=>{if(selStart!==null&&selEnd===null)setHoverEnd(null)}}
                >{tok.display} </span>)
              })}
            </div>
          )
        })}
        {s<2&&<div className="stanza-gap"/>}
      </div>
    ))
  }

  const selPhrase=selStart!==null&&selEnd!==null
    ?`"${TOKENS.filter(t=>t.id>=Math.min(selStart,selEnd)&&t.id<=Math.max(selStart,selEnd)).map(t=>t.display).join(' ')}"`
    :''

  const renderDash=()=>{
    const total=studentData.length
    const complete=studentData.filter(d=>d.complete).length
    const totalAnns=studentData.reduce((s,d)=>s+d.annotations.length,0)
    const tgtCounts=TARGETS.map(tgt=>({...tgt,count:studentData.filter(d=>d.targetsFound.includes(tgt.id)).length,pct:total>0?Math.round(studentData.filter(d=>d.targetsFound.includes(tgt.id)).length/total*100):0}))
    return(
      <div className="dash-wrap">
        <div className="dash-hd">The Raven — Class Results</div>
        <div className="dash-sub">Student annotations from this device session</div>
        <div className="dash-note">
          <strong style={{fontStyle:'normal',fontFamily:"'Playfair Display',serif",fontSize:10,letterSpacing:3,color:'var(--text2)',display:'block',marginBottom:4}}>NOTE FOR TEACHERS</strong>
          Results shown here are from students who used this tool on the same device/browser.
          For a full cross-device class view, see the README in the GitHub repository for Firebase setup — it takes about 5 minutes.
        </div>
        <div className="dash-stats">
          <div className="stat-box"><div className="stat-n">{total}</div><div className="stat-l">STUDENTS</div></div>
          <div className="stat-box"><div className="stat-n">{complete}</div><div className="stat-l">COMPLETE</div></div>
          <div className="stat-box"><div className="stat-n">{totalAnns}</div><div className="stat-l">ANNOTATIONS</div></div>
        </div>
        {total>0&&(
          <div style={{marginBottom:24}}>
            <div className="th-hd">TARGET COMPLETION</div>
            {tgtCounts.map(t=>(
              <div className="th-row" key={t.id}>
                <div className="th-lbl">{t.label}</div>
                <div className="th-bar-bg"><div className="th-bar" style={{width:`${t.pct}%`}}/></div>
                <div className="th-pct">{t.pct}%</div>
              </div>
            ))}
          </div>
        )}
        <div style={{display:'flex',gap:12,marginBottom:16,alignItems:'center'}}>
          <button className="btn-amber btn-sm" onClick={()=>setStudentData(loadAllStudentData())}>↻ Refresh</button>
        </div>
        {studentData.length===0
          ?<div className="empty-dash">No student results yet on this device.<br/>Results appear here as students complete the activity.</div>
          :studentData.map((d,i)=>(
            <div className="sc-card" key={i}>
              <div className="sc-hdr" onClick={()=>setExpandedStudent(expandedStudent===i?null:i)}>
                <div className="sc-sname">{d.name}</div>
                <div className="dd-row">{TARGETS.map((_,j)=><div key={j} className={`dd${d.targetsFound.includes(j)?' f':''}`}/>)}</div>
                <div className="sc-pts">{d.score.toLocaleString()}</div>
                <div className={`sc-badge ${d.complete?'done':'prog'}`}>{d.complete?'COMPLETE':'IN PROGRESS'}</div>
                <span style={{color:'var(--text3)',fontSize:11}}>{expandedStudent===i?'▴':'▾'}</span>
              </div>
              <div className={`sc-body ${expandedStudent===i?'open':''}`}>
                <div className="sc-ann-hd">ANNOTATIONS ({d.annotations.length})</div>
                {d.annotations.map((a,j)=>{
                  const tech=TECHS.find(t=>t.id===a.techId)
                  return(
                    <div className="sc-ann-row" key={j}>
                      <div className="sc-ann-top">
                        <div className="sc-ann-q">"{a.phrase}"</div>
                        <div className="sc-tech" style={{color:tech?.color,borderColor:tech?.color+'44'}}>{a.techName}</div>
                        {a.isTarget&&<div className="sc-tgt">✓ {a.targetLabel}</div>}
                      </div>
                      {a.effect?<div className="sc-fx">{a.effect}</div>:<div className="sc-fx-empty">No effect written</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        }
      </div>
    )
  }

  return(
    <>
      <style>{CSS}</style>
      <div className="study-bg"/><div className="ember"/>

      {screen==='landing'&&(
        <div className="overlay">
          <div className="card" style={{padding:'48px 52px',maxWidth:500,width:'100%',textAlign:'center'}}>
            <div style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:12,letterSpacing:5,color:'var(--text3)',marginBottom:12}}>close reading activity</div>
            <div className="display" style={{fontStyle:'italic',fontSize:'clamp(30px,6vw,48px)',color:'var(--text)',textShadow:'0 0 40px rgba(200,136,42,.2)',marginBottom:4,lineHeight:1.1}}>The Raven</div>
            <div style={{fontFamily:"'EB Garamond',serif",fontStyle:'italic',fontSize:17,color:'var(--text3)',marginBottom:18}}>Edgar Allan Poe · 1845</div>
            <div className="orn"><div className="orn-line"/><div className="orn-g">✦</div><div className="orn-line"/></div>
            <p style={{fontFamily:"'EB Garamond',serif",fontStyle:'italic',fontSize:16,color:'var(--text2)',lineHeight:1.8,marginBottom:32}}>
              It is midnight. A single lamp burns in the study.<br/>Select phrases, identify techniques, explain their effect.<br/>Six targets are hidden in the text.
            </p>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
              <button className="btn-amber" onClick={()=>setScreen('student-name')}>Begin Reading</button>
              <button className="btn-ghost" onClick={()=>setScreen('teacher-auth')}>Teacher Dashboard</button>
              {onBack&&<button className="btn-ghost" style={{fontSize:11,marginTop:4}} onClick={onBack}>← Back to Hub</button>}
            </div>
          </div>
        </div>
      )}

      {screen==='student-name'&&(
        <div className="overlay">
          <div className="card" style={{padding:'44px 52px',maxWidth:440,width:'100%',textAlign:'center'}}>
            <div className="display" style={{fontStyle:'italic',fontSize:22,color:'var(--amber)',marginBottom:6}}>Who reads tonight?</div>
            <div className="orn"><div className="orn-line"/><div className="orn-g">⸸</div><div className="orn-line"/></div>
            <p style={{fontFamily:"'EB Garamond',serif",fontStyle:'italic',fontSize:15,color:'var(--text3)',lineHeight:1.7,marginBottom:24}}>
              Click the first word of a phrase, then the last.<br/>Find all six targets to complete the reading.
            </p>
            <input className="ink-input" placeholder="Write your name…" maxLength={22}
              value={playerName} onChange={e=>setPlayerName(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&playerName.trim().length>=2&&setScreen('game')}
              style={{marginBottom:24}} autoFocus/>
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <button className="btn-ghost" onClick={()=>setScreen('landing')}>Back</button>
              <button className="btn-amber" disabled={playerName.trim().length<2} onClick={()=>setScreen('game')}>Enter the Study</button>
            </div>
          </div>
        </div>
      )}

      {screen==='teacher-auth'&&(
        <div className="overlay">
          <div className="card" style={{padding:'44px 52px',maxWidth:380,width:'100%',textAlign:'center'}}>
            <div className="display" style={{fontStyle:'italic',fontSize:22,color:'var(--amber)',marginBottom:6}}>Teacher Access</div>
            <div className="orn"><div className="orn-line"/><div className="orn-g">✦</div><div className="orn-line"/></div>
            <p style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:14,color:'var(--text3)',marginBottom:22}}>Enter the class password to view student annotations.</p>
            <input className="ink-input" type="password" placeholder="Password…"
              value={teacherPass} onChange={e=>setTeacherPass(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'){if(teacherPass===TEACHER_PASS){setStudentData(loadAllStudentData());setScreen('teacher-dash')}else setTeacherErr('Incorrect password.')}}}
              style={{marginBottom:8}} autoFocus/>
            {teacherErr&&<div style={{color:'var(--ember)',fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:13,marginBottom:12}}>{teacherErr}</div>}
            <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:16}}>
              <button className="btn-ghost" onClick={()=>setScreen('landing')}>Back</button>
              <button className="btn-amber" onClick={()=>{if(teacherPass===TEACHER_PASS){setStudentData(loadAllStudentData());setScreen('teacher-dash')}else setTeacherErr('Incorrect password.')}}>View Dashboard</button>
            </div>
            <p style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:12,color:'var(--text3)',marginTop:14,opacity:.6}}>Default password: RAVEN</p>
          </div>
        </div>
      )}

      {screen==='teacher-dash'&&(
        <div style={{position:'relative',zIndex:1,minHeight:'100vh'}}>
          <div style={{position:'sticky',top:0,zIndex:50,background:'rgba(5,3,12,.97)',borderBottom:'1px solid var(--border2)',padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div className="display" style={{fontStyle:'italic',fontSize:14,color:'var(--amber)'}}>The Raven — Teacher Dashboard</div>
              <div style={{fontFamily:"'Lora',serif",fontSize:10,letterSpacing:3,color:'var(--text3)'}}>CLASS RESULTS</div>
            </div>
            <button className="btn-ghost" style={{fontSize:11}} onClick={()=>setScreen('landing')}>← Exit</button>
          </div>
          {renderDash()}
        </div>
      )}

      {screen==='game'&&(
        <>
          <div className="app-hdr">
            <div><div className="hdr-title">The Raven</div><div className="hdr-sub">GOTHIC CLOSE READING</div></div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div className="hdr-dots">{TARGETS.map((_,i)=><div key={i} className={`pdot${targetsFound.has(i)?' done':i===targetsFound.size?' cur':''}`}/>)}</div>
              <span style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:11,color:'var(--text3)',marginLeft:4}}><span style={{color:'var(--amber2)'}}>{targetsFound.size}</span>/6</span>
            </div>
            <div style={{display:'flex',gap:16,alignItems:'center'}}>
              <div className="hdr-stat">Time<span>{fmtTime(elapsed)}</span></div>
              <div className="hdr-stat">Score<span>{score.toLocaleString()}</span></div>
              {onBack&&<button className="btn-ghost" style={{fontSize:10}} onClick={onBack}>Hub</button>}
            </div>
          </div>
          <div className="app-body">
            <div className="sidebar">
              <div className="sb-hd">Your Targets</div>
              {TARGETS.map(t=>{
                const found=targetsFound.has(t.id),open=openCC===t.id
                return(
                  <div key={t.id} className={`cc${found?' found':open?' open':''}`} onClick={()=>!found&&setOpenCC(openCC===t.id?null:t.id)}>
                    <div className="cc-top">
                      <span className="cc-n">{t.id+1}.</span>
                      <span className="cc-l">{t.label}</span>
                      <span className="cc-arr">{found?'✓':open?'▴':'▾'}</span>
                    </div>
                    <div className="cc-hint">{found?<span style={{color:'rgba(144,200,112,.65)',fontSize:12}}>{t.explanation.substring(0,95)}…</span>:t.hint}</div>
                  </div>
                )
              })}
              <div className="sb-sep"/>
              <div className="sb-leg-hd">Technique Key</div>
              {TECHS.map(t=><div className="leg-r" key={t.id}><div className="leg-sw" style={{background:t.bg,borderBottom:`2px solid ${t.color}`}}/>{t.name}</div>)}
            </div>
            <div className="poem-area">
              <div className="poem-hd">
                <div className="poem-title">The Raven</div>
                <div className="poem-byline">Edgar Allan Poe · 1845 · Stanzas I–III</div>
              </div>
              <div className="poem-instr">
                <strong>How to annotate</strong>
                Click the <em>first word</em> of a phrase, then the <em>last word</em>. The selection glows amber as you hover.
                Choose the technique and explain its effect for bonus points. Find all six targets.
              </div>
              <div>{renderPoem()}</div>
              {selStart!==null&&selEnd===null&&<div className="sel-hint">✦ First word selected — now click the last word of your phrase ✦</div>}
              {annotations.length>0&&(
                <div>
                  <div className="saved-hd">Your Annotations ({annotations.length})</div>
                  {annotations.map(a=>{
                    const tech=TECHS.find(t=>t.id===a.technique)
                    const words=TOKENS.filter(t=>t.id>=a.start&&t.id<=a.end).map(t=>t.display).join(' ')
                    return(
                      <div className="sa-row" key={a.id}>
                        <div className="sa-sw" style={{background:tech?.bg,borderBottom:`2px solid ${tech?.color}`}}/>
                        <div><div className="sa-q">"{words}"</div><div className="sa-t">{tech?.name}</div>{a.effect&&<div className="sa-e">{a.effect}</div>}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <div className={`ann-panel ${panelOpen?'open':''}`}>
            <div className="ap-hdr">
              <div><div className="ap-lbl">Annotate this phrase</div><div className="ap-phrase">{selPhrase}</div></div>
              <button className="btn-ghost" style={{fontSize:11}} onClick={cancelPanel}>✕ Cancel</button>
            </div>
            <div className="ap-sep"/>
            <div className="ap-grid">
              <div className="ap-f">
                <label>Gothic Technique</label>
                <select id="ap-tech-sel" className="ink-select" value={apTech} onChange={e=>setApTech(e.target.value)}>
                  <option value="">— Select a technique —</option>
                  {TECHS.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="ap-f">
                <label>Effect on the Reader — optional, earns bonus points</label>
                <textarea className="ink-ta" value={apFx} onChange={e=>setApFx(e.target.value)} placeholder="How does this technique affect the reader?"/>
              </div>
            </div>
            <div className="ap-foot">
              <div className="ap-fb">{apFb&&<span className={`fb-${apFb.type}`}>{apFb.msg}</span>}</div>
              <button className="btn-amber btn-sm" onClick={submitAnn}>Submit Annotation</button>
            </div>
          </div>
        </>
      )}

      {screen==='complete'&&(
        <div className="overlay">
          <div className="card comp-card">
            <div className="comp-pre">analysis complete</div>
            <div className="comp-title">{score>=3000?'Gothic Scholar':score>=2200?'Accomplished Reader':score>=1400?'Developing Analyst':'Close Reader'}</div>
            <div className="orn"><div className="orn-line"/><div className="orn-g">✦</div><div className="orn-line"/></div>
            <div className="comp-name">{playerName}</div>
            <div className="comp-sc">{score.toLocaleString()}</div>
            <div className="comp-sub">{annotations.length} annotations · {fmtTime(elapsed)}</div>
            <div className="comp-verd">{getVerdict(score)}</div>
            <div className="comp-btns">
              <button className="btn-ghost" onClick={()=>{setScore(0);setAnnotations([]);setTargetsFound(new Set());setElapsed(0);setScreen('student-name')}}>Read Again</button>
              {onBack&&<button className="btn-amber" onClick={onBack}>← Back to Hub</button>}
            </div>
            <div>
              <div className="fl-hd">What You Found — Full Explanations</div>
              {Array.from(targetsFound).sort().map(id=>{const tgt=TARGETS[id];return<div className="fl-row" key={id}><div className="fl-lbl">{tgt.label}</div><div className="fl-exp">{tgt.explanation}</div></div>})}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
