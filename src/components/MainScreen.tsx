import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Heart, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { db } from '../firebase';
import type { Item, SectionType } from '../types';
import { ItemCard } from './ItemCard';
import { AsciiBackground } from './AsciiBackground';
import { AddItemModal } from './AddItemModal';

interface MainScreenProps {
  user: { name: string; code: string };
  onLogout: () => void;
}

export const MainScreen = ({ user, onLogout }: MainScreenProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dynamicWords, setDynamicWords] = useState<string[]>([]);

  useEffect(() => {
    // We wrap this in try-catch in case Firebase is not configured properly yet
    try {
      const q = query(collection(db, `parejas/${user.code}/items`));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newItems: Item[] = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            // Show toast if item was added by the other person
            if (data.creadoPor && data.creadoPor !== user.name && !data.completado) {
              toast(`${data.creadoPor} acaba de agregar algo 👀`, { icon: '✨' });
            }
          }
        });

        snapshot.forEach((doc) => {
          newItems.push({ id: doc.id, ...doc.data() } as Item);
        });

        // Sort items: first by order, then by createdAt
        newItems.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
          return b.creadoAt - a.creadoAt;
        });

        setItems(newItems);
        
        // Update dynamic words for background based on last items
        const recentWords = newItems.slice(0, 8).map(item => item.texto.split(' ')[0]);
        setDynamicWords(recentWords);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase no configurado, usando local state", e);
      // Fallback for demo without real firebase config
      const local = localStorage.getItem(`items_${user.code}`);
      if (local) setItems(JSON.parse(local));
    }
  }, [user.code, user.name]);

  // Request Notification permission for reminders
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over?.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update order in Firebase
      try {
        newItems.forEach((item, index) => {
          const itemRef = doc(db, `parejas/${user.code}/items`, item.id);
          updateDoc(itemRef, { order: index });
        });
      } catch (e) {
        localStorage.setItem(`items_${user.code}`, JSON.stringify(newItems));
      }
    }
  };

  const handleAddItem = async (texto: string, seccion: SectionType, categoria: string) => {
    const newItem = {
      texto,
      seccion,
      categoria,
      creadoPor: user.name,
      creadoAt: Date.now(),
      completado: false,
      order: items.length
    };

    try {
      await addDoc(collection(db, `parejas/${user.code}/items`), newItem);
    } catch (e) {
      const updated = [...items, { ...newItem, id: Date.now().toString() }];
      setItems(updated as Item[]);
      localStorage.setItem(`items_${user.code}`, JSON.stringify(updated));
    }

    if (seccion === 'hoy' && 'serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((_) => {
        // Mock scheduling a notification for 10am
        // Real implementation would use push manager or a backend scheduled function
      });
    }
  };

  const handleToggle = async (id: string, completado: boolean) => {
    try {
      const itemRef = doc(db, `parejas/${user.code}/items`, id);
      await updateDoc(itemRef, { completado, seccion: completado ? 'completados' : 'hoy', completadoPor: completado ? user.name : null });
    } catch (e) {
      const updated = items.map(i => i.id === id ? { ...i, completado, seccion: completado ? 'completados' as SectionType : 'hoy' } : i);
      setItems(updated);
      localStorage.setItem(`items_${user.code}`, JSON.stringify(updated));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    try {
      await deleteDoc(doc(db, `parejas/${user.code}/items`, id));
    } catch (e) {
      const updated = items.filter(i => i.id !== id);
      setItems(updated);
      localStorage.setItem(`items_${user.code}`, JSON.stringify(updated));
    }
  };

  const renderSection = (title: string, seccion: SectionType, emoji: string) => {
    const sectionItems = items.filter(i => i.seccion === seccion);
    if (sectionItems.length === 0 && seccion === 'completados') return null;

    return (
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {emoji} {title} <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>({sectionItems.length})</span>
        </h2>
        <SortableContext items={sectionItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {sectionItems.map(item => (
            <ItemCard key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
          {sectionItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', borderStyle: 'dashed', borderWidth: 2, borderColor: 'var(--card-bg)', borderRadius: 16 }}>
              Nada por aquí ✨
            </div>
          )}
        </SortableContext>
      </div>
    );
  };

  const clearCompleted = async () => {
    const completed = items.filter(i => i.seccion === 'completados');
    try {
      for (const item of completed) {
        await deleteDoc(doc(db, `parejas/${user.code}/items`, item.id));
      }
    } catch (e) {
      const updated = items.filter(i => i.seccion !== 'completados');
      setItems(updated);
      localStorage.setItem(`items_${user.code}`, JSON.stringify(updated));
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <AsciiBackground imageUrl="/cats.jpg" />
      <Toaster position="top-center" />
      
      <header style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(246, 248, 253, 0.8)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '8px', borderRadius: '50%', boxShadow: 'var(--shadow-light)' }}>
            <Heart size={24} color="var(--primary-color)" fill="var(--primary-color)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Hola, {user.name}</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Pareja: {user.code}</p>
          </div>
        </div>
        <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 700 }}>Salir</button>
      </header>

      <main style={{ padding: '0 24px' }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {renderSection('Hoy', 'hoy', '📍')}
          {renderSection('Esta semana', 'semana', '📅')}
          {renderSection('Cuando pueda', 'cuando_pueda', '🌀')}
          
          {items.some(i => i.seccion === 'completados') && (
            <div style={{ marginTop: '48px', opacity: 0.8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Completado recientemente ✅</h2>
                <button onClick={clearCompleted} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={16} /> Limpiar
                </button>
              </div>
              {items.filter(i => i.seccion === 'completados').map(item => (
                <ItemCard key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </DndContext>
      </main>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="primary-gradient-bg"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '64px',
          height: '64px',
          borderRadius: '32px',
          border: 'none',
          boxShadow: '0 10px 20px rgba(255, 154, 158, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 50,
          transition: 'transform 0.2s ease'
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Plus size={32} color="white" />
      </button>

      {isModalOpen && <AddItemModal onClose={() => setIsModalOpen(false)} onAdd={handleAddItem} />}
    </div>
  );
};
