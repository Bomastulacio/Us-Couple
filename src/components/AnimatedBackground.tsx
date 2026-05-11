import { useEffect, useState } from 'react';

const fixedWords = ["amor", "casa", "juntos", "hogar", "nosotros", "✨", "🏠", "🛒"];

const generateRandomPosition = () => {
  return {
    left: `${Math.random() * 80 + 10}vw`,
    animationDuration: `${Math.random() * 20 + 20}s`,
    animationDelay: `-${Math.random() * 20}s`,
    fontSize: `${Math.random() * 1.5 + 1}rem`
  };
};

export const AnimatedBackground = ({ dynamicWords = [] }: { dynamicWords?: string[] }) => {
  const [words, setWords] = useState<{ text: string, style: React.CSSProperties, id: number }[]>([]);

  useEffect(() => {
    const allWords = [...fixedWords, ...dynamicWords.slice(0, 8)];
    const styledWords = allWords.map((word, index) => ({
      text: word,
      id: index,
      style: generateRandomPosition()
    }));
    setWords(styledWords);
  }, [dynamicWords]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: -1, overflow: 'hidden' }}>
      {words.map((w) => (
        <span key={w.id} className="bg-word" style={w.style}>
          {w.text}
        </span>
      ))}
    </div>
  );
};
