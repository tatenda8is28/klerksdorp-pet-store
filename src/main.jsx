import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext'
import ReactGA from "react-ga4";

// Initialize Google Analytics
ReactGA.initialize("G-0W1Q05N0X0");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
          <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)