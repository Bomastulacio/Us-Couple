import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SectionType } from '../types';

interface AddItemModalProps {
  onClose: () => void;
  onAdd: (texto: string, seccion: SectionType, categoria: string) => void;
}

const categorias = [
  { id: 'compras', icon: '🛒', label: 'Compras' },
  { id: 'cita', icon: '📅', label: 'Cita/Turno' },
  { id: 'farmacia', icon: '💊', label: 'Farmacia' },
  { id: 'mascota', icon: '🐾', label: 'Mascota' },
  { id: 'limpieza', icon: '🧹', label: 'Limpieza' },
  { id: 'general', icon: '📌', label: 'General' },
];

const autoDetectCategory = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes('compra') || t.includes('super') || t.includes('leche') || t.includes('pan') || t.includes('mercado')) return 'compras';
  if (t.includes('turno') || t.includes('medico') || t.includes('cita') || t.includes('reunion') || t.includes('dentista')) return 'cita';
  if (t.includes('farmacia') || t.includes('pastillas') || t.includes('medicamento') || t.includes('ibuprofeno')) return 'farmacia';
  if (t.includes('perro') || t.includes('gato') || t.includes('alimento') || t.includes('vet') || t.includes('pipeta')) return 'mascota';
  if (t.includes('limpiar') || t.includes('lavar') || t.includes('ropa') || t.includes('barrer') || t.includes('basura')) return 'limpieza';
  return 'general';
};

export const AddItemModal = ({ onClose, onAdd }: AddItemModalProps) => {
  const [texto, setTexto] = useState('');
  const [seccion, setSeccion] = useState<SectionType>('hoy');
  const [categoria, setCategoria] = useState('general');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setTexto(newText);
    
    // Auto-detect category only if user hasn't explicitly clicked one
    // We'll just auto-detect continuously for simplicity, a better UX might only do it if they haven't manually chosen
    setCategoria(autoDetectCategory(newText));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (texto.trim()) {
      onAdd(texto.trim(), seccion, categoria);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className="glass-panel modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ width: '40px', height: '4px', background: 'var(--text-muted)', borderRadius: '2px', margin: '0 auto 24px', opacity: 0.3 }} />
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Nuevo ítem</h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ej: Comprar leche..."
              className="neumorphic-input"
              value={texto}
              onChange={handleTextChange}
              required
              style={{ fontSize: '1.2rem', padding: '16px 20px' }}
            />

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-muted)' }}>¿Para cuándo?</label>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                {[
                  { id: 'hoy', label: 'Hoy 📍' },
                  { id: 'semana', label: 'Esta semana 📅' },
                  { id: 'cuando_pueda', label: 'Cuando pueda 🌀' }
                ].map(sec => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSeccion(sec.id as SectionType)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '16px',
                      border: 'none',
                      background: seccion === sec.id ? 'var(--primary-color)' : 'var(--bg-color)',
                      color: seccion === sec.id ? 'white' : 'var(--text-main)',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      boxShadow: seccion === sec.id ? 'var(--shadow-light)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-muted)' }}>Categoría</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categorias.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoria(cat.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: categoria === cat.id ? 'var(--accent-color)' : 'var(--bg-color)',
                      color: categoria === cat.id ? 'white' : 'var(--text-main)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: categoria === cat.id ? 'var(--shadow-light)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="neumorphic-button primary-gradient-bg" style={{ marginTop: '8px', color: 'white', fontSize: '1.1rem' }}>
              Guardar
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
