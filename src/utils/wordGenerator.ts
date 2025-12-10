// ============================================
// WORD GENERATOR - Client-side word generation
// ============================================

import type { TestConfig, TestDifficulty } from '@/types';

// Word lists by difficulty
const EASY_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so',
  'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
];

const MEDIUM_WORDS = [
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'work', 'first', 'well', 'way', 'even', 'new', 'want',
  'because', 'any', 'these', 'give', 'day', 'most', 'world', 'still', 'find', 'here',
  'thing', 'many', 'place', 'while', 'system', 'being', 'need', 'right', 'part', 'during',
  'between', 'change', 'without', 'program', 'another', 'public', 'school', 'important',
];

const HARD_WORDS = [
  'government', 'development', 'information', 'international', 'environment',
  'organization', 'professional', 'particularly', 'administration', 'responsibility',
  'understanding', 'circumstances', 'infrastructure', 'communication', 'discrimination',
  'extraordinary', 'representative', 'characteristic', 'implementation', 'consciousness',
  'entrepreneurship', 'cryptocurrency', 'authentication', 'configuration', 'documentation',
  'initialization', 'synchronization', 'troubleshooting', 'visualization', 'collaboration',
];

const PUNCTUATION_MARKS = ['.', ',', '!', '?', ';', ':'];
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function getWordList(difficulty: TestDifficulty): string[] {
  switch (difficulty) {
    case 'easy':
      return EASY_WORDS;
    case 'hard':
      return HARD_WORDS;
    case 'medium':
    default:
      return [...EASY_WORDS, ...MEDIUM_WORDS];
  }
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function addPunctuation(word: string): string {
  // 20% chance to add punctuation
  if (Math.random() < 0.2) {
    return word + getRandomElement(PUNCTUATION_MARKS);
  }
  return word;
}

function addNumber(word: string): string {
  // 10% chance to prepend a number
  if (Math.random() < 0.1) {
    const num = getRandomElement(NUMBERS) + getRandomElement(NUMBERS);
    return num + word;
  }
  return word;
}

export function generateWords(count: number, config?: Partial<TestConfig>): string[] {
  const difficulty = config?.difficulty || 'medium';
  const includePunctuation = config?.punctuation || false;
  const includeNumbers = config?.numbers || false;

  const wordList = getWordList(difficulty);
  const words: string[] = [];

  for (let i = 0; i < count; i++) {
    let word = getRandomElement(wordList);

    if (includeNumbers) {
      word = addNumber(word);
    }

    if (includePunctuation) {
      word = addPunctuation(word);
    }

    words.push(word);
  }

  return words;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function calculateWPM(correctChars: number, timeElapsedMs: number): number {
  if (timeElapsedMs === 0) return 0;
  const minutes = timeElapsedMs / 1000 / 60;
  const words = correctChars / 5; // Standard: 5 chars = 1 word
  return Math.round(words / minutes);
}

export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}
