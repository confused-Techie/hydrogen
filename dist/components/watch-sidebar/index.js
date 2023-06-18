var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mobx_react_1 = require("mobx-react");
const watch_1 = __importDefault(require("./watch"));
const utils_1 = require("../../utils");
const Watches = (0, mobx_react_1.observer)(({ store: { kernel } }) => {
  if (!kernel) {
    if (atom.config.get("Hydrogen.outputAreaDock")) {
      return react_1.default.createElement(utils_1.EmptyMessage, null);
    }
    atom.workspace.hide(utils_1.WATCHES_URI);
    return null;
  }
  return react_1.default.createElement(
    "div",
    { className: "sidebar watch-sidebar" },
    kernel.watchesStore.watches.map((watch) =>
      react_1.default.createElement(watch_1.default, {
        key: watch.editor.id,
        store: watch,
      })
    ),
    react_1.default.createElement(
      "div",
      { className: "btn-group" },
      react_1.default.createElement(
        "button",
        {
          className: "btn btn-primary icon icon-plus",
          onClick: kernel.watchesStore.addWatch,
        },
        "Add watch"
      ),
      react_1.default.createElement(
        "button",
        {
          className: "btn btn-error icon icon-trashcan",
          onClick: kernel.watchesStore.removeWatch,
        },
        "Remove watch"
      )
    )
  );
});
exports.default = Watches;
