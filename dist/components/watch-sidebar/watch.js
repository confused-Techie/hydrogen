var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const atom_1 = require("atom");
const history_1 = __importDefault(require("../result-view/history"));
class Watch extends react_1.default.Component {
  constructor() {
    super(...arguments);
    this.subscriptions = new atom_1.CompositeDisposable();
  }
  componentDidMount() {
    if (!this.container) {
      return;
    }
    const container = this.container;
    container.insertBefore(
      this.props.store.editor.element,
      container.firstChild
    );
  }
  componentWillUnmount() {
    this.subscriptions.dispose();
  }
  render() {
    return react_1.default.createElement(
      "div",
      {
        className: "hydrogen watch-view",
        ref: (c) => {
          this.container = c;
        },
      },
      react_1.default.createElement(history_1.default, {
        store: this.props.store.outputStore,
      })
    );
  }
}
exports.default = Watch;
