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
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const react_1 = __importDefault(require("react"));
const mobx_react_1 = require("mobx-react");
const mobx_1 = require("mobx");
const display_1 = __importDefault(require("./display"));
const status_1 = __importDefault(require("./status"));
const SCROLL_HEIGHT = 600;
let ResultViewComponent = class ResultViewComponent extends react_1.default
  .Component {
  constructor() {
    super(...arguments);
    this.containerTooltip = new atom_1.CompositeDisposable();
    this.buttonTooltip = new atom_1.CompositeDisposable();
    this.closeTooltip = new atom_1.CompositeDisposable();
    this.expanded = false;
    this.getAllText = () => {
      if (!this.el) {
        return "";
      }
      return this.el.innerText ? this.el.innerText : "";
    };
    this.handleClick = (event) => {
      if (event.ctrlKey || event.metaKey) {
        this.openInEditor();
      } else {
        this.copyToClipboard();
      }
    };
    this.checkForSelection = (event) => {
      const selection = document.getSelection();
      if (selection && selection.toString()) {
        return;
      } else {
        this.handleClick(event);
      }
    };
    this.copyToClipboard = () => {
      atom.clipboard.write(this.getAllText());
      atom.notifications.addSuccess("Copied to clipboard");
    };
    this.openInEditor = () => {
      atom.workspace
        .open()
        .then((editor) => editor.insertText(this.getAllText()));
    };
    this.addCopyTooltip = (element, comp) => {
      if (!element || !comp.disposables || comp.disposables.size > 0) {
        return;
      }
      comp.add(
        atom.tooltips.add(element, {
          title: `Click to copy,
          ${
            process.platform === "darwin" ? "Cmd" : "Ctrl"
          }+Click to open in editor`,
        })
      );
    };
    this.addCloseButtonTooltip = (element, comp) => {
      if (!element || !comp.disposables || comp.disposables.size > 0) {
        return;
      }
      comp.add(
        atom.tooltips.add(element, {
          title: this.props.store.executionCount
            ? `Close (Out[${this.props.store.executionCount}])`
            : "Close result",
        })
      );
    };
    this.addCopyButtonTooltip = (element) => {
      this.addCopyTooltip(element, this.buttonTooltip);
    };
    this.onWheel = (element) => {
      return (event) => {
        const clientHeight = element.clientHeight;
        const scrollHeight = element.scrollHeight;
        const clientWidth = element.clientWidth;
        const scrollWidth = element.scrollWidth;
        const scrollTop = element.scrollTop;
        const scrollLeft = element.scrollLeft;
        const atTop = scrollTop !== 0 && event.deltaY < 0;
        const atLeft = scrollLeft !== 0 && event.deltaX < 0;
        const atBottom =
          scrollTop !== scrollHeight - clientHeight && event.deltaY > 0;
        const atRight =
          scrollLeft !== scrollWidth - clientWidth && event.deltaX > 0;
        if (clientHeight < scrollHeight && (atTop || atBottom)) {
          event.stopPropagation();
        } else if (clientWidth < scrollWidth && (atLeft || atRight)) {
          event.stopPropagation();
        }
      };
    };
    this.toggleExpand = () => {
      this.expanded = !this.expanded;
    };
  }
  render() {
    const { outputs, status, isPlain, position } = this.props.store;
    const inlineStyle = {
      marginLeft: `${position.lineLength + position.charWidth}px`,
      marginTop: `-${position.lineHeight}px`,
      userSelect: "text",
    };
    if (outputs.length === 0 || !this.props.showResult) {
      const kernel = this.props.kernel;
      return react_1.default.createElement(status_1.default, {
        status:
          kernel && kernel.executionState !== "busy" && status === "running"
            ? "error"
            : status,
        style: inlineStyle,
      });
    }
    return react_1.default.createElement(
      "div",
      {
        className: `${
          isPlain ? "inline-container" : "multiline-container"
        } native-key-bindings`,
        tabIndex: -1,
        onClick: isPlain ? this.checkForSelection : undefined,
        style: isPlain
          ? inlineStyle
          : {
              maxWidth: `${position.editorWidth - 2 * position.charWidth}px`,
              margin: "0px",
              userSelect: "text",
            },
        "hydrogen-wrapoutput": atom.config
          .get(`Hydrogen.wrapOutput`)
          .toString(),
      },
      react_1.default.createElement(
        "div",
        {
          className: "hydrogen_cell_display",
          ref: (ref) => {
            if (!ref) {
              return;
            }
            this.el = ref;
            isPlain
              ? this.addCopyTooltip(ref, this.containerTooltip)
              : this.containerTooltip.dispose();
            // As of this writing React's event handler doesn't properly handle
            // event.stopPropagation() for events outside the React context.
            if (!this.expanded && !isPlain && ref) {
              ref.addEventListener("wheel", this.onWheel(ref), {
                passive: true,
              });
            }
          },
          style: {
            maxHeight: this.expanded ? "100%" : `${SCROLL_HEIGHT}px`,
            overflowY: "auto",
          },
        },
        outputs.map((output, index) =>
          react_1.default.createElement(display_1.default, {
            output: output,
            key: index,
          })
        )
      ),
      isPlain
        ? null
        : react_1.default.createElement(
            "div",
            { className: "toolbar" },
            react_1.default.createElement("div", {
              className: "icon icon-x",
              onClick: this.props.destroy,
              ref: (ref) => this.addCloseButtonTooltip(ref, this.closeTooltip),
            }),
            react_1.default.createElement("div", {
              style: {
                flex: 1,
                minHeight: "0.25em",
              },
            }),
            this.getAllText().length > 0
              ? react_1.default.createElement("div", {
                  className: "icon icon-clippy",
                  onClick: this.handleClick,
                  ref: this.addCopyButtonTooltip,
                })
              : null,
            this.el && this.el.scrollHeight > SCROLL_HEIGHT
              ? react_1.default.createElement("div", {
                  className: `icon icon-${this.expanded ? "fold" : "unfold"}`,
                  onClick: this.toggleExpand,
                })
              : null
          )
    );
  }
  scrollToBottom() {
    if (
      !this.el ||
      this.expanded ||
      this.props.store.isPlain ||
      atom.config.get(`Hydrogen.autoScroll`) === false
    ) {
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
  componentWillUnmount() {
    this.containerTooltip.dispose();
    this.buttonTooltip.dispose();
    this.closeTooltip.dispose();
  }
};
__decorate(
  [mobx_1.observable, __metadata("design:type", Boolean)],
  ResultViewComponent.prototype,
  "expanded",
  void 0
);
__decorate(
  [mobx_1.action, __metadata("design:type", Object)],
  ResultViewComponent.prototype,
  "toggleExpand",
  void 0
);
ResultViewComponent = __decorate([mobx_react_1.observer], ResultViewComponent);

exports.default = ResultViewComponent;
