const { Grammar } = require("atom");
const KernelTransport = require("./kernel-transport");
const InputView = require("./input-view");
const { log, js_idx_to_char_idx } = require("./utils");

class WSKernel extends KernelTransport {
  constructor(gatewayName, kernelSpec, grammar, session) {
    super(kernelSpec, grammar);
    this.session = session;
    this.gatewayName = gatewayName;
    this.session.statusChanged.connect(() =>
      this.setExecutionState(this.session.status)
    );
    this.setExecutionState(this.session.status); // Set initial status correctly
  }

  interrupt() {
    this.session.kernel.interrupt();
  }

  async shutdown() {
    // TODO 'shutdown' does not exist on type 'IKernelConnection'
    await (this.session.shutdown() ?? this.session.kernel.shutdown());
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
      log("WSKernel: execute:", message);
      onResults(message, "iopub");
    };
    future.onReply = (message) => onResults(message, "shell");
    future.onStdin = (message) => onResults(message, "stdin");
  }
  complete(code, onResults) {
    this.session.kernel
      .requestComplete({
        code,
        cursor_pos: js_idx_to_char_idx(code.length, code),
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
    const view = new InputView(
      {
        prompt: "Name your current session",
        defaultText: this.session.path,
        allowCancel: true,
      },
      (input) => this.session.setPath(input)
    );
    view.attach();
  }
  destroy() {
    log("WSKernel: destroying jupyter-js-services Session");
    this.session.dispose();
    super.destroy();
  }
}

module.exports = WSKernel;
