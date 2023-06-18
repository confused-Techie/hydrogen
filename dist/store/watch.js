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
const mobx_1 = require("mobx");
const output_1 = __importDefault(require("./output"));
const utils_1 = require("../utils");
class WatchStore {
  constructor(kernel) {
    this.outputStore = new output_1.default();
    this.run = () => {
      const code = this.getCode();
      (0, utils_1.log)("watchview running:", code);
      if (code && code.length > 0) {
        this.kernel.executeWatch(code, (result) => {
          this.outputStore.appendOutput(result);
        });
      }
    };
    this.setCode = (code) => {
      this.editor.setText(code);
    };
    this.getCode = () => {
      return this.editor.getText();
    };
    this.focus = () => {
      this.editor.element.focus();
    };
    this.kernel = kernel;
    this.editor = atom.workspace.buildTextEditor({
      softWrapped: true,
      lineNumberGutterVisible: false,
    });
    const grammar = this.kernel.grammar;
    if (grammar) {
      atom.grammars.assignLanguageMode(
        this.editor.getBuffer(),
        grammar.scopeName
      );
    }
    this.editor.moveToTop();
    this.editor.element.classList.add("watch-input");
  }
}
__decorate(
  [mobx_1.action, __metadata("design:type", Object)],
  WatchStore.prototype,
  "run",
  void 0
);
__decorate(
  [mobx_1.action, __metadata("design:type", Object)],
  WatchStore.prototype,
  "setCode",
  void 0
);
exports.default = WatchStore;
