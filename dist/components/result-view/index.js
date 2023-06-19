const { CompositeDisposable, TextEditor, DisplayMarker } = require("atom");
const React = require("react");
const { Provider } = require("@nteract/mathjax");
const { mathJaxPath } = require("mathjax-electron");
const { reactFactory } = require("../../utils.js");
const OutputStore = require("../../store/output.js");
const ResultViewComponent = require("./result-view.js");

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
    this.disposer = new CompositeDisposable();
    markerStore.clearOnRow(row);
    this.marker = editor.markBufferPosition([row, Infinity], {
      invalidate: "touch",
    });
    this.outputStore = new OutputStore();
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
    reactFactory(
      React.createElement(
        Provider,
        { src: mathJaxPath },
        React.createElement(ResultViewComponent, {
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

module.exports = ResultView;
