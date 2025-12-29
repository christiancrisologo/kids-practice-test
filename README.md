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

## Advanced Features

### 🚀 Multi-Stage Preloader
The app features a sophisticated preloader that provides a smooth loading experience:

**Stage 1: Settings Loading (0-40%)**
- Fetches `settings.json` from `/public/configs/`
- Parses and validates configuration
- Stores in context and sessionStorage

**Stage 2: Question Data Loading (40-100%)**
- Checks URL for `?quiz-data=<name>` query parameter
- Falls back to `settings.json` → `system.quiz-data` if no parameter
- Loads appropriate question JSON file
- Validates and prepares question data

**Features:**
- Contextual loading messages based on progress
- Beautiful gradient background with animations
- Progress percentage display
- Fun tips that change based on progress
- Smart caching - skips animation on subsequent loads in same session

### 🎯 Smart Answer Validation
The quiz system uses intelligent answer validation:

**Numeric Answers:**
- Compares with 0.01 tolerance for floating-point precision
- Handles decimals, fractions, and whole numbers
- Example: `3`, `3.0`, `3.00` are all considered correct

**Text Answers:**
- Case-insensitive comparison
- Trims whitespace automatically
- Example: `triangle`, `Triangle`, `TRIANGLE` are all correct

**Automatic Detection:**
- Tries to parse as number first
- Falls back to text comparison if not numeric
- Works seamlessly with both question types

### 📊 Dynamic Question Generation
The math question generator supports two types of questions:

**Variable Questions:**
- Use placeholders like `{{x}}`, `{{y}}`, `{{z}}`
- Generate random values based on difficulty
- Calculate answers using formulas
- Each attempt creates a unique question

**Non-Variable Questions:**
- Static questions with fixed answers
- Perfect for testing facts and concepts
- Formula is used directly as the answer
- Ideal for geometry facts, number properties, etc.

## Tech Stack

- **Framework**: Next.js 15.4.5 with Turbopack
- **Language**: TypeScript
- **UI**: React with Tailwind CSS
- **State Management**: Zustand + React Context
- **Storage**: LocalStorage + SessionStorage with optional Supabase integration
- **Animations**: Custom CSS animations with reduced motion support
- **Icons & Emojis**: Native emoji support for cross-platform consistency
- **Data Loading**: Multi-stage preloader with smart caching

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

## Deployment

### GitHub Pages Deployment

The app is configured for automatic deployment to GitHub Pages using GitHub Actions.

#### Initial Setup

1. **Enable GitHub Pages in your repository**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Select branch: **gh-pages** and folder: **/ (root)**
   - Click **Save**

2. **Fix Environment Protection Rules (if you see the error)**

   If you encounter this error:
   ```
   Branch "main" is not allowed to deploy to github-pages due to environment protection rules.
   ```

   **Option A: Remove Environment Protection (Recommended for personal projects)**
   - The workflow has been updated to comment out the `environment: github-pages` line
   - This allows deployment without environment protection rules
   - Simply push your changes and the deployment should work

   **Option B: Configure Environment Protection Rules**
   - Go to **Settings** → **Environments** → **github-pages**
   - Under **Deployment branches**, click **Add deployment branch rule**
   - Add `main` as an allowed branch
   - Click **Save protection rules**

3. **Verify Workflow Permissions**
   - Go to **Settings** → **Actions** → **General**
   - Scroll to **Workflow permissions**
   - Select **Read and write permissions**
   - Check **Allow GitHub Actions to create and approve pull requests**
   - Click **Save**

4. **Trigger Deployment**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

5. **Monitor Deployment**
   - Go to the **Actions** tab in your repository
   - Watch the "Deploy Next.js to GitHub Pages" workflow
   - Once complete, your site will be available at:
     `https://<username>.github.io/<repository-name>/`

#### Deployment Workflow

The GitHub Actions workflow (`.github/workflows/deploy_gh_pages.yml`) automatically:
1. Checks out the code
2. Sets up Node.js 20
3. Caches dependencies for faster builds
4. Installs dependencies
5. Builds the Next.js app with static export
6. Deploys to the `gh-pages` branch

#### Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file to the `public/` directory with your domain
2. Configure DNS settings with your domain provider
3. In GitHub: **Settings** → **Pages** → **Custom domain**
4. Enter your domain and click **Save**

### Vercel Deployment (Alternative)

For easier deployment, you can use Vercel:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts** to link your project and deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- **Netlify**: Connect your GitHub repo and deploy
- **Railway**: One-click deployment from GitHub
- **AWS Amplify**: Connect and deploy with CI/CD
- **DigitalOcean App Platform**: Deploy from GitHub

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
Edit `public/configs/settings.json` (or `src/configs/settings.json`) and add a new challenge to the `challenges` array:

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
Update the `yearLevel` array in `public/configs/settings.json` to customize difficulty, question counts, and categories for each school level.

