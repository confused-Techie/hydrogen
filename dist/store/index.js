const { TextEditor, CompositeDisposable, File, Grammar } = require("atom");
const { observable, computed, action, keys } = require("mobx");
const { isMultilanguageGrammar, getEmbeddedScope, isUnsavedFilePath } = require("../utils");
const codeManager = require("../code-manager");
const MarkerStore = require("./markers");
const Kernel = require("../kernel");
const commutable = require("@nteract/commutable");

class Store {
  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.markersMapping = new Map();
    this.runningKernels = [];
    this.kernelMapping = new Map();
    this.startingKernels = new Map();
    this.editor = atom.workspace.getActiveTextEditor();
    this.configMapping = new Map();
    this.globalMode = Boolean(atom.config.get("Hydrogen.globalMode"));
  }
  get kernel() {
    if (!this.grammar || !this.editor) {
      return null;
    }
    if (this.globalMode) {
      const currentScopeName = this.grammar.scopeName;
      return this.runningKernels.find(
        (k) => k.grammar.scopeName === currentScopeName
      );
    }
    const file = this.filePath;
    if (!file) {
      return null;
    }
    const kernelOrMap = this.kernelMapping.get(file);
    if (!kernelOrMap) {
      return null;
    }
    if (kernelOrMap instanceof Kernel) {
      return kernelOrMap;
    }
    return this.grammar && this.grammar.name
      ? kernelOrMap.get(this.grammar.name)
      : null;
  }
  get filePath() {
    const editor = this.editor;
    if (!editor) {
      return null;
    }
    const savedFilePath = editor.getPath();
    return savedFilePath ? savedFilePath : `Unsaved Editor ${editor.id}`;
  }
  // TODO fix the types using mobx types
  get filePaths() {
    return keys(this.kernelMapping);
  }
  get notebook() {
    const editor = this.editor;
    if (!editor) {
      return null;
    }
    let notebook = commutable.emptyNotebook;
    if (this.kernel) {
      notebook = notebook.setIn(
        ["metadata", "kernelspec"],
        this.kernel.transport.kernelSpec
      );
    }
    const cellRanges = codeManager.getCells(editor);
    cellRanges.forEach((cell) => {
      const { start, end } = cell;
      let source = codeManager.getTextInRange(editor, start, end);
      source = source ? source : "";
      // When the cell marker following a given cell range is on its own line,
      // the newline immediately preceding that cell marker is included in
      // `source`. We remove that here. See #1512 for more details.
      if (source.slice(-1) === "\n") {
        source = source.slice(0, -1);
      }
      const cellType = codeManager.getMetadataForRow(editor, start);
      let newCell;
      if (cellType === "codecell") {
        newCell = commutable.emptyCodeCell.set("source", source);
      } else if (cellType === "markdown") {
        source = codeManager.removeCommentsMarkdownCell(editor, source);
        newCell = commutable.emptyMarkdownCell.set("source", source);
      }
      notebook = commutable.appendCellToNotebook(notebook, newCell);
    });
    return commutable.toJS(notebook);
  }
  get markers() {
    const editor = this.editor;
    if (!editor) {
      return null;
    }
    const markerStore = this.markersMapping.get(editor.id);
    return markerStore ? markerStore : this.newMarkerStore(editor.id);
  }
  newMarkerStore(editorId) {
    const markerStore = new MarkerStore();
    this.markersMapping.set(editorId, markerStore);
    return markerStore;
  }
  startKernel(kernelDisplayName) {
    this.startingKernels.set(kernelDisplayName, true);
  }
  addFileDisposer(editor, filePath) {
    const fileDisposer = new CompositeDisposable();
    if (isUnsavedFilePath(filePath)) {
      fileDisposer.add(
        editor.onDidSave((event) => {
          fileDisposer.dispose();
          this.addFileDisposer(editor, event.path); // Add another `fileDisposer` once it's saved
        })
      );
      fileDisposer.add(
        editor.onDidDestroy(() => {
          this.kernelMapping.delete(filePath);
          fileDisposer.dispose();
        })
      );
    } else {
      const file = new File(filePath);
      fileDisposer.add(
        file.onDidDelete(() => {
          this.kernelMapping.delete(filePath);
          fileDisposer.dispose();
        })
      );
    }
    this.subscriptions.add(fileDisposer);
  }
  newKernel(kernel, filePath, editor, grammar) {
    if (isMultilanguageGrammar(editor.getGrammar())) {
      if (!this.kernelMapping.has(filePath)) {
        this.kernelMapping.set(filePath, new Map());
      }
      // TODO when will this be a Kernel?
      const multiLanguageMap = this.kernelMapping.get(filePath);
      if (multiLanguageMap && typeof multiLanguageMap.set === "function") {
        multiLanguageMap.set(grammar.name, kernel);
      }
    } else {
      this.kernelMapping.set(filePath, kernel);
    }
    this.addFileDisposer(editor, filePath);
    const index = this.runningKernels.findIndex((k) => k === kernel);
    if (index === -1) {
      this.runningKernels.push(kernel);
    }
    // delete startingKernel since store.kernel now in place to prevent duplicate kernel
    this.startingKernels.delete(kernel.kernelSpec.display_name);
  }
  deleteKernel(kernel) {
    const grammar = kernel.grammar.name;
    const files = this.getFilesForKernel(kernel);
    files.forEach((file) => {
      const kernelOrMap = this.kernelMapping.get(file);
      if (!kernelOrMap) {
        return;
      }
      if (kernelOrMap instanceof Kernel) {
        this.kernelMapping.delete(file);
      } else {
        kernelOrMap.delete(grammar);
      }
    });
    this.runningKernels = this.runningKernels.filter((k) => k !== kernel);
  }
  getFilesForKernel(kernel) {
    const grammar = kernel.grammar.name;
    return this.filePaths.filter((file) => {
      const kernelOrMap = this.kernelMapping.get(file);
      if (!kernelOrMap) {
        return false;
      }
      return kernelOrMap instanceof Kernel
        ? kernelOrMap === kernel
        : kernelOrMap.get(grammar) === kernel;
    });
  }
  dispose() {
    this.subscriptions.dispose();
    this.markersMapping.forEach((markerStore) => markerStore.clear());
    this.markersMapping.clear();
    this.runningKernels.forEach((kernel) => kernel.destroy());
    this.runningKernels = [];
    this.kernelMapping.clear();
  }
  updateEditor(editor) {
    this.editor = editor;
    this.setGrammar(editor);
    if (this.globalMode && this.kernel && editor) {
      const fileName = editor.getPath();
      if (!fileName) {
        return;
      }
      this.kernelMapping.set(fileName, this.kernel);
    }
  }
  // Returns the embedded grammar for multilanguage, normal grammar otherwise
  getEmbeddedGrammar(editor) {
    const grammar = editor.getGrammar();
    if (!isMultilanguageGrammar(grammar)) {
      return grammar;
    }
    const embeddedScope = getEmbeddedScope(
      editor,
      editor.getCursorBufferPosition()
    );
    if (!embeddedScope) {
      return grammar;
    }
    const scope = embeddedScope.replace(".embedded", "");
    return atom.grammars.grammarForScopeName(scope);
  }
  setGrammar(editor) {
    if (!editor) {
      this.grammar = null;
      return;
    }
    this.grammar = this.getEmbeddedGrammar(editor);
  }
  setConfigValue(keyPath, newValue) {
    if (!newValue) {
      newValue = atom.config.get(keyPath);
    }
    this.configMapping.set(keyPath, newValue);
  }
  /** Force mobx to recalculate filePath (which depends on editor observable) */
  forceEditorUpdate() {
    const currentEditor = this.editor;
    if (!currentEditor) {
      return;
    }
    const oldKey = this.filePath;
    // Return back if the kernel for this editor is already disposed.
    if (!oldKey || !this.kernelMapping.has(oldKey)) {
      return;
    }
    this.updateEditor(null);
    this.updateEditor(currentEditor);
    const newKey = this.filePath;
    if (!newKey) {
      return;
    }
    // Change key of kernelMapping from editor ID to file path
    this.kernelMapping.set(newKey, this.kernelMapping.get(oldKey));
    this.kernelMapping.delete(oldKey);
  }
}

const store = new Store();

window.hydrogen_store = store;
module.exports = {
  Store, // For debugging
  default: store
};
