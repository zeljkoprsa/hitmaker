// A simple error page with no React features or client-side dependencies
export default function Custom500() {
  return (
    <div style={{ 
      backgroundColor: '#242424', 
      color: 'white',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>500 - Server Error</h1>
        <p style={{ marginBottom: '1.5rem' }}>Sorry, something went wrong on our server.</p>
        <a 
          href="/"
          style={{ 
            display: 'inline-block', 
            backgroundColor: '#4a4a4a', 
            color: 'white', 
            padding: '0.75rem 1.5rem', 
            textDecoration: 'none', 
            borderRadius: '0.375rem' 
          }}
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

// Disable static optimization for this page
export const config = {
  unstable_runtimeJS: false
};
