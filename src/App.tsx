import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'
import Login from './presentation/pages/Login'
import Dashboard from './presentation/pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
    </Routes>
    </BrowserRouter>
  )
}
