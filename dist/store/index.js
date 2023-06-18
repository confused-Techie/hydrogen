var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const atom_1 = require("atom");
const mobx_1 = require("mobx");
const utils_1 = require("../utils");
const codeManager = __importStar(require("../code-manager"));
const markers_1 = __importDefault(require("./markers"));
const kernel_1 = __importDefault(require("../kernel"));
const commutable = __importStar(require("@nteract/commutable"));
class Store {
  constructor() {
    this.subscriptions = new atom_1.CompositeDisposable();
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
    if (kernelOrMap instanceof kernel_1.default) {
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
    return (0, mobx_1.keys)(this.kernelMapping);
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
    const markerStore = new markers_1.default();
    this.markersMapping.set(editorId, markerStore);
    return markerStore;
  }
  startKernel(kernelDisplayName) {
    this.startingKernels.set(kernelDisplayName, true);
  }
  addFileDisposer(editor, filePath) {
    const fileDisposer = new atom_1.CompositeDisposable();
    if ((0, utils_1.isUnsavedFilePath)(filePath)) {
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
      const file = new atom_1.File(filePath);
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
    if ((0, utils_1.isMultilanguageGrammar)(editor.getGrammar())) {
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
      if (kernelOrMap instanceof kernel_1.default) {
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
      return kernelOrMap instanceof kernel_1.default
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
    if (!(0, utils_1.isMultilanguageGrammar)(grammar)) {
      return grammar;
    }
    const embeddedScope = (0, utils_1.getEmbeddedScope)(
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
__decorate(
  [mobx_1.observable, __metadata("design:type", Map)],
  Store.prototype,
  "markersMapping",
  void 0
);
__decorate(
  [mobx_1.observable, __metadata("design:type", Array)],
  Store.prototype,
  "runningKernels",
  void 0
);
__decorate(
  [mobx_1.observable, __metadata("design:type", Object)],
  Store.prototype,
  "kernelMapping",
  void 0
);
__decorate(
  [mobx_1.observable, __metadata("design:type", Map)],
  Store.prototype,
  "startingKernels",
  void 0
);
__decorate(
  [mobx_1.observable, __metadata("design:type", Object)],
  Store.prototype,
  "editor",
  void 0
);
__decorate(
  [mobx_1.observable, __metadata("design:type", Object)],
  Store.prototype,
  "grammar",
  void 0
);
__decorate(
  [mobx_1.observable, __metadata("design:type", Map)],
  Store.prototype,
  "configMapping",
  void 0
);
__decorate(
  [
    mobx_1.computed,
    __metadata("design:type", kernel_1.default),
    __metadata("design:paramtypes", []),
  ],
  Store.prototype,
  "kernel",
  null
);
__decorate(
  [
    mobx_1.computed,
    __metadata("design:type", String),
    __metadata("design:paramtypes", []),
  ],
  Store.prototype,
  "filePath",
  null
);
__decorate(
  [
    mobx_1.computed,
    __metadata("design:type", Array),
    __metadata("design:paramtypes", []),
  ],
  Store.prototype,
  "filePaths",
  null
);
__decorate(
  [
    mobx_1.computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", []),
  ],
  Store.prototype,
  "notebook",
  null
);
__decorate(
  [
    mobx_1.computed,
    __metadata("design:type", markers_1.default),
    __metadata("design:paramtypes", []),
  ],
  Store.prototype,
  "markers",
  null
);
__decorate(
  [
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0),
  ],
  Store.prototype,
  "newMarkerStore",
  null
);
__decorate(
  [
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0),
  ],
  Store.prototype,
  "startKernel",
  null
);
__decorate(
  [
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [
      kernel_1.default,
      String,
      atom_1.TextEditor,
      Object,
    ]),
    __metadata("design:returntype", void 0),
  ],
  Store.prototype,
  "newKernel",
  null
);
__decorate(
  [
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kernel_1.default]),
    __metadata("design:returntype", void 0),
  ],
  Store.prototype,
  "deleteKernel",
  null
);
__decorate(
  [
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0),
  ],
  Store.prototype,
  "dispose",
  null
);
__decorate(
  [
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [atom_1.TextEditor]),
    __metadata("design:returntype", void 0),
  ],
  Store.prototype,
  "updateEditor",
  null
);
__decorate(
  [
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [atom_1.TextEditor]),
    __metadata("design:returntype", void 0),
  ],
  Store.prototype,
  "setGrammar",
  null
);
__decorate(
  [
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0),
  ],
  Store.prototype,
  "setConfigValue",
  null
);
exports.Store = Store; // For debugging
const store = new Store();
exports.default = store;
window.hydrogen_store = store;
