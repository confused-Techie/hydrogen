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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeStatusBar =
  exports.consumeAutocompleteWatchEditor =
  exports.provideAutocompleteResults =
  exports.provideHydrogen =
  exports.deactivate =
  exports.activate =
  exports.config =
    void 0;
const atom_1 = require("atom");
const debounce_1 = __importDefault(require("lodash/debounce"));
const mobx_1 = require("mobx");
const inspector_1 = __importDefault(require("./panes/inspector"));
const watches_1 = __importDefault(require("./panes/watches"));
const output_area_1 = __importDefault(require("./panes/output-area"));
const kernel_monitor_1 = __importDefault(require("./panes/kernel-monitor"));
const config_1 = __importDefault(require("./config"));
const zmq_kernel_1 = __importDefault(require("./zmq-kernel"));
const ws_kernel_1 = __importDefault(require("./ws-kernel"));
const kernel_1 = __importDefault(require("./kernel"));
const kernel_picker_1 = __importDefault(require("./kernel-picker"));
const ws_kernel_picker_1 = __importDefault(require("./ws-kernel-picker"));
const existing_kernel_picker_1 = __importDefault(
  require("./existing-kernel-picker")
);
const hydrogen_provider_1 = __importDefault(
  require("./plugin-api/hydrogen-provider")
);
const store_1 = __importDefault(require("./store"));
const kernel_manager_1 = require("./kernel-manager");
const services_1 = __importDefault(require("./services"));
const commands = __importStar(require("./commands"));
const codeManager = __importStar(require("./code-manager"));
const result = __importStar(require("./result"));
const utils_1 = require("./utils");
const export_notebook_1 = require("./export-notebook");
const import_notebook_1 = require("./import-notebook");
exports.config = config_1.default.schema;
let emitter;
let kernelPicker;
let existingKernelPicker;
let wsKernelPicker;
let hydrogenProvider;
const kernelManager = new kernel_manager_1.KernelManager();
function activate() {
  emitter = new atom_1.Emitter();
  let skipLanguageMappingsChange = false;
  store_1.default.subscriptions.add(
    atom.config.onDidChange(
      "Hydrogen.languageMappings",
      ({ newValue, oldValue }) => {
        if (skipLanguageMappingsChange) {
          skipLanguageMappingsChange = false;
          return;
        }
        if (store_1.default.runningKernels.length != 0) {
          skipLanguageMappingsChange = true;
          atom.config.set("Hydrogen.languageMappings", oldValue);
          atom.notifications.addError("Hydrogen", {
            description:
              "`languageMappings` cannot be updated while kernels are running",
            dismissable: false,
          });
        }
      }
    )
  );
  store_1.default.subscriptions.add(
    atom.config.observe("Hydrogen.statusBarDisable", (newValue) => {
      store_1.default.setConfigValue(
        "Hydrogen.statusBarDisable",
        Boolean(newValue)
      );
    }),
    atom.config.observe("Hydrogen.statusBarKernelInfo", (newValue) => {
      store_1.default.setConfigValue(
        "Hydrogen.statusBarKernelInfo",
        Boolean(newValue)
      );
    })
  );
  store_1.default.subscriptions.add(
    atom.commands.add("atom-text-editor:not([mini])", {
      "hydrogen:run": () => run(),
      "hydrogen:run-all": () => runAll(),
      "hydrogen:run-all-above": () => runAllAbove(),
      "hydrogen:run-and-move-down": () => run(true),
      "hydrogen:run-cell": () => runCell(),
      "hydrogen:run-cell-and-move-down": () => runCell(true),
      "hydrogen:toggle-watches": () =>
        atom.workspace.toggle(utils_1.WATCHES_URI),
      "hydrogen:toggle-output-area": () => commands.toggleOutputMode(),
      "hydrogen:toggle-kernel-monitor": async () => {
        const lastItem = atom.workspace.getActivePaneItem();
        const lastPane = atom.workspace.paneForItem(lastItem);
        await atom.workspace.toggle(utils_1.KERNEL_MONITOR_URI);
        if (lastPane) {
          lastPane.activate();
        }
      },
      "hydrogen:start-local-kernel": () => startZMQKernel(),
      "hydrogen:connect-to-remote-kernel": () => connectToWSKernel(),
      "hydrogen:connect-to-existing-kernel": () => connectToExistingKernel(),
      "hydrogen:add-watch": () => {
        if (store_1.default.kernel) {
          store_1.default.kernel.watchesStore.addWatchFromEditor(
            store_1.default.editor
          );
          (0, utils_1.openOrShowDock)(utils_1.WATCHES_URI);
        }
      },
      "hydrogen:remove-watch": () => {
        if (store_1.default.kernel) {
          store_1.default.kernel.watchesStore.removeWatch();
          (0, utils_1.openOrShowDock)(utils_1.WATCHES_URI);
        }
      },
      "hydrogen:update-kernels": async () => {
        await kernelManager.updateKernelSpecs();
      },
      "hydrogen:toggle-inspector": () =>
        commands.toggleInspector(store_1.default),
      "hydrogen:interrupt-kernel": () =>
        handleKernelCommand(
          {
            command: "interrupt-kernel",
          },
          store_1.default
        ),
      "hydrogen:restart-kernel": () =>
        handleKernelCommand(
          {
            command: "restart-kernel",
          },
          store_1.default
        ),
      "hydrogen:shutdown-kernel": () =>
        handleKernelCommand(
          {
            command: "shutdown-kernel",
          },
          store_1.default
        ),
      "hydrogen:clear-result": () => result.clearResult(store_1.default),
      "hydrogen:export-notebook": () => (0, export_notebook_1.exportNotebook)(),
      "hydrogen:fold-current-cell": () => foldCurrentCell(),
      "hydrogen:fold-all-but-current-cell": () => foldAllButCurrentCell(),
      "hydrogen:clear-results": () => result.clearResults(store_1.default),
    })
  );
  store_1.default.subscriptions.add(
    atom.commands.add("atom-workspace", {
      "hydrogen:import-notebook": import_notebook_1.importNotebook,
    })
  );
  if (atom.inDevMode()) {
    store_1.default.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "hydrogen:hot-reload-package": () => (0, utils_1.hotReloadPackage)(),
      })
    );
  }
  store_1.default.subscriptions.add(
    atom.workspace.observeActiveTextEditor((editor) => {
      store_1.default.updateEditor(editor);
    })
  );
  store_1.default.subscriptions.add(
    atom.workspace.observeTextEditors((editor) => {
      const editorSubscriptions = new atom_1.CompositeDisposable();
      editorSubscriptions.add(
        editor.onDidChangeGrammar(() => {
          store_1.default.setGrammar(editor);
        })
      );
      if ((0, utils_1.isMultilanguageGrammar)(editor.getGrammar())) {
        editorSubscriptions.add(
          editor.onDidChangeCursorPosition(
            (0, debounce_1.default)(() => {
              store_1.default.setGrammar(editor);
            }, 75)
          )
        );
      }
      editorSubscriptions.add(
        editor.onDidDestroy(() => {
          editorSubscriptions.dispose();
        })
      );
      editorSubscriptions.add(
        editor.onDidChangeTitle((newTitle) =>
          store_1.default.forceEditorUpdate()
        )
      );
      store_1.default.subscriptions.add(editorSubscriptions);
    })
  );
  hydrogenProvider = null;
  store_1.default.subscriptions.add(
    atom.workspace.addOpener((uri) => {
      switch (uri) {
        case utils_1.INSPECTOR_URI:
          return new inspector_1.default(store_1.default);
        case utils_1.WATCHES_URI:
          return new watches_1.default(store_1.default);
        case utils_1.OUTPUT_AREA_URI:
          return new output_area_1.default(store_1.default);
        case utils_1.KERNEL_MONITOR_URI:
          return new kernel_monitor_1.default(store_1.default);
        default: {
          return;
        }
      }
    })
  );
  store_1.default.subscriptions.add(
    atom.workspace.addOpener(import_notebook_1.ipynbOpener)
  );
  store_1.default.subscriptions.add(
    new atom_1.Disposable(() => {
      // Destroy any Panes when the package is deactivated.
      atom.workspace.getPaneItems().forEach((item) => {
        if (
          item instanceof inspector_1.default ||
          item instanceof watches_1.default ||
          item instanceof output_area_1.default ||
          item instanceof kernel_monitor_1.default
        ) {
          item.destroy();
        }
      });
    })
  );
  (0, mobx_1.autorun)(() => {
    emitter.emit("did-change-kernel", store_1.default.kernel);
  });
}
exports.activate = activate;
function deactivate() {
  store_1.default.dispose();
}
exports.deactivate = deactivate;
function provideHydrogen() {
  if (!hydrogenProvider) {
    hydrogenProvider = new hydrogen_provider_1.default(emitter);
  }
  return hydrogenProvider;
}

