import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import Container from './Container.tsx'
import App from './App.tsx'
import Test from './other/Other.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Container />}>
          <Route index element={<App />} />
          <Route path="other" element={<Test />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
