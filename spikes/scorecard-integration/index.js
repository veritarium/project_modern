#!/usr/bin/env node
/**
 * SPIKE: OpenSSF Scorecard + Libraries.io Integration
 *
 * Goal: Prove we can build Project Modern by gluing existing tools
 * instead of building everything from scratch.
 */

import fetch from 'node-fetch';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

// ============================================================================
// PART 1: OpenSSF Scorecard Integration
// ============================================================================

/**
 * Run OpenSSF Scorecard on a GitHub repository
 * Requires: scorecard CLI installed (https://github.com/ossf/scorecard)
 */
async function getScorecardData(owner, repo) {
  const fullName = `${owner}/${repo}`;

  try {
    // Check if scorecard is installed
    execSync('scorecard version', { stdio: 'pipe' });
  } catch (e) {
    console.log('⚠️  OpenSSF Scorecard CLI not installed');
    console.log('   Install: https://github.com/ossf/scorecard#installation');
    console.log('   Using mock data for this spike...\n');
    return getMockScorecardData(fullName);
  }

  try {
    const output = execSync(`scorecard --repo=github.com/${fullName} --format=json`, {
      encoding: 'utf-8',
      timeout: 60000,
    });
    return JSON.parse(output);
  } catch (error) {
    console.error(`❌ Scorecard failed for ${fullName}:`, error.message);
    return null;
  }
}

function getMockScorecardData(repo) {
  // Mock data for demonstration
  return {
    repo: repo,
    score: 7.2,
    checks: [
      { name: 'Code-Review', score: 10, reason: 'PRs are reviewed' },
      { name: 'Maintained', score: 8, reason: '5 commit(s) out of 5 in the last 90 days' },
      { name: 'Security-Policy', score: 10, reason: 'security policy file detected' },
      { name: 'Dependency-Update-Tool', score: 10, reason: 'dependabot config detected' },
      { name: 'Binary-Artifacts', score: 10, reason: 'no binaries found in the repo' },
      { name: 'Branch-Protection', score: 3, reason: 'branch protection not enabled on main' },
      { name: 'Signed-Releases', score: 0, reason: 'no releases found' },
    ],
  };
}

// ============================================================================
// PART 2: Libraries.io Integration
// ============================================================================

const LIBRARIES_IO_API = 'https://libraries.io/api';

/**
 * Fetch package metadata from Libraries.io
 */
async function getLibrariesIoData(platform, name) {
  try {
    const response = await fetch(
      `${LIBRARIES_IO_API}/${platform}/${name}?api_key=${process.env.LIBRARIES_IO_API_KEY || ''}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`⚠️  Package ${name} not found on Libraries.io`);
        return getMockLibrariesIoData(platform, name);
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Libraries.io API error:`, error.message);
    return getMockLibrariesIoData(platform, name);
  }
}

function getMockLibrariesIoData(platform, name) {
  return {
    name: name,
    platform: platform,
    description: `Mock description for ${name}`,
    latest_release_number: '1.0.0',
    latest_release_published_at: '2024-01-15',
    stars: 5234,
    forks: 892,
    dependent_repos_count: 12500,
    dependent_packages_count: 340,
    rank: 42,
    status: 'Active',
    repository_url: `https://github.com/example/${name}`,
    license: 'MIT',
    keywords: ['javascript', 'framework', 'frontend'],
  };
}

// ============================================================================
// PART 3: GitHub API (for additional metrics)
// ============================================================================

