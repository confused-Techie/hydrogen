var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
const utils_1 = require("./utils");
class KernelTransport {
    constructor(kernelSpec, grammar) {
        this.executionState = "loading";
        this.executionCount = 0;
        this.lastExecutionTime = "No execution";
        this.inspector = {
            bundle: {},
        };
        this.kernelSpec = kernelSpec;
        this.grammar = grammar;
        this.language = kernelSpec.language.toLowerCase();
        this.displayName = kernelSpec.display_name;
        // Only `WSKernel` would have `gatewayName` property and thus not initialize it here,
        // still `KernelTransport` is better to have `gatewayName` property for code simplicity in the other parts of code
    }
    setExecutionState(state) {
        this.executionState = state;
    }
    setExecutionCount(count) {
        this.executionCount = count;
    }
    setLastExecutionTime(timeString) {
        this.lastExecutionTime = timeString;
    }
    interrupt() {
        throw new Error("KernelTransport: interrupt method not implemented");
    }
    shutdown() {
        throw new Error("KernelTransport: shutdown method not implemented");
    }
    restart(onRestarted) {
        throw new Error("KernelTransport: restart method not implemented");
    }
    execute(code, onResults) {
        throw new Error("KernelTransport: execute method not implemented");
    }
    complete(code, onResults) {
        throw new Error("KernelTransport: complete method not implemented");
    }
    inspect(code, cursorPos, onResults) {
        throw new Error("KernelTransport: inspect method not implemented");
    }
    inputReply(input) {
        throw new Error("KernelTransport: inputReply method not implemented");
    }
    destroy() {
        (0, utils_1.log)("KernelTransport: Destroying base kernel");
    }
}
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], KernelTransport.prototype, "executionState", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], KernelTransport.prototype, "executionCount", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], KernelTransport.prototype, "lastExecutionTime", void 0);
__decorate([
    mobx_1.observable,
    __metadata("design:type", Object)
], KernelTransport.prototype, "inspector", void 0);
__decorate([
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KernelTransport.prototype, "setExecutionState", null);
__decorate([
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], KernelTransport.prototype, "setExecutionCount", null);
__decorate([
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KernelTransport.prototype, "setLastExecutionTime", null);
exports.default = KernelTransport;
