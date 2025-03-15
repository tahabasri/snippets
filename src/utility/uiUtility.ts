import * as vscode from 'vscode';
import { Labels } from '../config/labels';
import { Snippet } from '../interface/snippet';

export class UIUtility {
    static async requestSnippetFromUser(savedSnippets: Snippet[]): Promise<Snippet | undefined> {
        interface CustomQuickPickItem extends vscode.QuickPickItem {
            label: string;
            detail: string,
            value: Snippet
        }

        const arr: CustomQuickPickItem[] = savedSnippets.map(s => {
            return {
                label: s.label,
                detail: s.value?.slice(0, 75) ?? "",
                value: s
            };
        });

        const selection = await vscode.window.showQuickPick(arr, {
            placeHolder: Labels.insertSnippetName,
            matchOnDetail: true
        });

        if (!selection ||
            !selection.value) {
            return;
        }

        // refer to selected snippet
        return selection.value;
    }

    static async requestSnippetValue(): Promise<string | undefined> {
        return await vscode.window.showInputBox({
            prompt: Labels.snippetValuePrompt,
            placeHolder: Labels.snippetValuePlaceholder,
            validateInput: text => {
                return text === "" ? Labels.snippetValueValidationMsg : null;
            }
        });
    }

    static async requestSnippetName(): Promise<string | undefined> {
        return await vscode.window.showInputBox({
            prompt: Labels.snippetNamePrompt,
            placeHolder: Labels.snippetNamePlaceholder,
            validateInput: text => {
                return text === "" ? Labels.snippetNameValidationMsg : null;
            }
        });
    }

    static async requestSnippetFolderName(): Promise<string | undefined> {
        return await vscode.window.showInputBox({
            prompt: Labels.snippetNameFolderPrompt,
            placeHolder: Labels.snippetNameFolderPlaceholder,
            validateInput: text => {
                return text === "" ? Labels.snippetFolderNameValidationMsg : null;
            }
        });
    }

	static async requestTargetSnippetsView(): Promise<string | undefined> {
        const selection = await vscode.window.showQuickPick([Labels.globalSnippets, Labels.wsSnippets], {
            placeHolder: Labels.viewType,
            matchOnDetail: true
        });

        if (!selection) {
            return;
        }

        // refer to selected snippet
        return selection;
	}

    static getLanguageNamesWithExtensions = () => {
        const languages = vscode.extensions.all
            .map(i => <any[]>(i.packageJSON as any)?.contributes?.languages)
            .filter(i => i)
            .reduce((a, b) => a.concat(b), [])
            .filter(i => 0 < (i.aliases?.length ?? 0))
            .map(i => {
                return {
                    id: i?.id,
                    alias: i?.aliases?.[0],
                    extension: i?.extensions?.[0]
                };
            });

        // Remove duplicates based on language ID
        const uniqueLanguages = new Map<string, { id: string, alias: string, extension: string }>();
        languages.forEach(language => {
            if (!uniqueLanguages.has(language.id)) {
                uniqueLanguages.set(language.id, language);
            }
        });

        // sort by alias
        return Array.from(uniqueLanguages.values())
            .sort((a, b) => a.alias.localeCompare(b.alias));
    };
}