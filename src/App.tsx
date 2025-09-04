import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainContent } from './MainContent'

const App = () => {
  return (
    <BrowserRouter basename='/contribution-proof-view-dev'>
      <Routes>
        {/* メインルート - クエリパラメータ(?id=xxx)で対応 */}
        <Route path='/' element={<MainContent />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
