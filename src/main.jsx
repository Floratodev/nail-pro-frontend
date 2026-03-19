import React from 'react'
import ReactDOM from 'react-dom/client'

console.log("main.jsx se cargó correctamente");

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{
    background: 'lime',
    color: 'black',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '5rem',
    fontWeight: 'bold'
  }}>
    MAIN.JSX FUNCIONA
  </div>
)