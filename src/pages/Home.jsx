const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=EB+Garamond:ital,wght@0,400;1,400&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

*{box-sizing:border-box;margin:0;padding:0}
:root{
  --night:#07050e;
  --amber:#c8882a;--amber2:#e0a848;
  --text:#dcc8a8;--text2:#b8a888;--text3:#7a6a58;
  --border:rgba(200,136,42,.18);--border2:rgba(200,136,42,.08);
  --silk:#3a1255;
}
body{background:var(--night);font-family:'Lora',serif;color:var(--text);min-height:100vh}
.home-bg{
  position:fixed;inset:0;z-index:0;pointer-events:none;
  background:
    radial-gradient(ellipse at 50% 0%,rgba(180,110,20,.1),transparent 50%),
    radial-gradient(ellipse at 0% 100%,rgba(58,18,85,.15),transparent 45%),
    radial-gradient(ellipse at 100% 100%,rgba(58,18,85,.12),transparent 45%);
}

/* HEADER */
.home-hdr{
  position:relative;z-index:1;
  text-align:center;
  padding:60px 20px 48px;
  border-bottom:1px solid var(--border2);
}
.home-hdr::after{
  content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);
  width:300px;height:1px;
  background:linear-gradient(90deg,transparent,var(--amber),transparent);
}
.home-eyebrow{
  font-family:'Lora',serif;font-style:italic;font-size:12px;
  letter-spacing:5px;color:var(--text3);margin-bottom:16px;
  text-transform:uppercase;
}
.home-title{
  font-family:'Playfair Display',serif;font-style:italic;
  font-size:clamp(32px,6vw,60px);font-weight:900;
  color:var(--text);line-height:1.05;margin-bottom:12px;
  text-shadow:0 0 60px rgba(200,136,42,.12);
}
.home-subtitle{
  font-family:'EB Garamond',serif;font-style:italic;
  font-size:clamp(16px,2.5vw,21px);color:var(--text3);
}

/* MAIN */
.home-main{
  position:relative;z-index:1;
  max-width:960px;margin:0 auto;
  padding:48px 24px 80px;
}

/* SECTION */
.section-label{
  font-family:'Playfair Display',serif;font-size:10px;letter-spacing:5px;
  color:var(--amber);text-transform:uppercase;margin-bottom:20px;
  display:flex;align-items:center;gap:12px;
}
.section-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--border),transparent)}

/* TOOL CARDS */
.tools-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:16px;margin-bottom:48px;
}
.tool-card{
  background:linear-gradient(160deg,rgba(20,12,36,.97),rgba(10,6,20,.98));
  border:1px solid var(--border);
  padding:28px 26px;
  cursor:pointer;
  transition:border-color .25s,box-shadow .25s,transform .2s;
  position:relative;overflow:hidden;
  text-decoration:none;display:block;
}
.tool-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,var(--amber),transparent);
  opacity:0;transition:opacity .25s;
}
.tool-card:hover{
  border-color:rgba(200,136,42,.4);
  box-shadow:0 8px 40px rgba(0,0,0,.4),0 0 0 1px rgba(200,136,42,.08);
  transform:translateY(-2px);
}
.tool-card:hover::before{opacity:1}
.tc-week{
  font-family:'Lora',serif;font-size:10px;letter-spacing:4px;
  color:var(--amber);opacity:.7;margin-bottom:10px;
}
.tc-title{
  font-family:'Playfair Display',serif;font-style:italic;
  font-size:22px;color:var(--text);margin-bottom:8px;line-height:1.2;
}
.tc-desc{
  font-family:'Lora',serif;font-style:italic;font-size:14px;
  color:var(--text3);line-height:1.6;margin-bottom:18px;
}
.tc-meta{
  display:flex;gap:10px;flex-wrap:wrap;
}
.tc-tag{
  font-family:'Lora',serif;font-size:11px;letter-spacing:1px;
  color:var(--text3);border:1px solid var(--border2);
  padding:3px 10px;
}
.tc-tag.year{color:var(--amber);border-color:rgba(200,136,42,.25)}
.tc-arrow{
  position:absolute;bottom:20px;right:20px;
  font-family:'Playfair Display',serif;font-size:20px;
  color:var(--amber);opacity:.3;transition:opacity .25s,transform .25s;
}
.tool-card:hover .tc-arrow{opacity:.8;transform:translateX(4px)}

