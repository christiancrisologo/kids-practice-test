# Kids Practice Test

A modern, interactive math practice app designed to help kids improve their math skills through engaging quizzes and challenges. Built with Next.js, React, and TypeScript.

## About

Kids Practice Test is an educational web application that makes math practice fun and engaging for students. The app features multiple question types, customizable difficulty levels, and exciting challenge modes to keep students motivated while learning.

## Key Features

### 📚 **Year Level Support**
- **Primary School**: Basic math for young learners with simple operations
- **Junior High School**: Intermediate math with more complex problems
- **Senior High School**: Advanced math challenges

### 🎯 **Question Types**
- **Math Expression (Type Answer)**: Students type their answers directly
- **Multiple Choice**: Select from 3 answer options
- **Number Types**: Basic numbers, decimals (conversion), money (currency), fractions (geometry), and time

### 🏆 **Challenge Modes** (15 Different Challenges)
Choose from exciting challenge modes loaded from `settings.json`:
- **No Challenge**: Standard quiz with no restrictions
- **Perfect Score**: Get all 10 questions right - no mistakes allowed!
- **Speed Challenge**: Complete 15 questions in 3 minutes
- **Endurance Test**: Complete 20 questions with max 3 incorrect answers
- **Lightning Round**: Answer 8 questions correctly in 2 minutes
- **Quick Fire**: 5 seconds per question, 12 questions total
- **Streak Master**: Get 5 questions right with only 1 mistake allowed
- **Marathon Mode**: 30 questions with 5 minutes total time
- **Precision Test**: Get 15 out of 16 questions correct
- **Time Pressure**: 7 seconds per question for 10 questions
- **One Shot Wonder**: Get 3 questions right with zero mistakes
- **Survivor Mode**: Keep going until you get 3 wrong
- **Rush Hour**: Complete 20 questions in 90 seconds
- **Steady Pace**: Relaxed mode with 25 seconds per question
- **Double or Nothing**: Get 6 right with max 2 wrong answers

### ⚙️ **Customizable Quiz Settings**
- Adjustable number of questions
- Configurable timer per question
- Overall quiz timer option
- Correct/incorrect answer goals and limits
- Question type selection (multiple categories)

### 📊 **Results & Review**
- Detailed score summary with percentage
- Question-by-question review
- **Correct answers shown for wrong questions** (helps students learn from mistakes)
- Time spent per question tracking
- Best streak display
- Achievement system with unlockable badges
- Challenge completion status

### 📈 **Progress Tracking**
- Game history with past quiz results
- Detailed statistics and performance metrics
- Local storage for offline data persistence
- Optional Supabase integration for cloud sync

### 🎨 **Modern UI/UX**
- Beautiful gradient backgrounds and animations
- Dark mode support
- Mobile-responsive design
- Touch-friendly controls
- Confetti celebrations for achievements
- Smooth transitions and hover effects

## How It Works

1. **Enter Your Name**: Start by entering your name on the home screen
2. **Select Year Level**: Choose Primary, Junior High, or Senior High School
3. **Pick a Challenge**: Select from 15 different challenge modes or go with "No Challenge"
4. **Customize Settings** (Optional): Toggle quiz settings to adjust difficulty, timer, and question types
5. **Start Quiz**: Answer questions one by one with visual timer and progress tracking
6. **Review Results**: See your score, review questions, and learn from mistakes with correct answers displayed
7. **Track Progress**: View your quiz history and track improvement over time

## Configuration

The app is highly configurable through `src/configs/settings.json`:

### System Settings
```json
{
  "system": {
    "theme": { "default": "light", "allowUserPreference": true },
    "supabase": { "enabled": false, "syncOnline": true },
    "storage": { "useLocalStorage": true, "maxHistoryRecords": 100 },
    "quiz-data": "math"
  }
}
```

### Challenge Modes
Add or modify challenge modes in the `challenges` array. Each challenge includes:
- `name`: Display name of the challenge
- `description`: Brief description shown to users
- `settings`: Quiz configuration (timers, question limits, answer goals, etc.)

### Year Levels
Customize year level presets in the `yearLevel` array with:
- Difficulty settings
- Number of questions
- Timer configurations
- Question types and categories
- Answer limits and goals

## Tech Stack

- **Framework**: Next.js 15.4.5 with Turbopack
- **Language**: TypeScript
- **UI**: React with Tailwind CSS
- **State Management**: Zustand
- **Storage**: LocalStorage with optional Supabase integration
- **Animations**: Custom CSS animations with reduced motion support
- **Icons & Emojis**: Native emoji support for cross-platform consistency

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kids-practice-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
kids-practice-test/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Home/Config page
│   │   ├── quiz/              # Quiz page
│   │   ├── results/           # Results page
│   │   └── history/           # History page
│   ├── components/            # React components
│   │   ├── quiz/              # Quiz-related components
│   │   └── ui/                # Reusable UI components
│   ├── configs/               # Configuration files
│   │   └── settings.json      # App settings & challenges
│   ├── lib/                   # Question generators
│   ├── store/                 # Zustand state management
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
└── public/                    # Static assets
```

## Customization

### Adding New Challenges
Edit `src/configs/settings.json` and add a new challenge to the `challenges` array:

```json
{
  "name": "Your Challenge Name",
  "description": "Challenge description",
  "settings": {
    "timerEnabled": true,
    "questionsEnabled": true,
    "numberOfQuestions": 10,
    "timerPerQuestion": 15,
    "minCorrectAnswers": 0,
    "maxCorrectAnswers": 10,
    "correctAnswersEnabled": false,
    "minIncorrectAnswers": 0,
    "maxIncorrectAnswers": 10,
    "incorrectAnswersEnabled": false,
    "overallTimerEnabled": false,
    "overallTimerDuration": 0
  }
}
```

### Modifying Year Levels
Update the `yearLevel` array in `src/configs/settings.json` to customize difficulty, question counts, and categories for each school level.

### Customizing UI
- Edit components in `src/components/` for UI changes
- Modify Tailwind classes for styling adjustments
- Update animations in `src/utils/enhanced-animations.ts`

## Features in Development

- [ ] Multi-subject support (Science, English)
- [ ] User accounts and cloud sync
- [ ] Leaderboards and competitions
- [ ] Parent/teacher dashboard
- [ ] Custom question creation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for educational purposes.

