Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const utils_1 = require("./utils");
class InputView {
    constructor({ prompt, defaultText, allowCancel, password }, onConfirmed) {
        this.onConfirmed = onConfirmed;
        this.element = document.createElement("div");
        this.element.classList.add("hydrogen", "input-view");
        if (password) {
            this.element.classList.add("password");
        }
        const label = document.createElement("div");
        label.classList.add("label", "icon", "icon-arrow-right");
        label.textContent = prompt || "Kernel requires input";
        this.miniEditor = new atom_1.TextEditor({
            mini: true,
        });
        if (defaultText) {
            this.miniEditor.setText(defaultText);
        }
        this.element.appendChild(label);
        this.element.appendChild(this.miniEditor.element);
        if (allowCancel) {
            atom.commands.add(this.element, {
                "core:confirm": () => this.confirm(),
                "core:cancel": () => this.close(),
            });
            this.miniEditor.element.addEventListener("blur", () => {
                if (document.hasFocus()) {
                    this.close();
                }
            });
        }
        else {
            atom.commands.add(this.element, {
                "core:confirm": () => this.confirm(),
            });
        }
    }
    confirm() {
        const text = this.miniEditor.getText();
        if (this.onConfirmed) {
            this.onConfirmed(text);
        }
        this.close();
    }
    close() {
        if (this.panel) {
            this.panel.destroy();
        }
        this.panel = null;
        this.element.remove();
        if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus();
        }
    }
    attach() {
        (0, utils_1.setPreviouslyFocusedElement)(this);
        this.panel = atom.workspace.addModalPanel({
            item: this.element,
        });
        this.miniEditor.element.focus();
        this.miniEditor.scrollToCursorPosition();
    }
}
exports.default = InputView;
