const React = require("react");
const { observer } = require("mobx-react");

const Status = observer(({ status, style }) => {
  switch (status) {
    case "running":
      return React.createElement(
        "div",
        { className: "inline-container spinner", style: style },
        React.createElement("div", { className: "rect1" }),
        React.createElement("div", { className: "rect2" }),
        React.createElement("div", { className: "rect3" }),
        React.createElement("div", { className: "rect4" }),
        React.createElement("div", { className: "rect5" })
      );
    case "ok":
      return React.createElement("div", {
        className: "inline-container icon icon-check",
        style: style,
      });
    case "empty":
      return React.createElement("div", {
        className: "inline-container icon icon-zap",
        style: style,
      });
    default:
      return React.createElement("div", {
        className: "inline-container icon icon-x",
        style: style,
      });
  }
});

module.exports = Status;
