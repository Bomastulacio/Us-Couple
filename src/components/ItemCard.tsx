import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Item } from '../types';
import { isBefore, startOfToday } from 'date-fns';

interface ItemCardProps {
  item: Item;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const getCategoryIcon = (categoria: string) => {
  switch (categoria) {
    case 'compras': return '🛒';
    case 'cita': return '📅';
    case 'farmacia': return '💊';
    case 'mascota': return '🐾';
    case 'limpieza': return '🧹';
    default: return '📌';
  }
};

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 80%)`;
};

export const ItemCard = ({ item, onToggle, onDelete }: ItemCardProps) => {
  const [isStriking, setIsStriking] = useState(item.completado);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleToggle = () => {
    if (item.completado) {
      onToggle(item.id, false);
      setIsStriking(false);
      return;
    }
    
    setIsStriking(true);
    // Wait for animation then complete
    setTimeout(() => {
      onToggle(item.id, true);
    }, 2000);
  };

  const isOverdue = item.seccion === 'hoy' && !item.completado && isBefore(item.creadoAt, startOfToday());
  const tagColor = stringToColor(item.creadoPor);

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      drag="x"
      dragConstraints={{ left: -100, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -80) {
          onDelete(item.id);
        }
      }}
      className={`glass-panel ${isOverdue ? 'overdue' : ''}`}
      style={{ ...style, padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', overflow: 'hidden' }}
    >
      <div 
        onClick={handleToggle}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: `2px solid ${isStriking ? 'var(--accent-color)' : 'var(--text-muted)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          background: isStriking ? 'var(--accent-color)' : 'transparent',
          transition: 'all 0.3s ease'
        }}
      >
        {isStriking && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: 'white', fontSize: '14px' }}>✓</motion.span>}
      </div>

      <div {...attributes} {...listeners} style={{ flexGrow: 1, cursor: 'grab', display: 'flex', flexDirection: 'column' }}>
        <span style={{ 
          fontSize: '1.1rem', 
          fontWeight: 600,
          textDecoration: isStriking ? 'line-through' : 'none',
          color: isStriking ? 'var(--text-muted)' : 'var(--text-main)',
          transition: 'all 0.3s ease'
        }}>
          {item.texto}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '0.8rem', background: tagColor, padding: '2px 8px', borderRadius: '12px', color: '#333', fontWeight: 700 }}>
            {item.creadoPor}
          </span>
          {isOverdue && <span title="Atrasado">⚠️</span>}
        </div>
      </div>

      <div style={{ fontSize: '1.5rem' }}>
        {getCategoryIcon(item.categoria)}
      </div>

      {isOverdue && (
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: '#ff7675' }} />
      )}
    </motion.div>
  );
};
