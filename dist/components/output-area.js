const React = require("react");
const { Provider } = require("@nteract/mathjax");
const { mathJaxPath } = require("mathjax-electron");
const { action, observable } = require("mobx");
const { observer } = require("mobx-react");
const Anser = require("anser");
const History = require("./result-view/history.js");
const ScrollList = require("./result-view/list.js");
const { OUTPUT_AREA_URI, EmptyMessage } = require("../utils");

let OutputArea = class OutputArea extends React.Component {
  constructor() {
    super(...arguments);
    this.showHistory = true;
    this.setHistory = () => {
      this.showHistory = true;
    };
    this.setScrollList = () => {
      this.showHistory = false;
    };
    this.handleClick = () => {
      const kernel = this.props.store.kernel;
      if (!kernel || !kernel.outputStore) {
        return;
      }
      const output = kernel.outputStore.outputs[kernel.outputStore.index];
      const copyOutput = this.getOutputText(output);
      if (copyOutput) {
        atom.clipboard.write(Anser.ansiToText(copyOutput));
        atom.notifications.addSuccess("Copied to clipboard");
      } else {
        atom.notifications.addWarning("Nothing to copy");
      }
    };
  }
  getOutputText(output) {
    switch (output.output_type) {
      case "stream":
        return output.text;
      case "execute_result":
        return output.data["text/plain"];
      case "error":
        return output.traceback.toJS().join("\n");
    }
  }
  render() {
    const kernel = this.props.store.kernel;
    if (!kernel) {
      if (atom.config.get("Hydrogen.outputAreaDock")) {
        return React.createElement(EmptyMessage, null);
      }
      atom.workspace.hide(OUTPUT_AREA_URI);
      return null;
    }
    return React.createElement(
      Provider,
      { src: mathJaxPath },
      React.createElement(
        "div",
        { className: "sidebar output-area" },
        kernel.outputStore.outputs.length > 0
          ? React.createElement(
              "div",
              { className: "block" },
              React.createElement(
                "div",
                { className: "btn-group" },
                React.createElement("button", {
                  className: `btn icon icon-clock${
                    this.showHistory ? " selected" : ""
                  }`,
                  onClick: this.setHistory,
                }),
                React.createElement("button", {
                  className: `btn icon icon-three-bars${
                    !this.showHistory ? " selected" : ""
                  }`,
                  onClick: this.setScrollList,
                })
              ),
              React.createElement(
                "div",
                {
                  style: {
                    float: "right",
                  },
                },
                this.showHistory
                  ? React.createElement(
                      "button",
                      {
                        className: "btn icon icon-clippy",
                        onClick: this.handleClick,
                      },
                      "Copy"
                    )
                  : null,
                React.createElement(
                  "button",
                  {
                    className: "btn icon icon-trashcan",
                    onClick: kernel.outputStore.clear,
                  },
                  "Clear"
                )
              )
            )
          : React.createElement(EmptyMessage, null),
        this.showHistory
          ? React.createElement(History, {
              store: kernel.outputStore,
            })
          : React.createElement(ScrollList, {
              outputs: kernel.outputStore.outputs,
            })
      )
    );
  }
};

module.exports = OutputArea;
