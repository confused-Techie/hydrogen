
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mathjax_1 = require("@nteract/mathjax");
const mathjax_electron_1 = require("mathjax-electron");
const mobx_1 = require("mobx");
const mobx_react_1 = require("mobx-react");
const anser_1 = __importDefault(require("anser"));
const history_1 = __importDefault(require("./result-view/history"));
const list_1 = __importDefault(require("./result-view/list"));
const utils_1 = require("../utils");
let OutputArea = class OutputArea extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.showHistory = true;
        this.setHistory = () => {
            this.showHistory = true;
        };
        this.setScrollList = () => {
            this.showHistory = false;
        };
        this.handleClick = () => {
            const kernel = this.props.store.kernel;
            if (!kernel || !kernel.outputStore) {
                return;
            }
            const output = kernel.outputStore.outputs[kernel.outputStore.index];
            const copyOutput = this.getOutputText(output);
            if (copyOutput) {
                atom.clipboard.write(anser_1.default.ansiToText(copyOutput));
                atom.notifications.addSuccess("Copied to clipboard");
            }
            else {
                atom.notifications.addWarning("Nothing to copy");
            }
        };
    }
    getOutputText(output) {
        switch (output.output_type) {
            case "stream":
                return output.text;
            case "execute_result":
                return output.data["text/plain"];
            case "error":
                return output.traceback.toJS().join("\n");
        }
    }
    render() {
        const kernel = this.props.store.kernel;
        if (!kernel) {
            if (atom.config.get("Hydrogen.outputAreaDock")) {
                return react_1.default.createElement(utils_1.EmptyMessage, null);
            }
            atom.workspace.hide(utils_1.OUTPUT_AREA_URI);
            return null;
        }
        return (react_1.default.createElement(mathjax_1.Provider, { src: mathjax_electron_1.mathJaxPath },
            react_1.default.createElement("div", { className: "sidebar output-area" },
                kernel.outputStore.outputs.length > 0 ? (react_1.default.createElement("div", { className: "block" },
                    react_1.default.createElement("div", { className: "btn-group" },
                        react_1.default.createElement("button", { className: `btn icon icon-clock${this.showHistory ? " selected" : ""}`, onClick: this.setHistory }),
                        react_1.default.createElement("button", { className: `btn icon icon-three-bars${!this.showHistory ? " selected" : ""}`, onClick: this.setScrollList })),
                    react_1.default.createElement("div", { style: {
                            float: "right",
                        } },
                        this.showHistory ? (react_1.default.createElement("button", { className: "btn icon icon-clippy", onClick: this.handleClick }, "Copy")) : null,
                        react_1.default.createElement("button", { className: "btn icon icon-trashcan", onClick: kernel.outputStore.clear }, "Clear")))) : (react_1.default.createElement(utils_1.EmptyMessage, null)),
                this.showHistory ? (react_1.default.createElement(history_1.default, { store: kernel.outputStore })) : (react_1.default.createElement(list_1.default, { outputs: kernel.outputStore.outputs })))));
    }
};
__decorate([
    mobx_1.observable,
    __metadata("design:type", Boolean)
], OutputArea.prototype, "showHistory", void 0);
__decorate([
    mobx_1.action,
    __metadata("design:type", Object)
], OutputArea.prototype, "setHistory", void 0);
__decorate([
    mobx_1.action,
    __metadata("design:type", Object)
], OutputArea.prototype, "setScrollList", void 0);
OutputArea = __decorate([
    mobx_react_1.observer
], OutputArea);
exports.default = OutputArea;
