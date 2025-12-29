# Kids Practice Test

A modern, interactive math practice app designed to help kids improve their math skills through engaging quizzes and challenges. Built with Next.js, React, and TypeScript.

## About

Kids Practice Test is an educational web application that makes math practice fun and engaging for students. The app features multiple question types, customizable difficulty levels, exciting challenge modes, and a dynamic question generation system with over 2,500 math questions to keep students motivated while learning.

### ✨ What's New

- **🚀 Multi-Stage Preloader**: Beautiful loading experience with progress tracking and contextual messages
- **📊 Dynamic Question Loading**: Load different question sets via query parameters or settings
- **🎯 Smart Answer Validation**: Case-insensitive text answers and numeric comparison with floating-point tolerance
- **📚 2,500+ Math Questions**: Comprehensive question bank with both computational and factual questions
- **🔄 Variable & Non-Variable Questions**: Support for both dynamic questions with variables and static factual questions

## Key Features

### 📚 **Year Level Support**
- **Primary School**: Basic math for young learners with simple operations
- **Junior High School**: Intermediate math with more complex problems
- **Senior High School**: Advanced math challenges

### 🎯 **Question Types**
- **Math Expression (Type Answer)**: Students type their answers directly
- **Multiple Choice**: Select from 3 answer options
- **Number Types**: Basic numbers, decimals (conversion), money (currency), fractions (geometry), and time
- **Dynamic Questions**: Questions with variables that generate random values each time
- **Factual Questions**: Knowledge-based questions (e.g., "How many vertices does a triangle have?")

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
- **Multi-stage preloader** with progress tracking and contextual messages
- Dark mode support
- Mobile-responsive design
- Touch-friendly controls
- Confetti celebrations for achievements
- Smooth transitions and hover effects
- Smart caching with sessionStorage for faster subsequent loads

## How It Works

1. **Loading Experience**: Beautiful multi-stage preloader loads settings and question data
2. **Enter Your Name**: Start by entering your name on the home screen
3. **Select Year Level**: Choose Primary, Junior High, or Senior High School
4. **Pick a Challenge**: Select from 15 different challenge modes or go with "No Challenge"
5. **Customize Settings** (Optional): Toggle quiz settings to adjust difficulty, timer, and question types
6. **Start Quiz**: Answer questions one by one with visual timer and progress tracking
7. **Review Results**: See your score, review questions, and learn from mistakes with correct answers displayed
8. **Track Progress**: View your quiz history and track improvement over time

## Configuration

The app is highly configurable through `public/configs/settings.json` (also available in `src/configs/settings.json`):

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

**Note**: The `quiz-data` setting determines which question JSON file to load by default. You can override this with a query parameter:
- Default: `http://localhost:3000/` (loads `math.json` from settings)
- Override: `http://localhost:3000/?quiz-data=science` (loads `science.json`)

### Dynamic Question Loading

The app uses a multi-stage preloader that:
1. **Loads settings.json first** (0-40% progress)
2. **Checks for query parameter** `?quiz-data=<name>` in the URL
3. **Falls back to settings** if no query parameter is provided
4. **Loads the appropriate question data** from `/public/configs/<name>.json` (40-100% progress)
5. **Caches data in sessionStorage** for faster subsequent loads

This allows you to:
- Create multiple question sets (e.g., `math.json`, `science.json`, `english.json`)
- Switch between them using query parameters
- Set a default in `settings.json`

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

### Math Questions

The app includes **2,500+ math questions** in `public/configs/math.json` with two types:

#### 1. Dynamic Questions (with variables)
Questions that generate random values each time:
```json
{
  "question": "A car travels {{x}} km in {{y}} hours. What is its average speed?",
  "formula": "{{x}} / {{y}}",
  "difficulty": "easy",
  "level": "junior",
  "hint": "divide the distance by the time",
  "type": "basic"
}
```
- Variables like `{{x}}` and `{{y}}` are replaced with random numbers
- Formula is evaluated to calculate the answer
- Each attempt generates a new question with different values

#### 2. Factual Questions (without variables)
Knowledge-based questions with static answers:
```json
{
  "question": "How many vertices does a triangle have?",
  "formula": "3",
  "difficulty": "easy",
  "level": "junior",
  "hint": "Count the corners of a triangle.",
  "type": "geometry"
}
```
- No variables - the formula is used directly as the answer
- Perfect for testing mathematical facts and concepts
- Answer validation is case-insensitive for text answers

#### Answer Validation
The app uses smart answer validation:
- **Numeric answers**: Compared with 0.01 tolerance for floating-point precision
- **Text answers**: Case-insensitive comparison (e.g., "Triangle" = "triangle")
- **Automatic detection**: Tries numeric comparison first, falls back to text

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
├── public/
│   └── configs/               # Public configuration files
│       ├── settings.json      # App settings & challenges (loaded by preloader)
│       └── math.json          # 2,500+ math questions (loaded dynamically)
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── layout.tsx         # Root layout with QuizDataProvider
│   │   ├── page.tsx           # Home/Config page
│   │   ├── quiz/              # Quiz page
│   │   ├── results/           # Results page
│   │   └── history/           # History page
│   ├── components/            # React components
│   │   ├── quiz/              # Quiz-related components
│   │   └── ui/                # Reusable UI components
│   │       ├── Preloader.tsx  # Multi-stage loading component
│   │       └── AppLoader.tsx  # App wrapper with preloader
│   ├── configs/               # Source configuration files
│   │   ├── settings.json      # App settings (source copy)
│   │   └── math.json          # Math questions (source copy)
│   ├── contexts/              # React contexts
│   │   └── math-data-context.tsx  # Quiz data context with preloader logic
│   ├── lib/                   # Question generators
│   │   └── questionGenerators/
│   │       └── mathGenerator.ts   # Dynamic math question generator
│   ├── store/                 # Zustand state management
│   │   └── quiz-store.ts      # Quiz state with smart answer validation
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
│       └── dynamicMathGenerator.ts  # Variable & non-variable question support
└── package.json
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

