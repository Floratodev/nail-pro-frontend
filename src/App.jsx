export default function App() {
  console.log("App.jsx se ejecutó correctamente en producción");
  return (
    <div style={{
      background: 'linear-gradient(135deg, #c2567a, #7a1040)',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '2rem'
    }}>
      NAIL STUDIO<br/>FUNCIONA EN VERCEL
    </div>
  )
}