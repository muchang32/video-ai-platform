import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LibraryPage } from './pages/LibraryPage'
import { VideoDetailPage } from './pages/VideoDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/videos/:cmsId" element={<VideoDetailPage />} />
          {/* Legacy redirects */}
          <Route path="/upload" element={<LibraryPage />} />
          <Route path="/process/:cmsId" element={<VideoDetailPage />} />
          <Route path="/results/:cmsId" element={<VideoDetailPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
