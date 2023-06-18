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
const display_1 = __importDefault(require("./display"));
let ScrollList = class ScrollList extends react_1.default.Component {
  scrollToBottom() {
    if (!this.el) {
      return;
    }
    const scrollHeight = this.el.scrollHeight;
    const height = this.el.clientHeight;
    const maxScrollTop = scrollHeight - height;
    this.el.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }
  componentDidUpdate() {
    this.scrollToBottom();
  }
  componentDidMount() {
    this.scrollToBottom();
  }
  render() {
    if (this.props.outputs.length === 0) {
      return null;
    }
    return react_1.default.createElement(
      "div",
      {
        className: "scroll-list multiline-container native-key-bindings",
        tabIndex: -1,
        style: {
          fontSize: atom.config.get(`Hydrogen.outputAreaFontSize`) || "inherit",
        },
        ref: (el) => {
          this.el = el;
        },
        "hydrogen-wrapoutput": atom.config
          .get(`Hydrogen.wrapOutput`)
          .toString(),
      },
      this.props.outputs.map((output, index) =>
        react_1.default.createElement(
          "div",
          { className: "scroll-list-item" },
          react_1.default.createElement(display_1.default, {
            output: output,
            key: index,
          })
        )
      )
    );
  }
};
ScrollList = __decorate([mobx_react_1.observer], ScrollList);
exports.default = ScrollList;
