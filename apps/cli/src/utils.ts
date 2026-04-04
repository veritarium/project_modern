/**
 * CLI Utilities
 */

import pc from 'picocolors';

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return pc.gray('N/A');
  const icon = score >= 8 ? '✅' : score >= 6 ? '⚠️' : '❌';
  const colorFn = score >= 8 ? pc.green : score >= 6 ? pc.yellow : pc.red;
  return `${icon} ${colorFn(score.toFixed(1))}/10`;
}

export function formatGrade(grade: string | null | undefined): string {
  if (!grade) return pc.gray('?');
  const colorMap: Record<string, (s: string) => string> = {
    A: pc.green,
    B: pc.yellow,
    C: pc.yellow,
    D: pc.red,
    F: pc.red,
  };
  const colorFn = colorMap[grade] || pc.gray;
  return colorFn(grade);
}

export function printHeader(title: string): void {
  console.log('='.repeat(60));
  console.log(pc.bold(title));
  console.log('='.repeat(60));
}

export function printSection(title: string): void {
  console.log(`\n📦 ${pc.bold(title)}`);
}

export function printError(message: string): void {
  console.error(pc.red(`Error: ${message}`));
}

export function printSuccess(message: string): void {
  console.log(pc.green(`✅ ${message}`));
}

export function printWarning(message: string): void {
  console.log(pc.yellow(`⚠️  ${message}`));
}

export function printInfo(message: string): void {
  console.log(pc.cyan(message));
}
