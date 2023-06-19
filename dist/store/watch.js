const { TextEditor, Disposable } = require("atom");
const { action } = require("mobx");
const { OutputStore } = require("./output.js");
const { log } = require("../utils.js");

class WatchStore {
  constructor(kernel) {
    this.outputStore = new OutputStore();
    this.run = () => {
      const code = this.getCode();
      log("watchview running:", code);
      if (code && code.length > 0) {
        this.kernel.executeWatch(code, (result) => {
          this.outputStore.appendOutput(result);
        });
      }
    };
    this.setCode = (code) => {
      this.editor.setText(code);
    };
    this.getCode = () => {
      return this.editor.getText();
    };
    this.focus = () => {
      this.editor.element.focus();
    };
    this.kernel = kernel;
    this.editor = atom.workspace.buildTextEditor({
      softWrapped: true,
      lineNumberGutterVisible: false,
    });
    const grammar = this.kernel.grammar;
    if (grammar) {
      atom.grammars.assignLanguageMode(
        this.editor.getBuffer(),
        grammar.scopeName
      );
    }
    this.editor.moveToTop();
    this.editor.element.classList.add("watch-input");
  }
}

module.exports = WatchStore;
