import * as vscode from 'vscode';
import { ProjectModernAPI } from './api';
import { PackageHoverProvider } from './providers/hoverProvider';
import { DiagnosticsProvider } from './providers/diagnostics';
import { PackageTreeProvider } from './providers/treeProvider';
import { registerCommands } from './commands';

export function activate(context: vscode.ExtensionContext) {
    console.log('Project Modern extension is now active');

    const api = new ProjectModernAPI();
    const outputChannel = vscode.window.createOutputChannel('Project Modern');

    // Register tree data provider for sidebar
    const treeProvider = new PackageTreeProvider(api);
    vscode.window.registerTreeDataProvider('projectModern.explorer', treeProvider);

    // Register hover provider for package.json
    const hoverProvider = vscode.languages.registerHoverProvider(
        { language: 'json', pattern: '**/package.json' },
        new PackageHoverProvider(api)
    );

    // Register diagnostics provider
    const diagnosticsProvider = new DiagnosticsProvider(api);
    
    // Watch for package.json changes
    const packageJsonWatcher = vscode.workspace.createFileSystemWatcher('**/package.json');
    packageJsonWatcher.onDidChange(() => {
        diagnosticsProvider.refreshDiagnostics();
        treeProvider.refresh();
    });
    packageJsonWatcher.onDidCreate(() => {
        diagnosticsProvider.refreshDiagnostics();
        treeProvider.refresh();
    });

    // Initial diagnostics
    diagnosticsProvider.refreshDiagnostics();

    // Register commands
    const commands = registerCommands(api, treeProvider, outputChannel);

    // Add all disposables to context
    context.subscriptions.push(
        hoverProvider,
        packageJsonWatcher,
        outputChannel,
        ...commands
    );

    // Show welcome message
    vscode.window.showInformationMessage(
        'Project Modern is active. Hover over dependencies in package.json to see scores.',
        'Search Package',
        'Evaluate Project'
    ).then(selection => {
        if (selection === 'Search Package') {
            vscode.commands.executeCommand('projectModern.search');
        } else if (selection === 'Evaluate Project') {
            vscode.commands.executeCommand('projectModern.evaluateProject');
        }
    });
}

export function deactivate() {
    console.log('Project Modern extension is now deactivated');
}
