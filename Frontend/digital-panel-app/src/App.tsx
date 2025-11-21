import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import { DigitalPanelGallery } from './Components/DigitalPanelGallery/DigitalPanelGallery'
import { HomeScreen } from './Screens/Home/HomeScreen';
import { Setting } from './Screens/_Setting/Setting';
import Login from './Screens/Login/LoginPage';
import Signin from './Screens/Signin/SigninPage';




function App() {
  return (
    <BrowserRouter>
     <nav className='navigator'>
        <Link to="/">Home</Link> | 
        <Link to="/dashboard">Dashboard</Link> | 
        <Link to="/settings">Settings</Link>
        <Link to="/login">Login</Link>
         <Link to="/Signin">Signin</Link>
      </nav>
      <Routes>
         <Route path="/" element={<HomeScreen/>} />
        <Route path="/dashboard" element={<DigitalPanelGallery />} />
         <Route path="/settings" element={<Setting/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/Signin" element={<Signin/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
