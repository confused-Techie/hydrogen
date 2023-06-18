var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mobx_react_1 = require("mobx-react");
const Status = (0, mobx_react_1.observer)(({ status, style }) => {
  switch (status) {
    case "running":
      return react_1.default.createElement(
        "div",
        { className: "inline-container spinner", style: style },
        react_1.default.createElement("div", { className: "rect1" }),
        react_1.default.createElement("div", { className: "rect2" }),
        react_1.default.createElement("div", { className: "rect3" }),
        react_1.default.createElement("div", { className: "rect4" }),
        react_1.default.createElement("div", { className: "rect5" })
      );
    case "ok":
      return react_1.default.createElement("div", {
        className: "inline-container icon icon-check",
        style: style,
      });
    case "empty":
      return react_1.default.createElement("div", {
        className: "inline-container icon icon-zap",
        style: style,
      });
    default:
      return react_1.default.createElement("div", {
        className: "inline-container icon icon-x",
        style: style,
      });
  }
});
exports.default = Status;
