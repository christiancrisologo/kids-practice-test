#!/usr/bin/env node

/**
 * JSON Question Cleanup Script
 * 
 * This script cleans up question JSON files by:
 * 1. Removing duplicate questions (based on question text and formula)
 * 2. Removing "dirty" questions (malformed, missing required fields)
 * 3. Validating JSON structure
 * 4. Creating backups before cleaning
 * 
 * Usage: node scripts/cleanup-json-questions.js [--dry-run] [--file=path]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_DIR = path.join(__dirname, '../public/configs');
const BACKUP_DIR = path.join(__dirname, '../public/configs/backups');
const FILES_TO_CLEAN = ['math.json', 'science.json', 'english.json', 'history.json'];

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const specificFile = args.find(arg => arg.startsWith('--file='))?.split('=')[1];

// Required fields for each question type
const REQUIRED_FIELDS = {
  math: ['question', 'formula', 'difficulty', 'topic', 'answertype'],
  science: ['question', 'answer', 'difficulty', 'topic', 'answertype'],
  english: ['question', 'answer', 'difficulty', 'topic', 'answertype'],
  history: ['question', 'answer', 'difficulty', 'topic', 'answertype']
};

// Valid values for certain fields
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_ANSWER_TYPES = ['mcq', 'text'];

/**
 * Create backup directory if it doesn't exist
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✓ Created backup directory: ${BACKUP_DIR}`);
  }
}

/**
 * Create backup of a file
 */
function createBackup(filePath) {
  const fileName = path.basename(filePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `${fileName}.${timestamp}.bak`);
  
  fs.copyFileSync(filePath, backupPath);
  console.log(`✓ Backup created: ${backupPath}`);
  return backupPath;
}

/**
 * Normalize a string for comparison (remove extra spaces, lowercase)
 */
