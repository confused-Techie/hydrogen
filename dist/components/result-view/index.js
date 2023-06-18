var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const react_1 = __importDefault(require("react"));
const mathjax_1 = require("@nteract/mathjax");
const mathjax_electron_1 = require("mathjax-electron");
const utils_1 = require("../../utils");
const output_1 = __importDefault(require("../../store/output"));
const result_view_1 = __importDefault(require("./result-view"));
class ResultView {
  constructor(markerStore, kernel, editor, row, showResult = true) {
    this.destroy = () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        editor.element.focus();
      }
      this.disposer.dispose();
      this.marker.destroy();
    };
    const element = document.createElement("div");
    element.classList.add("hydrogen", "marker");
    this.disposer = new atom_1.CompositeDisposable();
    markerStore.clearOnRow(row);
    this.marker = editor.markBufferPosition([row, Infinity], {
      invalidate: "touch",
    });
    this.outputStore = new output_1.default();
    this.outputStore.updatePosition({
      lineLength: editor.element.pixelPositionForBufferPosition([row, Infinity])
        .left,
      lineHeight: editor.getLineHeightInPixels(),
      editorWidth: editor.element.getWidth(),
      charWidth: editor.getDefaultCharWidth(),
    });
    editor.decorateMarker(this.marker, {
      type: "block",
      item: element,
      position: "after",
    });
    this.marker.onDidChange((event) => {
      if (!event.isValid) {
        markerStore.delete(this.marker.id);
      } else {
        this.outputStore.updatePosition({
          lineLength: editor.element.pixelPositionForBufferPosition(
            this.marker.getStartBufferPosition()
          ).left,
          lineHeight: editor.getLineHeightInPixels(),
          editorWidth: editor.element.getWidth(),
          charWidth: editor.getDefaultCharWidth(),
        });
      }
    });
    markerStore.new(this);
    (0, utils_1.reactFactory)(
      react_1.default.createElement(
        mathjax_1.Provider,
        { src: mathjax_electron_1.mathJaxPath },
        react_1.default.createElement(result_view_1.default, {
          store: this.outputStore,
          kernel: kernel,
          destroy: this.destroy,
          showResult: showResult,
        })
      ),
      element,
      null,
      this.disposer
    );
  }
}
exports.default = ResultView;
