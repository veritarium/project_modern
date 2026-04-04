import * as vscode from 'vscode';
import type { ProjectModernAPI } from '../api';

export class DiagnosticsProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor(private api: ProjectModernAPI) {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('projectModern');
  }

  async refreshDiagnostics(): Promise<void> {
    const config = vscode.workspace.getConfiguration('projectModern');
    const showDiagnostics = config.get('showDiagnostics', true);
    const minimumScore = config.get('minimumScore', 6.0);

    if (!showDiagnostics) {
      this.diagnosticCollection.clear();
      return;
    }

    // Find all package.json files in the workspace
    const packageJsonFiles = await vscode.workspace.findFiles(
      '**/package.json',
      '**/node_modules/**'
    );

    for (const file of packageJsonFiles) {
      try {
        const document = await vscode.workspace.openTextDocument(file);
        const diagnostics = await this.analyzePackageJson(document, minimumScore);
        this.diagnosticCollection.set(file, diagnostics);
      } catch (error) {
        console.error(`Error analyzing ${file}: ${error}`);
      }
    }
  }

  private async analyzePackageJson(
    document: vscode.TextDocument,
    minimumScore: number
  ): Promise<vscode.Diagnostic[]> {
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    try {
      const packageJson = JSON.parse(text);
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      for (const [name, _version] of Object.entries(dependencies)) {
        try {
          const data = await this.api.evaluateTool('npm', name);

          if (data && data.evaluation.composite < minimumScore) {
            const range = this.findDependencyRange(document, name);
            if (range) {
              const diagnostic = this.createDiagnostic(name, data, range, minimumScore);
              diagnostics.push(diagnostic);
            }
          }
        } catch (_error) {
          // Skip packages that can't be evaluated
        }
      }
    } catch (_error) {
      // Invalid JSON
    }

    return diagnostics;
  }

  private findDependencyRange(
    document: vscode.TextDocument,
    packageName: string
  ): vscode.Range | null {
    const text = document.getText();
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match the package name in quotes
      const match = line.match(new RegExp(`["']${packageName}["']`));
      if (match) {
        const startChar = line.indexOf(match[0]);
        const endChar = startChar + match[0].length;
        return new vscode.Range(i, startChar, i, endChar);
      }
    }

    return null;
  }

  private createDiagnostic(
    packageName: string,
    data: any,
    range: vscode.Range,
    minimumScore: number
  ): vscode.Diagnostic {
    const score = data.evaluation.composite;
    const severity =
      score < 4
        ? vscode.DiagnosticSeverity.Error
        : score < minimumScore
          ? vscode.DiagnosticSeverity.Warning
          : vscode.DiagnosticSeverity.Information;

    const diagnostic = new vscode.Diagnostic(
      range,
      `${packageName}: Score ${score.toFixed(1)}/10 (${data.evaluation.grade}) - ${data.evaluation.recommendation}`,
      severity
    );

    diagnostic.code = 'projectModern/lowScore';
    diagnostic.source = 'Project Modern';

    // Add related information
    if (data.metadata?.repository) {
      diagnostic.relatedInformation = [
        new vscode.DiagnosticRelatedInformation(
          new vscode.Location(
            vscode.Uri.parse(data.metadata.repository),
            new vscode.Position(0, 0)
          ),
          'View repository'
        ),
      ];
    }

    return diagnostic;
  }

  dispose(): void {
    this.diagnosticCollection.dispose();
  }
}