async function getGitHubData(owner, repo) {
  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ GitHub API error:`, error.message);
    return getMockGitHubData(owner, repo);
  }
}

function getMockGitHubData(owner, repo) {
  return {
    full_name: `${owner}/${repo}`,
    stargazers_count: 5234,
    forks_count: 892,
    open_issues_count: 45,
    pushed_at: '2024-03-20T10:30:00Z',
    created_at: '2019-05-15T08:00:00Z',
    updated_at: '2024-03-20T10:30:00Z',
    language: 'TypeScript',
    topics: ['javascript', 'framework', 'frontend'],
    has_wiki: true,
    has_pages: false,
    license: { spdx_id: 'MIT' },
  };
}

// ============================================================================
// PART 4: Our Unique Layer - Combined Scoring & Recommendations
// ============================================================================

function calculateProjectModernScore(scorecardData, librariesData, githubData) {
  // Our unique scoring algorithm that combines external data sources
  const scores = {
    // From Scorecard (security focus)
    security: scorecardData?.score || 0,

    // From Libraries.io (maintenance focus)
    maintenance: calculateMaintenanceScore(librariesData),

    // From GitHub (popularity focus)
    popularity: calculatePopularityScore(githubData),

    // From Libraries.io (ecosystem focus)
    ecosystem: calculateEcosystemScore(librariesData),
  };

  // Weighted composite (our unique formula)
  const composite =
    scores.security * 0.3 +
    scores.maintenance * 0.25 +
    scores.popularity * 0.25 +
    scores.ecosystem * 0.2;

  return {
    composite: Math.round(composite * 10) / 10,
    breakdown: scores,
    details: {
      scorecard: scorecardData,
      libraries: librariesData,
      github: githubData,
    },
  };
}

function calculateMaintenanceScore(data) {
  if (!data) return 0;

  let score = 5; // Base score

  // Recent release bonus
  if (data.latest_release_published_at) {
    const daysSinceRelease =
      (Date.now() - new Date(data.latest_release_published_at)) / (1000 * 60 * 60 * 24);
    if (daysSinceRelease < 30) score += 2;
    else if (daysSinceRelease < 90) score += 1;
  }

  // Active status
  if (data.status === 'Active') score += 1.5;

  // Has dependents (people are using it)
  if (data.dependent_packages_count > 1000) score += 1;
  else if (data.dependent_packages_count > 100) score += 0.5;

  return Math.min(10, score);
}

function calculatePopularityScore(data) {
  if (!data) return 0;

  // Logarithmic scoring for stars
  const stars = data.stargazers_count || 0;
  if (stars > 50000) return 10;
  if (stars > 20000) return 9;
  if (stars > 10000) return 8;
  if (stars > 5000) return 7;
  if (stars > 2000) return 6;
  if (stars > 1000) return 5;
  if (stars > 500) return 4;
  if (stars > 200) return 3;
  if (stars > 50) return 2;
  return 1;
}

function calculateEcosystemScore(data) {
  if (!data) return 0;

  let score = 5;

  // Dependent repos (usage in the wild)
  const repos = data.dependent_repos_count || 0;
  if (repos > 100000) score += 3;
  else if (repos > 10000) score += 2;
  else if (repos > 1000) score += 1;

  // Keywords indicate discoverability
  if (data.keywords && data.keywords.length > 0) score += 0.5;

  return Math.min(10, score);
}

// ============================================================================
// PART 5: CLI Interface (Our Product)
// ============================================================================

function formatScore(score) {
  const color = score >= 8 ? '🟢' : score >= 6 ? '🟡' : '🔴';
  return `${color} ${score.toFixed(1)}/10`;
}

function printResults(toolName, result) {
  console.log('\n' + '='.repeat(60));
  console.log(`📦 ${toolName}`);
  console.log('='.repeat(60));

  console.log(`\n🏆 Project Modern Score: ${formatScore(result.composite)}`);

  console.log('\n📊 Score Breakdown:');
  console.log(`   Security:      ${formatScore(result.breakdown.security)} (from Scorecard)`);
  console.log(`   Maintenance:   ${formatScore(result.breakdown.maintenance)} (from Libraries.io)`);
  console.log(`   Popularity:    ${formatScore(result.breakdown.popularity)} (from GitHub)`);
  console.log(`   Ecosystem:     ${formatScore(result.breakdown.ecosystem)} (from Libraries.io)`);

  if (result.details.scorecard?.checks) {
    console.log('\n🔒 Security Checks (OpenSSF Scorecard):');
    result.details.scorecard.checks.slice(0, 5).forEach((check) => {
      const icon = check.score >= 8 ? '✅' : check.score >= 5 ? '⚠️' : '❌';
      console.log(`   ${icon} ${check.name}: ${check.score}/10`);
    });
  }

  if (result.details.libraries) {
    console.log('\n📈 Activity (Libraries.io):');
    console.log(`   Stars: ${result.details.libraries.stars?.toLocaleString() || 'N/A'}`);
    console.log(`   Forks: ${result.details.libraries.forks?.toLocaleString() || 'N/A'}`);
    console.log(
      `   Dependents: ${result.details.libraries.dependent_packages_count?.toLocaleString() || 'N/A'}`
    );
    console.log(`   Status: ${result.details.libraries.status || 'N/A'}`);
  }

  console.log('\n💡 Recommendation:');
  if (result.composite >= 8) {
    console.log('   ✅ Excellent choice - High quality, well-maintained');
  } else if (result.composite >= 6) {
    console.log('   🟡 Good choice - Consider alternatives for critical use');
  } else {
    console.log('   🔴 Use with caution - Review alternatives');
  }

  console.log('');
}

// ============================================================================
// MAIN
// ============================================================================

async function evaluateTool(owner, repo, platform = 'npm') {
  console.log(`\n🔍 Evaluating ${owner}/${repo}...`);
  console.log('   Fetching data from OpenSSF Scorecard, Libraries.io, and GitHub...');

  // Fetch from all sources in parallel
  const [scorecardData, librariesData, githubData] = await Promise.all([
    getScorecardData(owner, repo),
    getLibrariesIoData(platform, repo),
    getGitHubData(owner, repo),
  ]);

  // Calculate our combined score
  const result = calculateProjectModernScore(scorecardData, librariesData, githubData);

  // Display results
  printResults(`${owner}/${repo}`, result);

  return result;
}

async function compareTools(tools) {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 TOOL COMPARISON');
  console.log('='.repeat(60));

  const results = [];
  for (const tool of tools) {
    const result = await evaluateTool(tool.owner, tool.repo, tool.platform);
    results.push({ ...tool, ...result });
  }

  // Sort by composite score
  results.sort((a, b) => b.composite - a.composite);

  console.log('\n🏆 RANKING:');
  console.log('-'.repeat(60));
  results.forEach((r, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
    console.log(`${medal} ${i + 1}. ${r.owner}/${r.repo}: ${formatScore(r.composite)}`);
  });

  return results;
}

// ============================================================================
// DEMO
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('PROJECT MODERN - SPIKE: Glue Architecture Proof');
  console.log('='.repeat(60));
  console.log('\nThis spike demonstrates:');
  console.log('✅ OpenSSF Scorecard integration (security scoring)');
  console.log('✅ Libraries.io integration (maintenance data)');
  console.log('✅ GitHub API integration (popularity metrics)');
  console.log('✅ Our unique combined scoring algorithm');
  console.log('\nNote: Using mock data. Install scorecard CLI and add API keys for live data.');

  // Compare some popular tools
  await compareTools([
    { owner: 'facebook', repo: 'react', platform: 'npm' },
    { owner: 'vuejs', repo: 'vue', platform: 'npm' },
    { owner: 'sveltejs', repo: 'svelte', platform: 'npm' },
  ]);

  console.log('\n' + '='.repeat(60));
  console.log('✅ SPIKE COMPLETE');
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('1. Install OpenSSF Scorecard CLI for real security data');
  console.log('2. Get Libraries.io API key for real maintenance data');
  console.log('3. Add GitHub token for higher rate limits');
  console.log('4. Build IDE extensions that use this scoring');
  console.log('5. Add semantic search layer on top');
  console.log('');
}

main().catch(console.error);
