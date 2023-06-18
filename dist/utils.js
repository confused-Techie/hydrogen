var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPreviouslyFocusedElement =
  exports.char_idx_to_js_idx =
  exports.js_idx_to_char_idx =
  exports.executionTime =
  exports.EmptyMessage =
  exports.rowRangeForCodeFoldAtBufferRow =
  exports.hotReloadPackage =
  exports.log =
  exports.getEditorDirectory =
  exports.getEmbeddedScope =
  exports.kernelSpecProvidesGrammar =
  exports.isUnsavedFilePath =
  exports.isMultilanguageGrammar =
  exports.msgSpecV4toV5 =
  exports.msgSpecToNotebookFormat =
  exports.grammarToLanguage =
  exports.openOrShowDock =
  exports.focus =
  exports.reactFactory =
  exports.NO_EXECTIME_STRING =
  exports.KERNEL_MONITOR_URI =
  exports.OUTPUT_AREA_URI =
  exports.WATCHES_URI =
  exports.INSPECTOR_URI =
    void 0;
const atom_1 = require("atom");
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const findKey_1 = __importDefault(require("lodash/findKey"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("./config"));
const store_1 = __importDefault(require("./store"));
exports.INSPECTOR_URI = "atom://hydrogen/inspector";
exports.WATCHES_URI = "atom://hydrogen/watch-sidebar";
exports.OUTPUT_AREA_URI = "atom://hydrogen/output-area";
exports.KERNEL_MONITOR_URI = "atom://hydrogen/kernel-monitor";
exports.NO_EXECTIME_STRING = "Not available";
function reactFactory(
  reactElement,
  domElement,
  additionalTeardown,
  disposer = store_1.default.subscriptions
) {
  react_dom_1.default.render(reactElement, domElement);
  const disposable = new atom_1.Disposable(() => {
    react_dom_1.default.unmountComponentAtNode(domElement);
    if (typeof additionalTeardown === "function") {
      additionalTeardown();
    }
  });
  disposer.add(disposable);
}
exports.reactFactory = reactFactory;
function focus(item) {
  if (item && typeof item === "object") {
    const editorPane = atom.workspace.paneForItem(item);
    if (editorPane) {
      editorPane.activate();
    }
  }
}
exports.focus = focus;
async function openOrShowDock(URI) {
  // atom.workspace.open(URI) will activate/focus the dock by default
  // dock.toggle() or dock.show() will leave focus wherever it was
  // this function is basically workspace.open, except it
  // will not focus the newly opened pane
  let dock = atom.workspace.paneContainerForURI(URI);
  if (dock && typeof dock.show === "function") {
    // If the target item already exist, activate it and show dock
    const pane = atom.workspace.paneForURI(URI);
    if (pane) {
      pane.activateItemForURI(URI);
    }
    return dock.show();
  }
  await atom.workspace.open(URI, {
    searchAllPanes: true,
    activatePane: false,
  });
  dock = atom.workspace.paneContainerForURI(URI);
  return dock && typeof dock.show === "function" ? dock.show() : null;
}
exports.openOrShowDock = openOrShowDock;
function grammarToLanguage(grammar) {
  if (!grammar) {
    return null;
  }
  const grammarLanguage = grammar.name.toLowerCase();
  const mappings = config_1.default.getJson("languageMappings");
  const kernelLanguage = (0, findKey_1.default)(
    mappings,
    (l) => l.toLowerCase() === grammarLanguage
  );
  return kernelLanguage ? kernelLanguage.toLowerCase() : grammarLanguage;
}
exports.grammarToLanguage = grammarToLanguage;
/**
 * Copied from
 * https://github.com/nteract/nteract/blob/master/src/notebook/epics/execute.js#L37
 * Create an object that adheres to the jupyter notebook specification.
 * http://jupyter-client.readthedocs.io/en/latest/messaging.html
 *
 * @param {Object} msg - Message that has content which can be converted to nbformat
 * @returns {Object} FormattedMsg - Message with the associated output type
 */
function msgSpecToNotebookFormat(message) {
  return Object.assign({}, message.content, {
    output_type: message.header.msg_type,
  });
}
exports.msgSpecToNotebookFormat = msgSpecToNotebookFormat;
/** A very basic converter for supporting jupyter messaging protocol v4 replies */
function msgSpecV4toV5(message) {
  switch (message.header.msg_type) {
    case "pyout":
      message.header.msg_type = "execute_result";
      break;
    case "pyerr":
      message.header.msg_type = "error";
      break;
    case "stream":
      if (!message.content.text) {
        message.content.text = message.content.data;
      }
      break;
    default: {
      // no conversion needed
    }
  }
  return message;
}
exports.msgSpecV4toV5 = msgSpecV4toV5;
const markupGrammars = new Set([
  "source.gfm",
  "source.asciidoc",
  "text.restructuredtext",
  "text.tex.latex.knitr",
  "text.md",
  "source.weave.noweb",
  "source.weave.md",
  "source.weave.latex",
  "source.weave.restructuredtext",
  "source.pweave.noweb",
  "source.pweave.md",
  "source.pweave.latex",
  "source.pweave.restructuredtext",
  "source.dyndoc.md.stata",
  "source.dyndoc.latex.stata",
]);
function isMultilanguageGrammar(grammar) {
  return markupGrammars.has(grammar.scopeName);
}
exports.isMultilanguageGrammar = isMultilanguageGrammar;
const isUnsavedFilePath = (filePath) => {
  return filePath.match(/Unsaved\sEditor\s\d+/) ? true : false;
};
exports.isUnsavedFilePath = isUnsavedFilePath;
function kernelSpecProvidesGrammar(kernelSpec, grammar) {
  if (!grammar || !grammar.name || !kernelSpec || !kernelSpec.language) {
    return false;
  }
  const grammarLanguage = grammar.name.toLowerCase();
  const kernelLanguage = kernelSpec.language.toLowerCase();
  if (kernelLanguage === grammarLanguage) {
    return true;
  }
  const mappedLanguage =
    config_1.default.getJson("languageMappings")[kernelLanguage];
  if (!mappedLanguage) {
    return false;
  }
  return mappedLanguage.toLowerCase() === grammarLanguage;
}
exports.kernelSpecProvidesGrammar = kernelSpecProvidesGrammar;
function getEmbeddedScope(editor, position) {
  const scopes = editor
    .scopeDescriptorForBufferPosition(position)
    .getScopesArray();
  return scopes.find((s) => s.indexOf("source.embedded.") === 0);
}
exports.getEmbeddedScope = getEmbeddedScope;
function getEditorDirectory(editor) {
  if (!editor) {
    return os_1.default.homedir();
  }
  const editorPath = editor.getPath();
  return editorPath
    ? path_1.default.dirname(editorPath)
    : os_1.default.homedir();
}
exports.getEditorDirectory = getEditorDirectory;
function log(...message) {
  if (atom.config.get("Hydrogen.debug")) {
    console.log("Hydrogen:", ...message);
  }
}
exports.log = log;
function hotReloadPackage() {
  const packName = "Hydrogen";
  const packPath = atom.packages.resolvePackagePath(packName);
  if (!packPath) {
    return;
  }
  const packPathPrefix = packPath + path_1.default.sep;
  const zeromqPathPrefix =
    path_1.default.join(packPath, "node_modules", "zeromq") +
    path_1.default.sep;
  log(`deactivating ${packName}`);
  atom.packages.deactivatePackage(packName);
  atom.packages.unloadPackage(packName);
  // Delete require cache to re-require on activation.
  // But except zeromq native module which is not re-requireable.
  const packageLibsExceptZeromq = (filePath) =>
    filePath.startsWith(packPathPrefix) &&
    !filePath.startsWith(zeromqPathPrefix);
  Object.keys(require.cache)
    .filter(packageLibsExceptZeromq)
    .forEach((filePath) => delete require.cache[filePath]);
  atom.packages.loadPackage(packName);
  atom.packages.activatePackage(packName);
  log(`activated ${packName}`);
}
exports.hotReloadPackage = hotReloadPackage;
function rowRangeForCodeFoldAtBufferRow(editor, row) {
  const range = editor.tokenizedBuffer.getFoldableRangeContainingPoint(
    new atom_1.Point(row, Infinity),
    editor.getTabLength()
  );
  return range ? [range.start.row, range.end.row] : null;
}
exports.rowRangeForCodeFoldAtBufferRow = rowRangeForCodeFoldAtBufferRow;
const EmptyMessage = () => {
  return react_1.default.createElement(
    "ul",
    { className: "background-message centered" },
    react_1.default.createElement("li", null, "No output to display")
  );
};
exports.EmptyMessage = EmptyMessage;
// TODO: use npm package -- maybe it offers more robust implementation

/**
 * Given a message whose type if `execute_reply`, calculates exection time and
 * returns its string representation.
 *
 * @param {Message} message - A Message object whose type is `execute_reply`
 * @returns {String} - A string representation of the execution time. Returns
 *   `NO_EXECTIME_STRING` if execution time is unavailable.
 */
function executionTime(message) {
  if (!message.parent_header.date || !message.header.date) {
    return exports.NO_EXECTIME_STRING;
  }
  const start = Date.parse(message.parent_header.date);
  const end = Date.parse(message.header.date);
  const time = end - start; // milliseconds
  let sec = time / 1000; // seconds
  if (sec < 60) {
    return `${sec.toFixed(3)} sec`;
  }
  let min = (sec - (sec % 60)) / 60;
  sec = Math.round(sec % 60);
  if (min < 60) {
    return `${min} min ${sec} sec`;
  }
  const hour = (min - (min % 60)) / 60;
  min %= 60;
  return `${hour} h ${min} m ${sec} s`;
}
exports.executionTime = executionTime;
function js_idx_to_char_idx(js_idx, text) {
  if (text === null) {
    return -1;
  }
  let char_idx = js_idx;
  for (let i = 0; i < text.length && i < js_idx; i++) {
    const char_code = text.charCodeAt(i);

    // check for the first half of a surrogate pair
    if (char_code >= 0xd800 && char_code < 0xdc00) {
      char_idx -= 1;
    }
  }
  return char_idx;
}
exports.js_idx_to_char_idx = js_idx_to_char_idx;
function char_idx_to_js_idx(char_idx, text) {
  if (text === null) {
    return -1;
  }
  let js_idx = char_idx;
  for (let i = 0; i < text.length && i < js_idx; i++) {
    const char_code = text.charCodeAt(i);
    // check for the first half of a surrogate pair
    if (char_code >= 0xd800 && char_code < 0xdc00) {
      js_idx += 1;
    }
  }
  return js_idx;
}
exports.char_idx_to_js_idx = char_idx_to_js_idx;

/**
 * Sets the `previouslyFocusedElement` property of the given object to
 * activeElement if it is an HTMLElement
 */
function setPreviouslyFocusedElement(obj) {
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement) {
    obj.previouslyFocusedElement = activeElement;
  }
}
exports.setPreviouslyFocusedElement = setPreviouslyFocusedElement;
