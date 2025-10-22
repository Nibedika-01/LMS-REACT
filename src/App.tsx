import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'
import Login from './presentation/pages/Login'

export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login/>}/>
    </Routes>
    </BrowserRouter>
  )
}
