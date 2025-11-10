import { BrowserRouter, Routes, Route, useParams, Link } from 'react-router-dom'
import './App.css'
import { DigitalPanelGallery } from './Components/DigitalPanelGallery/DigitalPanelGallery'
import HomeScreen from './Screens/HomeScreen';

function App() {
  return (
    <BrowserRouter>
     <nav className='navigator'>
        <Link to="/">Home</Link> | 
        <Link to="/dashboard">Dashboard</Link> | 
        <Link to="/settings">Settings</Link>
      </nav>
      <Routes>
         <Route path="/" element={<HomeScreen/>} />
        <Route path="/dashboard" element={<DigitalPanelGallery />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
