import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'N/A';
  return `${score.toFixed(1)}/10`;
}

export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-500';
  if (score >= 6) return 'text-yellow-500';
  return 'text-red-500';
}

export function getScoreBgColor(score: number): string {
  if (score >= 8) return 'bg-green-500/10';
  if (score >= 6) return 'bg-yellow-500/10';
  return 'bg-red-500/10';
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'text-green-500';
    case 'B':
    case 'C':
      return 'text-yellow-500';
    case 'D':
    case 'F':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}
