import * as vscode from 'vscode';
import { ProjectModernAPI } from '../api';

export class PackageHoverProvider implements vscode.HoverProvider {
  constructor(private api: ProjectModernAPI) {}

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | undefined> {
    // Get the word at the position
    const range = document.getWordRangeAtPosition(position, /["'][^"']+["']/);
    if (!range) {
      return undefined;
    }

    const text = document.getText(range);
    const packageName = text.replace(/["']/g, '');

    // Check if we're in a dependencies section
    const lineText = document.lineAt(position.line).text;
    const isInDependencies = this.isInDependenciesSection(document, position.line);

    if (!isInDependencies) {
      return undefined;
    }

    // Skip if it looks like a version number
    if (packageName.match(/^\^|^~|^>=|^<=|^\d/)) {
      return undefined;
    }

    // Skip common non-package keys
    const nonPackages = ['name', 'version', 'description', 'main', 'scripts', 'repository', 'keywords', 'author', 'license', 'bugs', 'homepage', 'devDependencies', 'dependencies', 'peerDependencies', 'optionalDependencies'];
    if (nonPackages.includes(packageName)) {
      return undefined;
    }

    try {
      const data = await this.api.evaluateTool('npm', packageName);
      
      if (!data) {
        return undefined;
      }

      return this.createHoverContent(data);
    } catch (error) {
      // Silently fail - don't show error hovers
      return undefined;
    }
  }

  private isInDependenciesSection(document: vscode.TextDocument, line: number): boolean {
    const text = document.getText();
    const lines = text.split('\n');
    
    // Look backwards to find if we're in a dependencies section
    for (let i = line; i >= 0; i--) {
      const lineText = lines[i];
      if (lineText.includes('"dependencies"') || 
          lineText.includes('"devDependencies"') ||
          lineText.includes('"peerDependencies"') ||
          lineText.includes('"optionalDependencies"')) {
        return true;
      }
      // Stop if we hit another top-level section
      if (lineText.match(/^\s*"[^"]+"\s*:\s*\{/) && 
          !lineText.includes('dependencies')) {
        return false;
      }
    }
    return false;
  }

  private createHoverContent(data: any): vscode.Hover {
    const eval_ = data.evaluation;
    const scoreColor = this.api.getScoreColor(eval_.composite);
    
    const markdown = new vscode.MarkdownString();
    markdown.isTrusted = true;
    markdown.supportHtml = true;

    // Header
    markdown.appendMarkdown(`## 📦 ${data.name}\n\n`);
    
    // Score
    markdown.appendMarkdown(
      `### 🏆 Project Modern Score: **${eval_.composite.toFixed(1)}/10** ${eval_.grade}\n\n`
    );

    // Breakdown
    markdown.appendMarkdown('**Score Breakdown:**\n\n');
    markdown.appendMarkdown(`- Security: ${this.api.formatScore(eval_.breakdown.security)}\n`);
    markdown.appendMarkdown(`- Maintenance: ${this.api.formatScore(eval_.breakdown.maintenance)}\n`);
    markdown.appendMarkdown(`- Popularity: ${this.api.formatScore(eval_.breakdown.popularity)}\n`);
    markdown.appendMarkdown(`- Ecosystem: ${this.api.formatScore(eval_.breakdown.ecosystem)}\n\n`);

    // Metadata
    if (data.metadata?.description) {
      markdown.appendMarkdown(`**Description:** ${data.metadata.description}\n\n`);
    }

    // Stats
    markdown.appendMarkdown('**Stats:**\n\n');
    if (data.sources.github?.stars) {
      markdown.appendMarkdown(`- ⭐ Stars: ${data.sources.github.stars.toLocaleString()}\n`);
    }
    if (data.sources.libraries?.dependents) {
      markdown.appendMarkdown(`- 📦 Dependents: ${data.sources.libraries.dependents.toLocaleString()}\n`);
    }
    if (data.metadata?.license) {
      markdown.appendMarkdown(`- 📄 License: ${data.metadata.license}\n`);
    }
    markdown.appendMarkdown('\n');

    // Recommendation
    markdown.appendMarkdown(`**Recommendation:** ${eval_.recommendation}\n\n`);

    // Links
    if (data.metadata?.repository) {
      markdown.appendMarkdown(`[View Repository](${data.metadata.repository})\n\n`);
    }

    // Footer
    markdown.appendMarkdown('---\n');
    markdown.appendMarkdown('*Powered by Project Modern*');

    return new vscode.Hover(markdown);
  }
}
