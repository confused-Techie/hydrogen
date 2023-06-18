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
const atom_1 = require("atom");
const mobx_1 = require("mobx");
const isEqual_1 = __importDefault(require("lodash/isEqual"));
const utils_1 = require("./utils");
const store_1 = __importDefault(require("./store"));
const watches_1 = __importDefault(require("./store/watches"));
const output_1 = __importDefault(require("./store/output"));
const hydrogen_kernel_1 = __importDefault(require("./plugin-api/hydrogen-kernel"));
const input_view_1 = __importDefault(require("./input-view"));
const kernel_transport_1 = __importDefault(require("./kernel-transport"));
function protectFromInvalidMessages(onResults) {
    const wrappedOnResults = (message, channel) => {
        if (!message) {
            (0, utils_1.log)("Invalid message: null");
            return;
        }
        if (!message.content) {
            (0, utils_1.log)("Invalid message: Missing content");
            return;
        }
        if (message.content.execution_state === "starting") {
          // Kernels send a starting status message with an empty parent_header
            (0, utils_1.log)("Dropped starting status IO message");
            return;
        }
        if (!message.parent_header) {
            (0, utils_1.log)("Invalid message: Missing parent_header");
            return;
        }
        if (!message.parent_header.msg_id) {
            (0, utils_1.log)("Invalid message: Missing parent_header.msg_id");
            return;
        }
        if (!message.parent_header.msg_type) {
            (0, utils_1.log)("Invalid message: Missing parent_header.msg_type");
            return;
        }
        if (!message.header) {
            (0, utils_1.log)("Invalid message: Missing header");
            return;
        }
        if (!message.header.msg_id) {
            (0, utils_1.log)("Invalid message: Missing header.msg_id");
            return;
        }
        if (!message.header.msg_type) {
            (0, utils_1.log)("Invalid message: Missing header.msg_type");
            return;
        }
        onResults(message, channel);
    };
    return wrappedOnResults;
} // Adapts middleware objects provided by plugins to an internal interface. In
// particular, this implements fallthrough logic for when a plugin defines some
// methods (e.g. execute) but doesn't implement others (e.g. interrupt). Note
// that HydrogenKernelMiddleware objects are mutable: they may lose/gain methods
// at any time, including in the middle of processing a request. This class also
// adds basic checks that messages passed via the `onResults` callbacks are not
// missing key mandatory fields specified in the Jupyter messaging spec.
class MiddlewareAdapter {
    constructor(middleware, next) {
        this._middleware = middleware;
        this._next = next;
    }

