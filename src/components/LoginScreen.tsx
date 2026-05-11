import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string, code: string) => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const generateCode = () => {
    const words = ["sol", "luna", "casita", "mate", "estrella", "gato"];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    setCode(`${randomWord}-${randomNum}`);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && code.trim()) {
      onLogin(name.trim(), code.trim().toLowerCase());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="login-container"
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
    >
      <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '50%', boxShadow: 'var(--shadow-light)' }}>
            <Heart size={48} color="var(--primary-color)" fill="var(--primary-color)" />
          </div>
        </div>
        
        <h1 className="primary-gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Nuestro</h1>
        <p style={{ color: 'var(--text-muted)' }}>Agregá al inicio para tenerla a mano 📱</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div>
            <input 
              type="text" 
              placeholder="¿Cómo te llamás?" 
              className="neumorphic-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Código de pareja" 
              className="neumorphic-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="button" onClick={generateCode} className="neumorphic-button" style={{ padding: '14px' }} title="Generar código random">
              🎲
            </button>
          </div>

          <button type="submit" className="neumorphic-button primary-gradient-bg" style={{ marginTop: '16px', color: 'white' }}>
            Entrar
          </button>
        </form>
      </div>
    </motion.div>
  );
};
