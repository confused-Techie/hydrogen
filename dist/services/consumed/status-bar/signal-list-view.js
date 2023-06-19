const { Panel } = require("atom");
const SelectListView = require("atom-select-list");
const WSKernel = require("../../../ws-kernel.js");
const { log, setPreviouslyFocusedElement } = require("../../../utils.js");

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
    this.selectListView = new SelectListView({
      itemsClassList: ["mark-active"],
      items: [],
      filterKeyForItem: (item) => item.name,
      elementForItem: (item) => {
        const element = document.createElement("li");
        element.textContent = item.name;
        return element;
      },
      didConfirmSelection: (item) => {
        log("Selected command:", item);
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
      kernel.transport instanceof WSKernel
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
    setPreviouslyFocusedElement(this);
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

module.exports = SignalListView;
