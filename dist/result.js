var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMarkdownToOutput =
  exports.clearResults =
  exports.clearResult =
  exports.importResult =
  exports.createResult =
    void 0;
const result_view_1 = __importDefault(require("./components/result-view"));
const output_area_1 = __importDefault(require("./panes/output-area"));
const watches_1 = __importDefault(require("./panes/watches"));
const utils_1 = require("./utils");

/**
 * Creates and renders a ResultView.
 *
 * @param {Object} store - Global Hydrogen Store
 * @param {TextEditor} store.editor - TextEditor associated with the result.
 * @param {Kernel} store.kernel - Kernel to run code and associate with the result.
 * @param {MarkerStore} store.markers - MarkerStore that belongs to `store.editor`.
 * @param {Object} codeBlock - A Hydrogen Cell.
 * @param {String} codeBlock.code - Source string of the cell.
 * @param {Number} codeBlock.row - Row to display the result on.
 * @param {HydrogenCellType} codeBlock.cellType - Cell type of the cell.
 */
function createResult({ editor, kernel, markers }, { code, row, cellType }) {
  if (!editor || !kernel || !markers) {
    return;
  }
  if (atom.workspace.getActivePaneItem() instanceof watches_1.default) {
    kernel.watchesStore.run();
    return;
  }
  const globalOutputStore =
    atom.config.get("Hydrogen.outputAreaDefault") ||
    atom.workspace
      .getPaneItems()
      .find((item) => item instanceof output_area_1.default)
      ? kernel.outputStore
      : null;
  if (globalOutputStore) {
    (0, utils_1.openOrShowDock)(utils_1.OUTPUT_AREA_URI);
  }
  const { outputStore } = new result_view_1.default(
    markers,
    kernel,
    editor,
    row,
    !globalOutputStore || cellType == "markdown"
  );
  if (code.search(/\S/) != -1) {
    switch (cellType) {
      case "markdown":
        if (globalOutputStore) {
          globalOutputStore.appendOutput(convertMarkdownToOutput(code));
        } else {
          outputStore.appendOutput(convertMarkdownToOutput(code));
        }
        outputStore.appendOutput({
          data: "ok",
          stream: "status",
        });
        break;
      case "codecell":
        kernel.execute(code, (result) => {
          outputStore.appendOutput(result);
          if (globalOutputStore) {
            globalOutputStore.appendOutput(result);
          }
        });
        break;
    }
  } else {
    outputStore.appendOutput({
      data: "ok",
      stream: "status",
    });
  }
}
exports.createResult = createResult;

/**
 * Creates inline results from Kernel Responses without a tie to a kernel.
 *
 * @param {Store} store - Hydrogen store
 * @param {TextEditor} store.editor - The editor to display the results in.
 * @param {MarkerStore} store.markers - Should almost always be the editor's `MarkerStore`
 * @param {Object} bundle - The bundle to display.
 * @param {Object[]} bundle.outputs - The Kernel Responses to display.
 * @param {Number} bundle.row - The editor row to display the results on.
 */
function importResult({ editor, markers }, { outputs, row }) {
  if (!editor || !markers) {
    return;
  }
  const { outputStore } = new result_view_1.default(
    markers,
    null,
    editor,
    row,
    true
  ); // Always show inline
  for (const output of outputs) {
    outputStore.appendOutput(output);
  }
}
exports.importResult = importResult;

/**
 * Clears a ResultView or selection of ResultViews. To select a result to clear,
 * put your cursor on the row on the ResultView. To select multiple ResultViews,
 * select text starting on the row of the first ResultView to remove all the way
 * to text on the row of the last ResultView to remove. _This must be one
 * selection and the last selection made_
 *
 * @param {Object} store - Global Hydrogen Store
 * @param {TextEditor} store.editor - TextEditor associated with the ResultView.
 * @param {MarkerStore} store.markers - MarkerStore that belongs to
 *   `store.editor` and the ResultView.
 */
function clearResult({ editor, markers }) {
  if (!editor || !markers) {
    return;
  }
  const [startRow, endRow] = editor.getLastSelection().getBufferRowRange();
  for (let row = startRow; row <= endRow; row++) {
    markers.clearOnRow(row);
  }
}
exports.clearResult = clearResult;

/**
 * Clears all ResultViews of a MarkerStore. It also clears the currect kernel results.
 *
 * @param {Object} store - Global Hydrogen Store
 * @param {Kernel} store.kernel - Kernel to clear outputs.
 * @param {MarkerStore} store.markers - MarkerStore to clear.
 */
function clearResults({ kernel, markers }) {
  if (markers) {
    markers.clear();
  }
  if (!kernel) {
    return;
  }
  kernel.outputStore.clear();
}
exports.clearResults = clearResults;

/**
 * Converts a string of raw markdown to a display_data Kernel Response. This
 * allows for hydrogen to display markdown text as if is was any normal result
 * that came back from the kernel.
 *
 * @param {String} markdownString - A string of raw markdown code.
 * @returns {Object} A fake display_data Kernel Response.
 */
function convertMarkdownToOutput(markdownString) {
  return {
    output_type: "display_data",
    data: {
      "text/markdown": markdownString,
    },
    metadata: {},
  };
}
exports.convertMarkdownToOutput = convertMarkdownToOutput;
