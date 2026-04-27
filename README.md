# Gothic English Tools
**Year 9 · Gothic Fiction · Interactive classroom activities**

A suite of tools built with React + Vite, deployed via Netlify.

---

## Tools

| Tool | Type | Week | Time |
|------|------|------|------|
| Escape Blackwood Manor | Escape room game | Week 1 | 15 mins |
| The Raven — Annotation | Close reading tool | Week 1 | 20 mins |
| Gothic Atmosphere Rater | Comparison activity | Week 2 | 10 mins (coming soon) |
| Gothic Setting Builder | Writing scaffold | Week 2 | 15 mins (coming soon) |
| AI Writing Coach | Writing feedback | Week 2 | 20 mins (coming soon) |

---

## Deployment

This project is deployed automatically via Netlify.  
Every time you push to GitHub, Netlify rebuilds and your site updates within ~60 seconds.

**Build settings (already in netlify.toml):**
- Build command: `npm run build`
- Publish directory: `dist`

---

## Adding New Tools

**To add a plain HTML tool:**
1. Put the `.html` file in `/public/tools/`
2. Add a card for it in `src/pages/Home.jsx`
3. Commit and push — Netlify redeploys automatically

**To add a React tool:**
1. Create a new file in `src/pages/`
2. Import it in `src/App.jsx` and add a hash route
3. Add a card in `src/pages/Home.jsx`
4. Commit and push

---

## Teacher Dashboard

The Raven annotation tool includes a teacher dashboard (password: **RAVEN**).

**Current behaviour:** Results are stored in localStorage — visible when the teacher opens the dashboard on the same device students used.

**For cross-device class results (optional Firebase setup):**

1. Go to [firebase.google.com](https://firebase.google.com) and create a free project
2. Add a Realtime Database
3. In `src/pages/RavenTool.jsx`, replace the `saveStudentData` and `loadAllStudentData` functions with Firebase equivalents
4. Full instructions and code snippets available on request

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

*Built with Claude · Anthropic*
