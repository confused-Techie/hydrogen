var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kernel_transport_1 = __importDefault(require("./kernel-transport"));
const input_view_1 = __importDefault(require("./input-view"));
const utils_1 = require("./utils");
class WSKernel extends kernel_transport_1.default {
    constructor(gatewayName, kernelSpec, grammar, session) {
        super(kernelSpec, grammar);
        this.session = session;
        this.gatewayName = gatewayName;
        this.session.statusChanged.connect(() => this.setExecutionState(this.session.status));
        this.setExecutionState(this.session.status); // Set initial status correctly
    }
    interrupt() {
        this.session.kernel.interrupt();
    }
    async shutdown() {
      // TODO 'shutdown' does not exist on type 'IKernelConnection'
        var _a;
        await ((_a = this.session.shutdown()) !== null && _a !== void 0 ? _a : this.session.kernel.shutdown());
    }
    restart(onRestarted) {
        const future = this.session.kernel.restart();
        future.then(() => {
            if (onRestarted) {
                onRestarted();
            }
        });
    }
    execute(code, onResults) {
        const future = this.session.kernel.requestExecute({
            code,
        });
        future.onIOPub = (message) => {
            (0, utils_1.log)("WSKernel: execute:", message);
            onResults(message, "iopub");
        };
        future.onReply = (message) => onResults(message, "shell");
        future.onStdin = (message) => onResults(message, "stdin");
    }
    complete(code, onResults) {
        this.session.kernel
            .requestComplete({
            code,
            cursor_pos: (0, utils_1.js_idx_to_char_idx)(code.length, code),
        })
            .then((message) => onResults(message, "shell"));
    }
    inspect(code, cursorPos, onResults) {
        this.session.kernel
            .requestInspect({
            code,
            cursor_pos: cursorPos,
            detail_level: 0,
        })
            .then((message) => onResults(message, "shell"));
    }
    inputReply(input) {
        this.session.kernel.sendInputReply({
            value: input,
        });
    }
    promptRename() {
        const view = new input_view_1.default({
            prompt: "Name your current session",
            defaultText: this.session.path,
            allowCancel: true,
        }, (input) => this.session.setPath(input));
        view.attach();
    }
    destroy() {
        (0, utils_1.log)("WSKernel: destroying jupyter-js-services Session");
        this.session.dispose();
        super.destroy();
    }
}
exports.default = WSKernel;
