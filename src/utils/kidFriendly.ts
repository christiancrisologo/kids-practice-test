export const encouragingMessages = {
  correct: [
    "Awesome! 🌟",
    "Fantastic! 🎉",
    "You rock! 🔥",
    "Brilliant! ✨",
    "Amazing! 🎊",
    "Superb! 🚀",
    "Excellent! 🏆",
    "Perfect! 💎",
    "Outstanding! ⭐",
    "Incredible! 🎈"
  ],
  incorrect: [
    "Nice try! 💪",
    "Keep going! 🌈",
    "Almost there! 🎯",
    "Don't give up! 🌟",
    "You've got this! 💫",
    "Try again! 🎈",
    "Good effort! 👍",
    "So close! ✨",
    "Keep practicing! 🎪",
    "You're learning! 📚"
  ],
  streak: [
    "You're on fire! 🔥",
    "Streak master! ⚡",
    "Unstoppable! 🚀",
    "Practice wizard! 🧙‍♂️",
    "Champion! 🏆",
    "Phenomenal! 🌟",
    "Mind-blowing! 🤯",
    "Spectacular! 🎆",
    "Legendary! 👑",
    "Incredible streak! 🎊"
  ]
};

export const getRandomMessage = (type: keyof typeof encouragingMessages): string => {
  const messages = encouragingMessages[type];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getStreakMessage = (streak: number): string => {
  if (streak >= 5) return getRandomMessage('streak');
  if (streak >= 3) return `${streak} in a row! 🎯`;
  return '';
};

export const kidFriendlyNumbers = {
  emojis: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'],
  animals: ['🐸', '🐱', '🐼', '🦄', '🐻', '🐰', '🦊', '🐶', '🐵', '🐨'],
  fruits: ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝', '🍑', '🥭', '🍍', '🥥']
};

export const mathOperationEmojis = {
  addition: '➕',
  subtraction: '➖', 
  multiplication: '✖️',
  division: '➗',
  fractions: '🧮',
  algebraic: '🔢'
};

export const difficultyEmojis = {
  easy: '🟢',
  hard: '🔴'
};
