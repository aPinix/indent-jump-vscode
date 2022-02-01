// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const moveUp = vscode.commands.registerCommand('indent-jump.moveUp', () => {
    const editor = vscode.window.activeTextEditor; // has to be on all functions to catch the current active text editor
    if (editor) {
      new IndentJumpMover(editor).moveUp();
    }
  });

  const moveDown = vscode.commands.registerCommand('indent-jump.moveDown', () => {
    const editor = vscode.window.activeTextEditor; // has to be on all functions to catch the current active text editor
    if (editor) {
      new IndentJumpMover(editor).moveDown();
    }
  });

  // const moveRight = vscode.commands.registerCommand('indent-jump.moveRight', () => {
  //   if (editor) {
  //     new IndentJumpMover(editor).moveRight();
  //   }
  // });

  const selectUp = vscode.commands.registerCommand('indent-jump.selectUp', () => {
    const editor = vscode.window.activeTextEditor; // has to be on all functions to catch the current active text editor
    if (editor) {
      new IndentJumpMover(editor).selectUp();
    }
  });

  const selectDown = vscode.commands.registerCommand('indent-jump.selectDown', () => {
    const editor = vscode.window.activeTextEditor; // has to be on all functions to catch the current active text editor
    if (editor) {
      new IndentJumpMover(editor).selectDown();
    }
  });

  // move
  context.subscriptions.push(moveUp);
  context.subscriptions.push(moveDown);
  // context.subscriptions.push(moveRight);

  // select
  context.subscriptions.push(selectUp);
  context.subscriptions.push(selectDown);
}

// this method is called when your extension is deactivated
export function deactivate() {}

class IndentJumpMover {
  editor: vscode.TextEditor;

  constructor(editor: vscode.TextEditor) {
    this.editor = editor;
  }

  public moveUp() {
    let currentLineNumber = this.editor.selection.active.line;
    let currentLevel = this.indentJumpForLine(currentLineNumber);
    let nextLine = this.findPreviousLine(currentLineNumber, currentLevel);

    this.move(nextLine);
  }

  public moveDown() {
    let currentLineNumber = this.editor.selection.active.line;
    let currentLevel = this.indentJumpForLine(currentLineNumber);
    let nextLine = this.findNextLine(currentLineNumber, currentLevel);

    this.move(nextLine);
  }

  // public moveRight() {
  //   let currentPosition = this.editor.selection.active.character;
  //   let indentationPosition = this.indentJumpForLine(this.editor.selection.start.line);

  //   if (currentPosition < indentationPosition) {
  //     if (this.editor.selections.length > 1) {
  //       vscode.commands.executeCommand('cursorWordEndRight').then(() => {
  //         vscode.commands.executeCommand('cursorWordStartLeft');
  //       });
  //     } else {
  //       let position = new vscode.Position(this.editor.selection.active.line, indentationPosition);
  //       this.editor.selection = new vscode.Selection(position, position);
  //     }
  //   } else {
  //     vscode.commands.executeCommand('cursorWordEndRight');
  //   }
  // }

  public selectUp() {
    let startPoint = this.editor.selection.anchor;
    this.moveUp();
    let endPoint = this.editor.selection.active;
    this.editor.selection = new vscode.Selection(startPoint, endPoint);
  }

  public selectDown() {
    let startPoint = this.editor.selection.anchor;
    this.moveDown();
    let endPoint = this.editor.selection.active;
    this.editor.selection = new vscode.Selection(startPoint, endPoint);
  }

  private move(toLine: number | undefined) {
    let currentCharacter = this.editor.selection.anchor.character;
    let position = this.editor.selection.active;
    let newPosition = position.with(toLine, currentCharacter);
    let selection = new vscode.Selection(newPosition, newPosition);

    this.editor.selection = selection;
    this.editor.revealRange(new vscode.Range(newPosition, newPosition));
  }

  private indentJumpForLine(lineToCheck: number) {
    const line = this.editor.document.lineAt(lineToCheck);
    return line.firstNonWhitespaceCharacterIndex;
  }

  private emptyLine(lineNumber: number) {
    const line = this.editor.document.lineAt(lineNumber);
    return line.isEmptyOrWhitespace;
  }

  private findNextLine(currentLineNumber: number, currentIndentJump: number) {
    const endLineNumber = this.editor.document.lineCount - 1;
    if (currentLineNumber === endLineNumber) {
      return;
    }
    const nextLineNumber = currentLineNumber + 1;
    const jumpingOverSpace =
      this.indentJumpForLine(nextLineNumber) !== currentIndentJump ||
      this.emptyLine(nextLineNumber);

    for (let lineNumber = nextLineNumber; lineNumber <= endLineNumber; lineNumber++) {
      let indentationForLine = this.indentJumpForLine(lineNumber);

      if (
        jumpingOverSpace &&
        indentationForLine === currentIndentJump &&
        !this.emptyLine(lineNumber)
      ) {
        return lineNumber;
      } else if (
        !jumpingOverSpace &&
        (
					indentationForLine !== currentIndentJump ||
					this.emptyLine(lineNumber)
				)
      ) {
        return lineNumber - 1;
      } else if (
        !jumpingOverSpace &&
        indentationForLine === currentIndentJump &&
        lineNumber === endLineNumber
      ) {
        return lineNumber;
      }
    }

    return;
  }

  private findPreviousLine(currentLineNumber: number, currentIndentJump: number) {
    if (currentLineNumber === 0) {
      return;
    }

    const previousLineNumber = currentLineNumber - 1;
    const jumpingOverSpace =
      this.indentJumpForLine(previousLineNumber) !== currentIndentJump ||
      this.emptyLine(previousLineNumber);

    for (let lineNumber = previousLineNumber; lineNumber >= 0; lineNumber--) {
      let indentationForLine = this.indentJumpForLine(lineNumber);

      if (
        jumpingOverSpace &&
        indentationForLine === currentIndentJump &&
        !this.emptyLine(lineNumber)
      ) {
        return lineNumber;
      } else if (
        !jumpingOverSpace &&
        (
					indentationForLine !== currentIndentJump ||
					this.emptyLine(lineNumber)
				)
      ) {
        return lineNumber + 1;
      } else if (
        !jumpingOverSpace &&
        indentationForLine === currentIndentJump &&
        lineNumber === 0
      ) {
        return lineNumber;
      }
    }
    return;
  }

  dispose() {}
}