### Adding New Question Sets
1. Create a new JSON file in `public/configs/` (e.g., `science.json`)
2. Follow the same format as `math.json`:
   ```json
   [
     {
       "question": "Your question here",
       "formula": "answer or formula",
       "difficulty": "easy|medium|hard",
       "level": "primary|junior|senior",
       "hint": "Helpful hint",
       "type": "category"
     }
   ]
   ```
3. Load it via query parameter: `http://localhost:3000/?quiz-data=science`
4. Or set it as default in `settings.json` → `system.quiz-data`

### Adding Math Questions
Edit `public/configs/math.json` to add new questions:

**Dynamic questions with variables:**
```json
{
  "question": "If you have {{x}} apples and buy {{y}} more, how many do you have?",
  "formula": "{{x}} + {{y}}",
  "difficulty": "easy",
  "level": "primary",
  "hint": "Add the two numbers together",
  "type": "basic"
}
```

**Factual questions without variables:**
```json
{
  "question": "How many sides does a hexagon have?",
  "formula": "6",
  "difficulty": "easy",
  "level": "junior",
  "hint": "Think of a six-sided shape",
  "type": "geometry"
}
```

### Customizing UI
- Edit components in `src/components/` for UI changes
- Modify Tailwind classes for styling adjustments
- Update animations in `src/utils/enhanced-animations.ts`
- Customize preloader messages in `src/components/ui/Preloader.tsx`

## Recent Updates

### Version 2.0 (December 2025)
- ✅ **Multi-stage preloader** with progress tracking and contextual loading messages
- ✅ **Dynamic question loading** via query parameters or settings configuration
- ✅ **Smart answer validation** with case-insensitive text comparison and numeric tolerance
- ✅ **2,500+ math questions** with both dynamic (variable) and factual (non-variable) questions
- ✅ **SessionStorage caching** for faster subsequent page loads
- ✅ **Enhanced question generator** supporting questions with and without variables

## Features in Development

- [ ] Multi-subject support (Science, English) - **Infrastructure ready!**
- [ ] User accounts and cloud sync
- [ ] Leaderboards and competitions
- [ ] Parent/teacher dashboard
- [ ] Custom question creation UI
- [ ] Question difficulty auto-adjustment based on performance

## Troubleshooting

### Preloader Issues
**Problem**: Preloader shows error or gets stuck
- Check that `public/configs/settings.json` exists
- Verify `public/configs/math.json` (or your quiz-data file) exists
- Check browser console for error messages
- Clear sessionStorage: `sessionStorage.clear()` in browser console

**Problem**: Questions not loading
- Verify the `quiz-data` parameter matches a file in `public/configs/`
- Check that the JSON file is valid (use a JSON validator)
- Ensure the file is in the correct format (array of question objects)

### Answer Validation Issues
**Problem**: Correct answers marked as wrong
- Check for extra spaces in the answer
- Verify the formula in the JSON is correct
- For numeric answers, ensure the formula evaluates correctly
- For text answers, check case sensitivity is working (should be case-insensitive)

### Performance Issues
**Problem**: Slow loading times
- The first load will be slower as it fetches data
- Subsequent loads use sessionStorage cache and should be instant
- Large question files (>5MB) may take longer to load
- Consider splitting into smaller subject-specific files

### Deployment Issues

**Problem**: "Branch 'main' is not allowed to deploy to github-pages"
- **Solution 1**: The workflow has been updated to comment out the `environment: github-pages` line
- **Solution 2**: Go to Settings → Environments → github-pages → Add `main` as deployment branch
- **Solution 3**: Delete the `github-pages` environment if you don't need protection rules

**Problem**: GitHub Actions workflow fails
- Check **Settings** → **Actions** → **General** → **Workflow permissions**
- Enable "Read and write permissions"
- Enable "Allow GitHub Actions to create and approve pull requests"

**Problem**: Deployment succeeds but site shows 404
- Verify GitHub Pages is enabled: **Settings** → **Pages**
- Check that source is set to **gh-pages** branch
- Wait a few minutes for DNS propagation
- Check the deployment URL: `https://<username>.github.io/<repository-name>/`

**Problem**: Assets not loading (CSS/JS 404 errors)
- Ensure `next.config.js` has correct `basePath` and `assetPrefix`
- For GitHub Pages: `basePath: '/<repository-name>'`
- Rebuild and redeploy after configuration changes

**Problem**: Build fails during deployment
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Run `npm run build` locally to test
- Check GitHub Actions logs for specific error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and fix all warnings before committing
- Test with both variable and non-variable questions
- Ensure mobile responsiveness
- Add comments for complex logic

## License

MIT License - feel free to use this project for educational purposes.

