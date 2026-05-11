import { useState, useEffect } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';
import { LoginScreen } from './components/LoginScreen';
import { MainScreen } from './components/MainScreen';

function App() {
  const [user, setUser] = useState<{ name: string; code: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Authenticate anonymously so we can securely access Firestore
    signInAnonymously(auth).catch((error) => {
      console.warn("Firebase Auth Error (mock mode expected):", error);
    });

    const savedName = localStorage.getItem('nuestro_name');
    const savedCode = localStorage.getItem('nuestro_code');
    
    if (savedName && savedCode) {
      setUser({ name: savedName, code: savedCode });
    }
    setIsLoaded(true);
  }, []);

  const handleLogin = (name: string, code: string) => {
    localStorage.setItem('nuestro_name', name);
    localStorage.setItem('nuestro_code', code);
    setUser({ name, code });
  };

  const handleLogout = () => {
    localStorage.removeItem('nuestro_name');
    localStorage.removeItem('nuestro_code');
    setUser(null);
  };

  if (!isLoaded) return null;

  return (
    <>
      {user ? (
        <MainScreen user={user} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