/*-------------- Service Providers --------------*/
exports.provideHydrogen = provideHydrogen;
function provideAutocompleteResults() {
  return services_1.default.provided.autocomplete.provideAutocompleteResults(
    store_1.default
  );
}
exports.provideAutocompleteResults = provideAutocompleteResults;

/*-----------------------------------------------*/

/*-------------- Service Consumers --------------*/
function consumeAutocompleteWatchEditor(watchEditor) {
  return services_1.default.consumed.autocomplete.consume(
    store_1.default,
    watchEditor
  );
}
exports.consumeAutocompleteWatchEditor = consumeAutocompleteWatchEditor;
function consumeStatusBar(statusBar) {
  return services_1.default.consumed.statusBar.addStatusBar(
    store_1.default,
    statusBar,
    handleKernelCommand
  );
}
exports.consumeStatusBar = consumeStatusBar;
function connectToExistingKernel() {
  if (!existingKernelPicker) {
    existingKernelPicker = new existing_kernel_picker_1.default();
  }
  existingKernelPicker.toggle();
}
function handleKernelCommand({ command, payload }, { kernel, markers }) {
  // TODO payload is not used!
  (0, utils_1.log)("handleKernelCommand:", [
    { command, payload },
    { kernel, markers },
  ]);
  if (!kernel) {
    const message = "No running kernel for grammar or editor found";
    atom.notifications.addError(message);
    return;
  }
  if (command === "interrupt-kernel") {
    kernel.interrupt();
  } else if (command === "restart-kernel") {
    kernel.restart();
  } else if (command === "shutdown-kernel") {
    if (markers) {
      markers.clear();
    }
    // Note that destroy alone does not shut down a WSKernel
    kernel.shutdown();
    kernel.destroy();
  } else if (
    command === "rename-kernel" &&
    kernel.transport instanceof ws_kernel_1.default
  ) {
    kernel.transport.promptRename();
  } else if (command === "disconnect-kernel") {
    if (markers) {
      markers.clear();
    }
    kernel.destroy();
  }
}
function run(moveDown = false) {
  const editor = store_1.default.editor;
  if (!editor) {
    return;
  }
  // https://github.com/nteract/hydrogen/issues/1452
  atom.commands.dispatch(editor.element, "autocomplete-plus:cancel");
  const codeBlock = codeManager.findCodeBlock(editor);
  if (!codeBlock) {
    return;
  }
  const codeNullable = codeBlock.code;
  if (codeNullable === null) {
    return;
  }
  const { row } = codeBlock;
  const cellType = codeManager.getMetadataForRow(
    editor,
    new atom_1.Point(row, 0)
  );
  const code =
    cellType === "markdown"
      ? codeManager.removeCommentsMarkdownCell(editor, codeNullable)
      : codeNullable;
  if (moveDown) {
    codeManager.moveDown(editor, row);
  }
  checkForKernel(store_1.default, (kernel) => {
    result.createResult(store_1.default, {
      code,
      row,
      cellType,
    });
  });
}
function runAll(breakpoints) {
  const { editor, kernel, grammar, filePath } = store_1.default;
  if (!editor || !grammar || !filePath) {
    return;
  }
  if ((0, utils_1.isMultilanguageGrammar)(editor.getGrammar())) {
    atom.notifications.addError(
      '"Run All" is not supported for this file type!'
    );
    return;
  }
  if (editor && kernel) {
    _runAll(editor, kernel, breakpoints);
    return;
  }
  kernelManager.startKernelFor(grammar, editor, filePath, (kernel) => {
    _runAll(editor, kernel, breakpoints);
  });
}
function _runAll(editor, kernel, breakpoints) {
  const cells = codeManager.getCells(editor, breakpoints);
  for (const cell of cells) {
    const { start, end } = cell;
    const codeNullable = codeManager.getTextInRange(editor, start, end);
    if (codeNullable === null) {
      continue;
    }
    const row = codeManager.escapeBlankRows(
      editor,
      start.row,
      codeManager.getEscapeBlankRowsEndRow(editor, end)
    );
    const cellType = codeManager.getMetadataForRow(editor, start);
    const code =
      cellType === "markdown"
        ? codeManager.removeCommentsMarkdownCell(editor, codeNullable)
        : codeNullable;
    checkForKernel(store_1.default, (kernel) => {
      result.createResult(store_1.default, {
        code,
        row,
        cellType,
      });
    });
  }
}
function runAllAbove() {
  const { editor, kernel, grammar, filePath } = store_1.default;
  if (!editor || !grammar || !filePath) {
    return;
  }
  if ((0, utils_1.isMultilanguageGrammar)(editor.getGrammar())) {
    atom.notifications.addError(
      '"Run All Above" is not supported for this file type!'
    );
    return;
  }
  if (editor && kernel) {
    _runAllAbove(editor, kernel);
    return;
  }
  kernelManager.startKernelFor(grammar, editor, filePath, (kernel) => {
    _runAllAbove(editor, kernel);
  });
}
function _runAllAbove(editor, kernel) {
  const cursor = editor.getCursorBufferPosition();
  cursor.column = editor.getBuffer().lineLengthForRow(cursor.row);
  const breakpoints = codeManager.getBreakpoints(editor);
  breakpoints.push(cursor);
  const cells = codeManager.getCells(editor, breakpoints);
  for (const cell of cells) {
    const { start, end } = cell;
    const codeNullable = codeManager.getTextInRange(editor, start, end);
    const row = codeManager.escapeBlankRows(
      editor,
      start.row,
      codeManager.getEscapeBlankRowsEndRow(editor, end)
    );
    const cellType = codeManager.getMetadataForRow(editor, start);
    if (codeNullable !== null) {
      const code =
        cellType === "markdown"
          ? codeManager.removeCommentsMarkdownCell(editor, codeNullable)
          : codeNullable;
      checkForKernel(store_1.default, (kernel) => {
        result.createResult(store_1.default, {
          code,
          row,
          cellType,
        });
      });
    }
    if (cell.containsPoint(cursor)) {
      break;
    }
  }
}
function runCell(moveDown = false) {
  const editor = store_1.default.editor;
  if (!editor) {
    return;
  }
  // https://github.com/nteract/hydrogen/issues/1452
  atom.commands.dispatch(editor.element, "autocomplete-plus:cancel");
  const { start, end } = codeManager.getCurrentCell(editor);
  const codeNullable = codeManager.getTextInRange(editor, start, end);
  if (codeNullable === null) {
    return;
  }
  const row = codeManager.escapeBlankRows(
    editor,
    start.row,
    codeManager.getEscapeBlankRowsEndRow(editor, end)
  );
  const cellType = codeManager.getMetadataForRow(editor, start);
  const code =
    cellType === "markdown"
      ? codeManager.removeCommentsMarkdownCell(editor, codeNullable)
      : codeNullable;
  if (moveDown) {
    codeManager.moveDown(editor, row);
  }
  checkForKernel(store_1.default, (kernel) => {
    result.createResult(store_1.default, {
      code,
      row,
      cellType,
    });
  });
}
function foldCurrentCell() {
  const editor = store_1.default.editor;
  if (!editor) {
    return;
  }
  codeManager.foldCurrentCell(editor);
}
function foldAllButCurrentCell() {
  const editor = store_1.default.editor;
  if (!editor) {
    return;
  }
  codeManager.foldAllButCurrentCell(editor);
}
function startZMQKernel() {
  kernelManager
    .getAllKernelSpecsForGrammar(store_1.default.grammar)
    .then((kernelSpecs) => {
      if (kernelPicker) {
        kernelPicker.kernelSpecs = kernelSpecs;
      } else {
        kernelPicker = new kernel_picker_1.default(kernelSpecs);
        kernelPicker.onConfirmed = (kernelSpec) => {
          const { editor, grammar, filePath, markers } = store_1.default;
          if (!editor || !grammar || !filePath || !markers) {
            return;
          }
          markers.clear();
          kernelManager.startKernel(kernelSpec, grammar, editor, filePath);
        };
      }
      kernelPicker.toggle();
    });
}
function connectToWSKernel() {
  if (!wsKernelPicker) {
    wsKernelPicker = new ws_kernel_picker_1.default((transport) => {
      const kernel = new kernel_1.default(transport);
      const { editor, grammar, filePath, markers } = store_1.default;
      if (!editor || !grammar || !filePath || !markers) {
        return;
      }
      markers.clear();
      if (kernel.transport instanceof zmq_kernel_1.default) {
        kernel.destroy();
      }
      store_1.default.newKernel(kernel, filePath, editor, grammar);
    });
  }
  wsKernelPicker.toggle((kernelSpec) =>
    (0, utils_1.kernelSpecProvidesGrammar)(kernelSpec, store_1.default.grammar)
  );
}
// Accepts store as an arg
function checkForKernel({ editor, grammar, filePath, kernel }, callback) {
  if (!filePath || !grammar) {
    return atom.notifications.addError(
      "The language grammar must be set in order to start a kernel. The easiest way to do this is to save the file."
    );
  }
  if (kernel) {
    callback(kernel);
    return;
  }
  kernelManager.startKernelFor(grammar, editor, filePath, (newKernel) =>
    callback(newKernel)
  );
}
