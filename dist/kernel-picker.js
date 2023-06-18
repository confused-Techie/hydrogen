var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const atom_select_list_1 = __importDefault(require("atom-select-list"));
const utils_1 = require("./utils");
class KernelPicker {
    constructor(kernelSpecs) {
        this.kernelSpecs = kernelSpecs;
        this.onConfirmed = null;
        this.selectListView = new atom_select_list_1.default({
            itemsClassList: ["mark-active"],
            items: [],
            filterKeyForItem: (item) => item.display_name,
            elementForItem: (item) => {
                const element = document.createElement("li");
                element.textContent = item.display_name;
                return element;
            },
            didConfirmSelection: (item) => {
                (0, utils_1.log)("Selected kernel:", item);
                if (this.onConfirmed) {
                    this.onConfirmed(item);
                }
                this.cancel();
            },
            didCancelSelection: () => this.cancel(),
            emptyMessage: "No kernels found",
        });
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
    async toggle() {
        if (this.panel != null) {
            this.cancel();
        }
        else {
            await this.selectListView.update({
                items: this.kernelSpecs,
            });
            this.attach();
        }
    }
}
exports.default = KernelPicker;