function normalizeString(str) {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Generate a unique key for a question
 */
function getQuestionKey(question) {
  const questionText = normalizeString(question.question || '');
  const formula = normalizeString(question.formula || question.answer || '');
  return `${questionText}|||${formula}`;
}

/**
 * Check if a question is valid
 */
function isValidQuestion(question, subject) {
  const issues = [];
  
  // Check if question is an object
  if (typeof question !== 'object' || question === null) {
    issues.push('Not an object');
    return { valid: false, issues };
  }
  
  // Check required fields
  const requiredFields = REQUIRED_FIELDS[subject] || REQUIRED_FIELDS.math;
  for (const field of requiredFields) {
    if (!question[field]) {
      issues.push(`Missing required field: ${field}`);
    }
  }
  
  // Check question text
  if (question.question && typeof question.question !== 'string') {
    issues.push('Question must be a string');
  }
  if (question.question && question.question.trim().length === 0) {
    issues.push('Question text is empty');
  }
  
  // Check difficulty
  if (question.difficulty && !VALID_DIFFICULTIES.includes(question.difficulty.toLowerCase())) {
    issues.push(`Invalid difficulty: ${question.difficulty}`);
  }
  
  // Check answertype
  if (question.answertype) {
    const answerTypes = Array.isArray(question.answertype) ? question.answertype : [question.answertype];
    const invalidTypes = answerTypes.filter(type => !VALID_ANSWER_TYPES.includes(type));
    if (invalidTypes.length > 0) {
      issues.push(`Invalid answer types: ${invalidTypes.join(', ')}`);
    }
  }
  
  // Check formula for math questions (basic validation)
  if (subject === 'math' && question.formula) {
    if (typeof question.formula !== 'string') {
      issues.push('Formula must be a string');
    } else if (question.formula.trim().length === 0) {
      issues.push('Formula is empty');
    }
  }
  
  // Check answer for non-math questions
  if (subject !== 'math' && question.answer) {
    if (typeof question.answer !== 'string') {
      issues.push('Answer must be a string');
    } else if (question.answer.trim().length === 0) {
      issues.push('Answer is empty');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Clean questions from a file
 */
function cleanQuestions(filePath) {
  const fileName = path.basename(filePath);
  const subject = fileName.replace('.json', '');
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing: ${fileName}`);
  console.log('='.repeat(60));
  
  // Read file
  let data;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(content);
  } catch (error) {
    console.error(`✗ Error reading ${fileName}:`, error.message);
    return;
  }

  if (!Array.isArray(data)) {
    console.error(`✗ ${fileName} does not contain an array`);
    return;
  }

  const originalCount = data.length;
  console.log(`Original question count: ${originalCount}`);

  // Track statistics
  const stats = {
    duplicates: 0,
    invalid: 0,
    validationIssues: {}
  };

  // Step 1: Remove invalid questions
  const validQuestions = [];
  const invalidQuestions = [];

  data.forEach((question, index) => {
    const validation = isValidQuestion(question, subject);

    if (validation.valid) {
      validQuestions.push(question);
    } else {
      invalidQuestions.push({
        index,
        question,
        issues: validation.issues
      });
      stats.invalid++;

      // Track issue types
      validation.issues.forEach(issue => {
        stats.validationIssues[issue] = (stats.validationIssues[issue] || 0) + 1;
      });
    }
  });

  console.log(`\n✓ Valid questions: ${validQuestions.length}`);
  console.log(`✗ Invalid questions: ${invalidQuestions.length}`);

  if (invalidQuestions.length > 0) {
    console.log('\nInvalid question issues:');
    Object.entries(stats.validationIssues).forEach(([issue, count]) => {
      console.log(`  - ${issue}: ${count}`);
    });

    // Show first few invalid questions as examples
    console.log('\nExample invalid questions (first 3):');
    invalidQuestions.slice(0, 3).forEach(({ index, question, issues }) => {
      console.log(`  [${index}] ${question.question?.substring(0, 50) || 'N/A'}...`);
      console.log(`      Issues: ${issues.join(', ')}`);
    });
  }

  // Step 2: Remove duplicates
  const uniqueQuestions = [];
  const seenKeys = new Set();
  const duplicates = [];

  validQuestions.forEach((question, index) => {
    const key = getQuestionKey(question);

    if (seenKeys.has(key)) {
      duplicates.push({ index, question });
      stats.duplicates++;
    } else {
      seenKeys.add(key);
      uniqueQuestions.push(question);
    }
  });

  console.log(`\n✓ Unique questions: ${uniqueQuestions.length}`);
  console.log(`✗ Duplicate questions: ${duplicates.length}`);

  if (duplicates.length > 0) {
    console.log('\nExample duplicates (first 3):');
    duplicates.slice(0, 3).forEach(({ index, question }) => {
      console.log(`  [${index}] ${question.question?.substring(0, 60) || 'N/A'}...`);
    });
  }

  // Summary
  const removedCount = originalCount - uniqueQuestions.length;
  const removalPercentage = ((removedCount / originalCount) * 100).toFixed(2);

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Summary for ${fileName}:`);
  console.log(`  Original:   ${originalCount} questions`);
  console.log(`  Cleaned:    ${uniqueQuestions.length} questions`);
  console.log(`  Removed:    ${removedCount} questions (${removalPercentage}%)`);
  console.log(`    - Invalid:    ${stats.invalid}`);
  console.log(`    - Duplicates: ${stats.duplicates}`);
  console.log('─'.repeat(60));

  // Save cleaned data
  if (!isDryRun && removedCount > 0) {
    // Create backup first
    createBackup(filePath);

    // Write cleaned data
    const cleanedJson = JSON.stringify(uniqueQuestions, null, 2);
    fs.writeFileSync(filePath, cleanedJson, 'utf8');
    console.log(`✓ Cleaned file saved: ${filePath}`);
  } else if (isDryRun) {
    console.log('ℹ DRY RUN - No changes made');
  } else {
    console.log('ℹ No changes needed');
  }

  return {
    fileName,
    originalCount,
    cleanedCount: uniqueQuestions.length,
    removedCount,
    stats
  };
}

/**
 * Main function
 */
function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         JSON Question Cleanup Script                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  if (isDryRun) {
    console.log('\n⚠️  DRY RUN MODE - No files will be modified\n');
  }

  // Ensure backup directory exists
  if (!isDryRun) {
    ensureBackupDir();
  }

  // Determine which files to process
  const filesToProcess = specificFile
    ? [specificFile]
    : FILES_TO_CLEAN;

  const results = [];

  // Process each file
  for (const fileName of filesToProcess) {
    const filePath = path.join(CONFIG_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`✗ File not found: ${filePath}`);
      continue;
    }

    const result = cleanQuestions(filePath);
    if (result) {
      results.push(result);
    }
  }

  // Overall summary
  if (results.length > 0) {
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    OVERALL SUMMARY                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const totalOriginal = results.reduce((sum, r) => sum + r.originalCount, 0);
    const totalCleaned = results.reduce((sum, r) => sum + r.cleanedCount, 0);
    const totalRemoved = results.reduce((sum, r) => sum + r.removedCount, 0);

    results.forEach(result => {
      console.log(`${result.fileName.padEnd(20)} ${result.originalCount} → ${result.cleanedCount} (removed ${result.removedCount})`);
    });

    console.log('\n' + '─'.repeat(60));
    console.log(`Total: ${totalOriginal} → ${totalCleaned} (removed ${totalRemoved})`);
    console.log('─'.repeat(60));

    if (!isDryRun && totalRemoved > 0) {
      console.log(`\n✓ All files cleaned successfully!`);
      console.log(`✓ Backups saved in: ${BACKUP_DIR}`);
    }
  }
}

// Run the script
main();

