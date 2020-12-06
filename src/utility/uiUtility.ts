import * as vscode from 'vscode';
import { Labels } from '../config/Labels';
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
            console.log(`No valid selection made!`);
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
}