/* COMING SOON */
.tool-card.soon{opacity:.5;cursor:default;pointer-events:none}
.tc-soon{
  font-family:'Lora',serif;font-size:11px;letter-spacing:3px;
  color:var(--text3);border:1px solid var(--border2);padding:3px 10px;
}

/* FOOTER */
.home-footer{
  position:relative;z-index:1;text-align:center;
  padding:24px;border-top:1px solid var(--border2);
}
.footer-text{
  font-family:'EB Garamond',serif;font-style:italic;
  font-size:14px;color:var(--text3);
}
`

export default function Home({ onNav }) {
  return (
    <>
      <style>{CSS}</style>
      <div className="home-bg" />

      <header className="home-hdr">
        <div className="home-eyebrow">Year 9 · Gothic Fiction</div>
        <h1 className="home-title">Gothic English</h1>
        <p className="home-subtitle">Interactive tools for reading, analysis and writing</p>
      </header>

      <main className="home-main">

        {/* WEEK 1 */}
        <div className="section-label">Week 1 — Gothic Overview</div>
        <div className="tools-grid">

          <a className="tool-card" href="/tools/escape-room.html" target="_blank" rel="noopener">
            <div className="tc-week">Week 1 · Starter Activity</div>
            <div className="tc-title">Escape Blackwood Manor</div>
            <div className="tc-desc">
              Five rooms, five different challenges. Sort Gothic conventions,
              match techniques, crack the vault code, spot the impostor and fill the blanks to escape.
              Competitive, scored, with a class leaderboard.
            </div>
            <div className="tc-meta">
              <span className="tc-tag year">Year 9</span>
              <span className="tc-tag">15 mins</span>
              <span className="tc-tag">Identify features</span>
            </div>
            <div className="tc-arrow">→</div>
          </a>

          <div className="tool-card" onClick={() => onNav('raven')} style={{cursor:'pointer'}}>
            <div className="tc-week">Week 1 · Close Reading</div>
            <div className="tc-title">The Raven — Annotation</div>
            <div className="tc-desc">
              Click and select phrases from three stanzas of Poe's Gothic masterpiece.
              Identify the technique, explain its effect on the reader.
              Six hidden targets to find. Teacher dashboard included.
            </div>
            <div className="tc-meta">
              <span className="tc-tag year">Year 9</span>
              <span className="tc-tag">20 mins</span>
              <span className="tc-tag">Analyse mood & atmosphere</span>
            </div>
            <div className="tc-arrow">→</div>
          </div>

        </div>

        {/* WEEK 2 */}
        <div className="section-label">Week 2 — Setting, Atmosphere & Writing</div>
        <div className="tools-grid">

          <div className="tool-card soon">
            <div className="tc-week">Week 2 · Comparison Activity</div>
            <div className="tc-title">Gothic Atmosphere Rater</div>
            <div className="tc-desc">
              Two descriptions side by side — which is more Gothic, and why?
              Students vote, class results appear live. Discussion-driven whole-class activity.
            </div>
            <div className="tc-meta">
              <span className="tc-tag year">Year 9</span>
              <span className="tc-tag">10 mins</span>
              <span className="tc-tag soon">Coming soon</span>
            </div>
          </div>

          <div className="tool-card soon">
            <div className="tc-week">Week 2 · Writing Activity</div>
            <div className="tc-title">Gothic Setting Builder</div>
            <div className="tc-desc">
              Students make micro-decisions — adjective, imagery, structure — and
              an atmosphere meter scores each choice. Assembled into a model paragraph to scaffold their own writing.
            </div>
            <div className="tc-meta">
              <span className="tc-tag year">Year 9</span>
              <span className="tc-tag">15 mins</span>
              <span className="tc-tag soon">Coming soon</span>
            </div>
          </div>

          <div className="tool-card soon">
            <div className="tc-week">Week 2 · Writing Feedback</div>
            <div className="tc-title">AI Writing Coach</div>
            <div className="tc-desc">
              Students paste their Gothic opening paragraph and receive specific AI feedback —
              which conventions they've used, what atmosphere it creates, one concrete improvement.
              Redraftable.
            </div>
            <div className="tc-meta">
              <span className="tc-tag year">Year 9</span>
              <span className="tc-tag">20 mins</span>
              <span className="tc-tag soon">Coming soon</span>
            </div>
          </div>

        </div>

      </main>

      <footer className="home-footer">
        <p className="footer-text">Gothic English Tools · Year 9 · Built with Claude</p>
      </footer>
    </>
  )
}
