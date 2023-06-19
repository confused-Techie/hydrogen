const { Grammar } = require("atom");
const { observable, action } = require("mobx");
const { log } = require("./utils.js");

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
    log("KernelTransport: Destroying base kernel");
  }
}

module.exports = KernelTransport;
