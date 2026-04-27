import { useState, useEffect } from 'react'
import Home from './pages/Home'
import RavenTool from './pages/RavenTool'

export default function App() {
  const getPage = () => window.location.hash.replace('#', '') || 'home'
  const [page, setPage] = useState(getPage)

  useEffect(() => {
    const onHash = () => setPage(getPage())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const nav = (p) => { window.location.hash = p }

  if (page === 'raven') return <RavenTool onBack={() => nav('home')} />
  return <Home onNav={nav} />
}
