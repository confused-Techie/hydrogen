var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const atom_select_list_1 = __importDefault(require("atom-select-list"));
const store_1 = __importDefault(require("./store"));
const tildify_1 = __importDefault(require("tildify"));
const utils_1 = require("./utils");
function getName(kernel) {
    const prefix = kernel.transport.gatewayName
        ? `${kernel.transport.gatewayName}: `
        : "";
    return `${prefix + kernel.displayName} - ${store_1.default
        .getFilesForKernel(kernel)
        .map(tildify_1.default)
        .join(", ")}`;
}
class ExistingKernelPicker {
    constructor() {
        this.selectListView = new atom_select_list_1.default({
            itemsClassList: ["mark-active"],
            items: [],
            filterKeyForItem: (kernel) => getName(kernel),
            elementForItem: (kernel) => {
                const element = document.createElement("li");
                element.textContent = getName(kernel);
                return element;
            },
            didConfirmSelection: (kernel) => {
                const { filePath, editor, grammar } = store_1.default;
                if (!filePath || !editor || !grammar) {
                    return this.cancel();
                }
                store_1.default.newKernel(kernel, filePath, editor, grammar);
                this.cancel();
            },
            didCancelSelection: () => this.cancel(),
            emptyMessage: "No running kernels for this language.",
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
        else if (store_1.default.filePath && store_1.default.grammar) {
            await this.selectListView.update({
                items: store_1.default.runningKernels.filter((kernel) => (0, utils_1.kernelSpecProvidesGrammar)(kernel.kernelSpec, store_1.default.grammar)),
            });
            const markers = store_1.default.markers;
            if (markers) {
                markers.clear();
            }
            this.attach();
        }
    }
}
exports.default = ExistingKernelPicker;
