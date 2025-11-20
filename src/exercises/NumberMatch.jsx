import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Default settings
export const DEFAULT_SETTINGS = {
  enabledNumbers: [1, 2, 3],
  visualStyle: 'apples', // 'apples', 'balls', 'stars', 'hearts'
  trialsPerSession: 10,
  enableVoice: true,
  animationSpeed: 'normal', // 'slow', 'normal', 'fast'
};

const STORAGE_KEY = 'settings_number_match_v1';

export function loadNumberMatchSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return sanitizeNumberMatchSettings(parsed);
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveNumberMatchSettings(settings) {
  try {
    const sanitized = sanitizeNumberMatchSettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    return sanitized;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return settings;
  }
}

export function sanitizeNumberMatchSettings(settings) {
  const sanitized = { ...DEFAULT_SETTINGS };

  if (settings.enabledNumbers && Array.isArray(settings.enabledNumbers)) {
    sanitized.enabledNumbers = settings.enabledNumbers.filter(n => n >= 1 && n <= 3);
    if (sanitized.enabledNumbers.length === 0) {
      sanitized.enabledNumbers = [1, 2, 3];
    }
  }

  if (['apples', 'balls', 'stars', 'hearts'].includes(settings.visualStyle)) {
    sanitized.visualStyle = settings.visualStyle;
  }

  if (typeof settings.trialsPerSession === 'number' && settings.trialsPerSession >= 5 && settings.trialsPerSession <= 30) {
    sanitized.trialsPerSession = settings.trialsPerSession;
  }

  if (typeof settings.enableVoice === 'boolean') {
    sanitized.enableVoice = settings.enableVoice;
  }

  if (['slow', 'normal', 'fast'].includes(settings.animationSpeed)) {
    sanitized.animationSpeed = settings.animationSpeed;
  }

  return sanitized;
}

// Visual emoji mapping
const VISUAL_EMOJIS = {
  apples: '🍎',
  balls: '⚽',
  stars: '⭐',
  hearts: '❤️',
};

// Animation duration based on speed
const ANIMATION_DURATIONS = {
  slow: 1000,
  normal: 600,
  fast: 300,
};

export default function NumberMatch({ meta }) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(loadNumberMatchSettings());
  const [currentTrial, setCurrentTrial] = useState(0);
  const [targetNumber, setTargetNumber] = useState(null);
  const [choices, setChoices] = useState([]);
  const [feedback, setFeedback] = useState(null); // null, 'correct', or 'incorrect'
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Speech synthesis
  const speak = useCallback((text) => {
    if (!settings.enableVoice || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [settings.enableVoice]);

  // Generate a new trial
  const generateTrial = useCallback(() => {
    const availableNumbers = settings.enabledNumbers;
    const target = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

    // Generate choices ensuring target is included
    const choicesSet = new Set([target]);
    const allNumbers = [1, 2, 3];

    // Add 2 more distinct choices
    while (choicesSet.size < 3) {
      const randomNum = allNumbers[Math.floor(Math.random() * allNumbers.length)];
      choicesSet.add(randomNum);
    }

    // Convert to array and shuffle
    const choicesArray = Array.from(choicesSet).sort(() => Math.random() - 0.5);

    setTargetNumber(target);
    setChoices(choicesArray);
    setFeedback(null);
    setSelectedChoice(null);

    // Announce target
    setTimeout(() => {
      speak(`Trouve ${target}`);
    }, 300);
  }, [settings.enabledNumbers, speak]);

  // Initialize first trial
  useEffect(() => {
    if (currentTrial === 0 && !sessionComplete) {
      generateTrial();
    }
  }, [currentTrial, sessionComplete, generateTrial]);

  // Handle choice selection
  const handleChoice = (choice) => {
    if (feedback !== null) return; // Already answered

    setSelectedChoice(choice);
    const isCorrect = choice === targetNumber;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setScore(prev => prev + 1);
      speak('Bravo !');
    } else {
      speak('Essaie encore !');
    }

    // Auto-advance after animation
    const duration = ANIMATION_DURATIONS[settings.animationSpeed];
    setTimeout(() => {
      const nextTrial = currentTrial + 1;
      if (nextTrial >= settings.trialsPerSession) {
        setSessionComplete(true);
        speak(`Terminé ! Tu as ${score + (isCorrect ? 1 : 0)} bonnes réponses sur ${settings.trialsPerSession}.`);
      } else {
        setCurrentTrial(nextTrial);
        generateTrial();
      }
    }, duration + 1000);
  };

  // Restart session
  const handleRestart = () => {
    setCurrentTrial(0);
    setScore(0);
    setSessionComplete(false);
    setFeedback(null);
    setSelectedChoice(null);
    generateTrial();
  };

  const emoji = VISUAL_EMOJIS[settings.visualStyle];

  if (sessionComplete) {
    const percentage = Math.round((score / settings.trialsPerSession) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Retour
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {meta?.titre || 'Correspondance de quantités'}
            </h1>
            <div className="w-20"></div>
          </div>
        </header>

        {/* Completion Screen */}
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Bravo !
            </h2>
            <p className="text-6xl font-bold text-purple-600 mb-2">
              {percentage}%
            </p>
            <p className="text-gray-600 mb-8">
              {score} / {settings.trialsPerSession} bonnes réponses
            </p>

            <div className="space-y-3">
              <button
                onClick={handleRestart}
                className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
              >
                Recommencer
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 text-gray-700 py-4 px-6 rounded-xl text-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Retour
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {meta?.titre || 'Correspondance de quantités'}
          </h1>
          <div className="text-sm text-gray-600 font-medium">
            {currentTrial + 1} / {settings.trialsPerSession}
          </div>
        </div>
      </header>

      {/* Main Exercise Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Target Display */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-4">
            <p className="text-center text-gray-600 text-lg mb-4 font-medium">
              Trouve cette quantité :
            </p>
            <div className="flex gap-4 justify-center items-center">
              {Array.from({ length: targetNumber || 0 }).map((_, index) => (
                <div
                  key={index}
                  className="text-7xl transition-all duration-300 animate-bounce"
                  style={{ animationDelay: `${index * 100}ms`, animationIterationCount: 1 }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Choices */}
        <div className="flex gap-6 justify-center flex-wrap max-w-4xl">
          {choices.map((choice) => {
            const isSelected = selectedChoice === choice;
            const isCorrect = choice === targetNumber;
            let bgColor = 'bg-white hover:bg-gray-50';
            let borderColor = 'border-gray-200';
            let transform = 'hover:scale-105';

            if (isSelected && feedback === 'correct') {
              bgColor = 'bg-green-100';
              borderColor = 'border-green-500';
              transform = 'scale-110';
            } else if (isSelected && feedback === 'incorrect') {
              bgColor = 'bg-red-100';
              borderColor = 'border-red-500';
              transform = 'scale-95';
            }

            return (
              <button
                key={choice}
                onClick={() => handleChoice(choice)}
                disabled={feedback !== null}
                className={`
                  ${bgColor} ${borderColor} ${transform}
                  border-4 rounded-2xl p-8 shadow-lg
                  transition-all duration-300
                  disabled:cursor-not-allowed
                  min-w-[200px]
                `}
              >
                <div className="flex gap-3 justify-center items-center flex-wrap">
                  {Array.from({ length: choice }).map((_, index) => (
                    <div
                      key={index}
                      className={`
                        text-6xl transition-all duration-300
                        ${isSelected && feedback === 'incorrect' ? 'animate-shake' : ''}
                      `}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Score Display */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg">
            Score : <span className="font-bold text-purple-600">{score}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
