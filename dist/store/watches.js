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
const mobx_1 = require("mobx");
const atom_select_list_1 = __importDefault(require("atom-select-list"));
const watch_1 = __importDefault(require("./watch"));
const autocomplete_1 = __importDefault(
  require("../services/consumed/autocomplete")
);
const utils_1 = require("../utils");
class WatchesStore {
  constructor(kernel) {
    this.watches = [];
    this.createWatch = () => {
      const lastWatch = this.watches[this.watches.length - 1];
      if (!lastWatch || lastWatch.getCode().trim() !== "") {
        const watch = new watch_1.default(this.kernel);
        this.watches.push(watch);
        if (autocomplete_1.default.isEnabeled) {
          autocomplete_1.default.addAutocompleteToWatch(this, watch);
        }
        return watch;
      }
      return lastWatch;
    };
    this.addWatch = () => {
      this.createWatch().focus();
    };
    this.addWatchFromEditor = (editor) => {
      if (!editor) {
        return;
      }
      const watchText = editor.getSelectedText();
      if (!watchText) {
        this.addWatch();
      } else {
        const watch = this.createWatch();
        watch.setCode(watchText);
        watch.run();
      }
    };
    this.removeWatch = () => {
      const watches = this.watches
        .map((v, k) => ({
          name: v.getCode(),
          value: k,
        }))
        .filter((obj) => obj.value !== 0 || obj.name !== "");
      const watchesPicker = new atom_select_list_1.default({
        items: watches,
        elementForItem: (watch) => {
          const element = document.createElement("li");
          element.textContent = watch.name || "<empty>";
          return element;
        },
        didConfirmSelection: (watch) => {
          const selectedWatch = this.watches[watch.value];
          // This is for cleanup to improve performance
          if (autocomplete_1.default.isEnabeled) {
            autocomplete_1.default.removeAutocompleteFromWatch(
              this,
              selectedWatch
            );
          }
          this.watches.splice(watch.value, 1);
          modalPanel.destroy();
          watchesPicker.destroy();
          if (this.watches.length === 0) {
            this.addWatch();
          } else if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus();
          }
        },
        filterKeyForItem: (watch) => watch.name,
        didCancelSelection: () => {
          modalPanel.destroy();
          if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus();
          }
          watchesPicker.destroy();
        },
        emptyMessage: "There are no watches to remove!",
      });
      (0, utils_1.setPreviouslyFocusedElement)(this);
      const modalPanel = atom.workspace.addModalPanel({
        item: watchesPicker,
      });
      watchesPicker.focus();
    };
    this.run = () => {
      this.watches.forEach((watch) => watch.run());
    };
    this.kernel = kernel;
    this.kernel.addWatchCallback(this.run);
    if (autocomplete_1.default.isEnabeled) {
      const disposable = new atom_1.CompositeDisposable();
      this.autocompleteDisposables = disposable;
      autocomplete_1.default.register(disposable);
    }
    this.addWatch();
  }
  destroy() {
    if (autocomplete_1.default.isEnabeled && this.autocompleteDisposables) {
      autocomplete_1.default.dispose(this.autocompleteDisposables);
    }
  }
}
__decorate(
  [mobx_1.observable, __metadata("design:type", Array)],
  WatchesStore.prototype,
  "watches",
  void 0
);
__decorate(
  [mobx_1.action, __metadata("design:type", Object)],
  WatchesStore.prototype,
  "createWatch",
  void 0
);
__decorate(
  [mobx_1.action, __metadata("design:type", Object)],
  WatchesStore.prototype,
  "addWatch",
  void 0
);
__decorate(
  [mobx_1.action, __metadata("design:type", Object)],
  WatchesStore.prototype,
  "addWatchFromEditor",
  void 0
);
__decorate(
  [mobx_1.action, __metadata("design:type", Object)],
  WatchesStore.prototype,
  "removeWatch",
  void 0
);
__decorate(
  [mobx_1.action, __metadata("design:type", Object)],
  WatchesStore.prototype,
  "run",
  void 0
);
exports.default = WatchesStore;