    // The return value of this method gets passed to plugins! For now we just
    // return the MiddlewareAdapter object itself, which is why all private
    // functionality is prefixed with _, and why MiddlewareAdapter is marked as
    // implementing HydrogenKernelMiddlewareThunk. Once multiple plugin API
    // versions exist, we may want to generate a HydrogenKernelMiddlewareThunk
    // specialized for a particular plugin API version.
    get _nextAsPluginType() {
        if (this._next instanceof kernel_transport_1.default) {
            throw new Error("MiddlewareAdapter: _nextAsPluginType must never be called when _next is KernelTransport");
        }
        return this._next;
    }
    interrupt() {
        if (this._middleware.interrupt) {
            this._middleware.interrupt(this._nextAsPluginType);
        }
        else {
            this._next.interrupt();
        }
    }
    shutdown() {
        if (this._middleware.shutdown) {
            this._middleware.shutdown(this._nextAsPluginType);
        }
        else {
            this._next.shutdown();
        }
    }
    restart(onRestarted) {
        if (this._middleware.restart) {
            this._middleware.restart(this._nextAsPluginType, onRestarted);
        }
        else {
            this._next.restart(onRestarted);
        }
    }
    execute(code, onResults) {
      // We don't want to repeatedly wrap the onResults callback every time we
      // fall through, but we need to do it at least once before delegating to
      // the KernelTransport.
        const safeOnResults = this._middleware.execute || this._next instanceof kernel_transport_1.default
            ? protectFromInvalidMessages(onResults)
            : onResults;
        if (this._middleware.execute) {
            this._middleware.execute(this._nextAsPluginType, code, safeOnResults);
        }
        else {
            this._next.execute(code, safeOnResults);
        }
    }
    complete(code, onResults) {
        const safeOnResults = this._middleware.complete || this._next instanceof kernel_transport_1.default
            ? protectFromInvalidMessages(onResults)
            : onResults;
        if (this._middleware.complete) {
            this._middleware.complete(this._nextAsPluginType, code, safeOnResults);
        }
        else {
            this._next.complete(code, safeOnResults);
        }
    }
    inspect(code, cursorPos, onResults) {
        const safeOnResults = this._middleware.inspect || this._next instanceof kernel_transport_1.default
            ? protectFromInvalidMessages(onResults)
            : onResults;
        if (this._middleware.inspect) {
            this._middleware.inspect(this._nextAsPluginType, code, cursorPos, safeOnResults);
        }
        else {
            this._next.inspect(code, cursorPos, safeOnResults);
        }
    }
}
class Kernel {
    constructor(kernel) {
        this.inspector = {
            bundle: {},
        };
        this.outputStore = new output_1.default();
        this.watchCallbacks = [];
        this.emitter = new atom_1.Emitter();
        this.pluginWrapper = null;
        this.transport = kernel;
        // Invariant: the `._next` of each entry in this array must point to the next
        // element of the array. The `._next` of the last element must point to
        // `this.transport`.
        this.watchesStore = new watches_1.default(this);
        // A MiddlewareAdapter that forwards all requests to `this.transport`.
        // Needed to terminate the middleware chain in a way such that the `next`
        // object passed to the last middleware is not the KernelTransport instance
        // itself (which would be violate isolation of internals from plugins).
        const delegateToTransport = new MiddlewareAdapter({}, this.transport);
        this.middleware = [delegateToTransport];
    }
    get kernelSpec() {
        return this.transport.kernelSpec;
    }
    get grammar() {
        return this.transport.grammar;
    }
    get language() {
        return this.transport.language;
    }
    get displayName() {
        return this.transport.displayName;
    }
    get firstMiddlewareAdapter() {
        return this.middleware[0];
    }
    addMiddleware(middleware) {
        this.middleware.unshift(new MiddlewareAdapter(middleware, this.middleware[0]));
    }
    get executionState() {
        return this.transport.executionState;
    }
    setExecutionState(state) {
        this.transport.setExecutionState(state);
    }
    get executionCount() {
        return this.transport.executionCount;
    }
    setExecutionCount(count) {
        this.transport.setExecutionCount(count);
    }
    get lastExecutionTime() {
        return this.transport.lastExecutionTime;
    }
    setLastExecutionTime(timeString) {
        this.transport.setLastExecutionTime(timeString);
    }
    async setInspectorResult(bundle, editor) {
        if ((0, isEqual_1.default)(this.inspector.bundle, bundle)) {
            await atom.workspace.toggle(utils_1.INSPECTOR_URI);
        }
        else if (bundle.size !== 0) {
            this.inspector.bundle = bundle;
            await atom.workspace.open(utils_1.INSPECTOR_URI, {
                searchAllPanes: true,
            });
        }
        (0, utils_1.focus)(editor);
    }
    getPluginWrapper() {
        if (!this.pluginWrapper) {
            this.pluginWrapper = new hydrogen_kernel_1.default(this);
        }
        return this.pluginWrapper;
    }
    addWatchCallback(watchCallback) {
        this.watchCallbacks.push(watchCallback);
    }
    interrupt() {
        this.firstMiddlewareAdapter.interrupt();
    }
    shutdown() {
        this.firstMiddlewareAdapter.shutdown();
    }
    restart(onRestarted) {
        this.firstMiddlewareAdapter.restart(onRestarted);
        this.setExecutionCount(0);
        this.setLastExecutionTime("No execution");
    }
    execute(code, onResults) {
        const wrappedOnResults = this._wrapExecutionResultsCallback(onResults);
        this.firstMiddlewareAdapter.execute(code, (message, channel) => {
            wrappedOnResults(message, channel);
            const { msg_type } = message.header;
            if (msg_type === "execute_input") {
                this.setLastExecutionTime("Running ...");
            }
            if (msg_type === "execute_reply") {
                const count = message.content.execution_count;
                this.setExecutionCount(count);
                const timeString = (0, utils_1.executionTime)(message);
                this.setLastExecutionTime(timeString);
            }
            const { execution_state } = message.content;
            if (channel == "iopub" &&
                msg_type === "status" &&
                execution_state === "idle") {
                this._callWatchCallbacks();
            }
        });
    }
    executeWatch(code, onResults) {
        this.firstMiddlewareAdapter.execute(code, this._wrapExecutionResultsCallback(onResults));
    }
    _callWatchCallbacks() {
        this.watchCallbacks.forEach((watchCallback) => watchCallback());
    }
    /*
     * Takes a callback that accepts execution results in a hydrogen-internal
     * format and wraps it to accept Jupyter message/channel pairs instead.
     * Kernels and plugins all operate on types specified by the Jupyter messaging
     * protocol in order to maximize compatibility, but hydrogen internally uses
     * its own types.
     */
    _wrapExecutionResultsCallback(onResults) {
        return (message, channel) => {
            if (channel === "shell") {
                const { status } = message.content;
                if (status === "error" || status === "ok") {
                    onResults({
                        data: status,
                        stream: "status",
                    });
                }
                else {
                    (0, utils_1.log)("Kernel: ignoring unexpected value for message.content.status");
                }
            }
            else if (channel === "iopub") {
                if (message.header.msg_type === "execute_input") {
                    onResults({
                        data: message.content.execution_count,
                        stream: "execution_count",
                    });
                }
                // TODO(nikita): Consider converting to V5 elsewhere, so that plugins
                // never have to deal with messages in the V4 format
                const result = (0, utils_1.msgSpecToNotebookFormat)((0, utils_1.msgSpecV4toV5)(message));
                onResults(result);
            }
            else if (channel === "stdin") {
                if (message.header.msg_type !== "input_request") {
                    return;
                }
                const { prompt, password } = message.content;
                // TODO(nikita): perhaps it would make sense to install middleware for
                // sending input replies
                const inputView = new input_view_1.default({
                    prompt,
                    password,
                }, (input) => this.transport.inputReply(input));
                inputView.attach();
            }
        };
    }
    complete(code, onResults) {
        this.firstMiddlewareAdapter.complete(code, (message, channel) => {
            if (channel !== "shell") {
                (0, utils_1.log)("Invalid reply: wrong channel");
                return;
            }
            onResults(message.content);
        });
    }
    inspect(code, cursorPos, onResults) {
        this.firstMiddlewareAdapter.inspect(code, cursorPos, (message, channel) => {
            if (channel !== "shell") {
                (0, utils_1.log)("Invalid reply: wrong channel");
                return;
            }
            onResults({
                data: message.content.data,
                found: message.content.found,
            });
        });
    }
    destroy() {
        (0, utils_1.log)("Kernel: Destroying");
        // This is for cleanup to improve performance
        this.watchesStore.destroy();
        store_1.default.deleteKernel(this);
        this.transport.destroy();
        if (this.pluginWrapper) {
            this.pluginWrapper.destroyed = true;
        }
        this.emitter.emit("did-destroy");
        this.emitter.dispose();
    }
}
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], Kernel.prototype, "inspector", void 0);
__decorate([
    mobx_1.computed,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], Kernel.prototype, "executionState", null);
__decorate([
    mobx_1.computed,
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], Kernel.prototype, "executionCount", null);
__decorate([
    mobx_1.computed,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], Kernel.prototype, "lastExecutionTime", null);
__decorate([
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, atom_1.TextEditor]),
    __metadata("design:returntype", Promise)
], Kernel.prototype, "setInspectorResult", null);
exports.default = Kernel;
