#!/usr/bin/env node
/**
 * Project Modern - CLI Tests
 */

import { execSync } from 'child_process';

const CLI_PATH = './cli.js';

function runCommand(cmd) {
  try {
    return {
      success: true,
      output: execSync(`node ${CLI_PATH} ${cmd}`, { encoding: 'utf-8' }),
    };
  } catch (error) {
    return {
      success: false,
      output: error.stdout || error.message,
      code: error.status,
    };
  }
}

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ============================================================================
// TESTS
// ============================================================================

console.log('\n🧪 Project Modern CLI Tests\n');

let passed = 0;
let failed = 0;

// Test 1: Help command
if (
  test('help command shows usage', () => {
    const result = runCommand('help');
    assert(result.success, 'Command should succeed');
    assert(result.output.includes('Project Modern CLI'), 'Should show CLI name');
    assert(result.output.includes('search'), 'Should mention search command');
    assert(result.output.includes('audit'), 'Should mention audit command');
  })
)
  passed++;
else failed++;

// Test 2: Search without args shows error
if (
  test('search without package shows error', () => {
    const result = runCommand('search');
    assert(!result.success, 'Command should fail');
    assert(
      result.output.includes('Error') || result.output.includes('required'),
      'Should show error'
    );
  })
)
  passed++;
else failed++;

// Test 3: API connection check (will fail if API not running, that's OK)
if (
  test('search with package attempts API call', () => {
    const result = runCommand('search react');
    // Either succeeds (API running) or fails with connection error
    assert(
      result.output.includes('Evaluating') ||
        result.output.includes('Cannot connect') ||
        result.output.includes('react'),
      'Should attempt to evaluate'
    );
  })
)
  passed++;
else failed++;

// Test 4: Audit without package.json shows error
if (
  test('audit without package.json shows error', () => {
    const result = runCommand('audit --path /nonexistent/package.json');
    assert(!result.success, 'Command should fail');
    assert(
      result.output.includes('Cannot find') || result.output.includes('Error'),
      'Should show file not found'
    );
  })
)
  passed++;
else failed++;

// Test 5: Compare with insufficient args shows error
if (
  test('compare with one package shows error', () => {
    const result = runCommand('compare react');
    assert(!result.success, 'Command should fail');
    assert(result.output.includes('at least 2'), 'Should mention need for 2 packages');
  })
)
  passed++;
else failed++;

// Test 6: Unknown command shows error
if (
  test('unknown command shows error', () => {
    const result = runCommand('unknown');
    assert(!result.success, 'Command should fail');
    assert(result.output.includes('Unknown command'), 'Should show unknown command error');
  })
)
  passed++;
else failed++;

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
