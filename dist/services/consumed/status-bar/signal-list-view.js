var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const atom_select_list_1 = __importDefault(require("atom-select-list"));
const ws_kernel_1 = __importDefault(require("../../../ws-kernel"));
const utils_1 = require("../../../utils");
const basicCommands = [
  {
    name: "Interrupt",
    value: "interrupt-kernel",
  },
  {
    name: "Restart",
    value: "restart-kernel",
  },
  {
    name: "Shut Down",
    value: "shutdown-kernel",
  },
];
const wsKernelCommands = [
  {
    name: "Rename session for",
    value: "rename-kernel",
  },
  {
    name: "Disconnect from",
    value: "disconnect-kernel",
  },
];
class SignalListView {
  constructor(store, handleKernelCommand) {
    this.store = store;
    this.handleKernelCommand = handleKernelCommand;
    this.selectListView = new atom_select_list_1.default({
      itemsClassList: ["mark-active"],
      items: [],
      filterKeyForItem: (item) => item.name,
      elementForItem: (item) => {
        const element = document.createElement("li");
        element.textContent = item.name;
        return element;
      },
      didConfirmSelection: (item) => {
        (0, utils_1.log)("Selected command:", item);
        this.onConfirmed(item);
        this.cancel();
      },
      didCancelSelection: () => this.cancel(),
      emptyMessage: "No running kernels for this file type.",
    });
  }
  onConfirmed(kernelCommand) {
    if (this.handleKernelCommand) {
      this.handleKernelCommand(kernelCommand, this.store);
    }
  }
  async toggle() {
    if (this.panel != null) {
      this.cancel();
    }
    if (!this.store) {
      return;
    }
    const kernel = this.store.kernel;
    if (!kernel) {
      return;
    }
    const commands =
      kernel.transport instanceof ws_kernel_1.default
        ? [...basicCommands, ...wsKernelCommands]
        : basicCommands;
    const listItems = commands.map((command) => ({
      name: `${command.name} ${kernel.kernelSpec.display_name} kernel`,
      command: command.value,
    }));
    await this.selectListView.update({
      items: listItems,
    });
    this.attach();
  }
  attach() {
    (0, utils_1.setPreviouslyFocusedElement)(this);
    if (this.panel == null) {
      this.panel = atom.workspace.addModalPanel({
        item: this.selectListView,
      });
    }
    this.selectListView.focus();
    this.selectListView.reset();
  }
  destroy() {
    this.cancel();
    return this.selectListView.destroy();
  }
  cancel() {
    if (this.panel != null) {
      this.panel.destroy();
    }
    this.panel = null;
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
  }
}
exports.default = SignalListView;
