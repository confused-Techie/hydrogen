const React = require("react");
const { observer } = require("mobx-react");
const { NO_EXECTIME_STRING } = require("../../../utils.js");

class StatusBar extends React.Component {
  render() {
    const { kernel, markers, configMapping } = this.props.store;
    if (!kernel || configMapping.get("Hydrogen.statusBarDisable")) {
      return null;
    }
    // Hydrogen.statusBarKernelInfo branch on if exec time is not available or no execution has happened
    const view = configMapping.get("Hydrogen.statusBarKernelInfo")
      ? kernel.executionCount === 0 ||
        kernel.lastExecutionTime === NO_EXECTIME_STRING
        ? React.createElement(
            "a",
            {
              onClick: () =>
                this.props.onClick({
                  kernel,
                  markers,
                }),
            },
            kernel.displayName,
            " | ",
            kernel.executionState,
            " |",
            " ",
            kernel.executionCount
          )
        : React.createElement(
            "a",
            {
              onClick: () =>
                this.props.onClick({
                  kernel,
                  markers,
                }),
            },
            kernel.displayName,
            " | ",
            kernel.executionState,
            " |",
            " ",
            kernel.executionCount,
            " | ",
            kernel.lastExecutionTime
          )
      : React.createElement(
          "a",
          {
            onClick: () =>
              this.props.onClick({
                kernel,
                markers,
              }),
          },
          kernel.displayName,
          " | ",
          kernel.executionState
        );
    return view;
  }
}

module.exports = StatusBar;
