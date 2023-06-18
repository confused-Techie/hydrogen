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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mobx_react_1 = require("mobx-react");
const utils_1 = require("../../../utils");
let StatusBar = class StatusBar extends react_1.default.Component {
  render() {
    const { kernel, markers, configMapping } = this.props.store;
    if (!kernel || configMapping.get("Hydrogen.statusBarDisable")) {
      return null;
    }
    // Hydrogen.statusBarKernelInfo branch on if exec time is not available or no execution has happened
    const view = configMapping.get("Hydrogen.statusBarKernelInfo")
      ? kernel.executionCount === 0 ||
        kernel.lastExecutionTime === utils_1.NO_EXECTIME_STRING
        ? react_1.default.createElement(
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
        : react_1.default.createElement(
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
      : react_1.default.createElement(
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
};
StatusBar = __decorate([mobx_react_1.observer], StatusBar);
exports.default = StatusBar;
