const { Grammar } = require("atom");
const { ChildProcess } = require("child_process");
const fs = require("fs");
const { Message, Socket } = require("jmp");
const { v4 } = require("uuid");
const { launchSpec, launchSpecFromConnectionInfo } = require("spawnteract");
const Config = require("./config.js");
const KernelTransport = require("./kernel-transport.js");
const { log, js_idx_to_char_idx } = require("./utils.js");

class ZMQKernel extends KernelTransport {
  constructor(kernelSpec, grammar, options, onStarted) {
    super(kernelSpec, grammar);
    this.executionCallbacks = {};
    this.options = options || {};
    // Otherwise spawnteract deletes the file and hydrogen's restart kernel fails
    options.cleanupConnectionFile = false;
    launchSpec(kernelSpec, options).then(
      ({ config, connectionFile, spawn }) => {
        this.connection = config;
        this.connectionFile = connectionFile;
        this.kernelProcess = spawn;
        this.monitorNotifications(spawn);
        this.connect(() => {
          this._executeStartupCode();
          if (onStarted) {
            onStarted(this);
          }
        });
      }
    );
  }
  connect(done) {
    const scheme = this.connection.signature_scheme.slice("hmac-".length);
    const { key } = this.connection;
    this.shellSocket = new Socket("dealer", scheme, key);
    this.stdinSocket = new Socket("dealer", scheme, key);
    this.ioSocket = new Socket("sub", scheme, key);
    const id = v4();
    this.shellSocket.identity = `dealer${id}`;
    this.stdinSocket.identity = `dealer${id}`;
    this.ioSocket.identity = `sub${id}`;
    const address = `${this.connection.transport}://${this.connection.ip}:`;
    this.shellSocket.connect(address + this.connection.shell_port);
    this.ioSocket.connect(address + this.connection.iopub_port);
    this.ioSocket.subscribe("");
    this.stdinSocket.connect(address + this.connection.stdin_port);
    this.shellSocket.on("message", this.onShellMessage.bind(this));
    this.ioSocket.on("message", this.onIOMessage.bind(this));
    this.stdinSocket.on("message", this.onStdinMessage.bind(this));
    this.monitor(done);
  }
  monitorNotifications(childProcess) {
    childProcess.stdout.on("data", (data) => {
      data = data.toString();
      if (atom.config.get("Hydrogen.kernelNotifications")) {
        atom.notifications.addInfo(this.kernelSpec.display_name, {
          description: data,
          dismissable: true,
        });
      } else {
        log("ZMQKernel: stdout:", data);
      }
    });
    childProcess.stderr.on("data", (data) => {
      atom.notifications.addError(this.kernelSpec.display_name, {
        description: data.toString(),
        dismissable: true,
      });
    });
  }
  monitor(done) {
    try {
      const socketNames = ["shellSocket", "ioSocket"];
      let waitGroup = socketNames.length;
      const onConnect = ({ socketName, socket }) => {
        log(`ZMQKernel: ${socketName} connected`);
        socket.unmonitor();
        waitGroup--;
        if (waitGroup === 0) {
          log("ZMQKernel: all main sockets connected");
          this.setExecutionState("idle");
          if (done) {
            done();
          }
        }
      };
      const monitor = (socketName, socket) => {
        log(`ZMQKernel: monitor ${socketName}`);
        socket.on(
          "connect",
          onConnect.bind(this, {
            socketName,
            socket,
          })
        );
        socket.monitor();
      };
      monitor("shellSocket", this.shellSocket);
      monitor("ioSocket", this.ioSocket);
    } catch (err) {
      log("ZMQKernel:", err);
    }
  }
  interrupt() {
    if (process.platform === "win32") {
      atom.notifications.addWarning("Cannot interrupt this kernel", {
        detail: "Kernel interruption is currently not supported in Windows.",
      });
    } else {
      log("ZMQKernel: sending SIGINT");
      this.kernelProcess.kill("SIGINT");
    }
  }
  _kill() {
    log("ZMQKernel: sending SIGKILL");
    this.kernelProcess.kill("SIGKILL");
  }
  _executeStartupCode() {
    const displayName = this.kernelSpec.display_name;
    let startupCode = Config.getJson("startupCode")[displayName];
    if (startupCode) {
      log("KernelManager: Executing startup code:", startupCode);
      startupCode += "\n";
      this.execute(startupCode, (message, channel) => {});
    }
  }
  shutdown() {
    this._socketShutdown();
  }
  restart(onRestarted) {
    this._socketRestart(onRestarted);
  }
  _socketShutdown(restart = false) {
    const requestId = `shutdown_${v4()}`;
    const message = _createMessage("shutdown_request", requestId);
    message.content = {
      restart,
    };
    this.shellSocket.send(new Message(message));
  }
  _socketRestart(onRestarted) {
    if (this.executionState === "restarting") {
      return;
    }
    this.setExecutionState("restarting");
    this._socketShutdown(true);
    this._kill();
    const { spawn } = launchSpecFromConnectionInfo(
      this.kernelSpec,
      this.connection,
      this.connectionFile,
      this.options
    );
    this.kernelProcess = spawn;
    this.monitor(() => {
      this._executeStartupCode();
      if (onRestarted) {
        onRestarted();
      }
    });
  }
  // onResults is a callback that may be called multiple times
  // as results come in from the kernel
  execute(code, onResults) {
    log("ZMQKernel.execute:", code);
    const requestId = `execute_${v4()}`;
    const message = _createMessage("execute_request", requestId);
    message.content = {
      code,
      silent: false,
      store_history: true,
      user_expressions: {},
      allow_stdin: true,
    };
    this.executionCallbacks[requestId] = onResults;
    this.shellSocket.send(new Message(message));
  }
  complete(code, onResults) {
    log("ZMQKernel.complete:", code);
    const requestId = `complete_${v4()}`;
    const message = _createMessage("complete_request", requestId);
    message.content = {
      code,
      text: code,
      line: code,
      cursor_pos: js_idx_to_char_idx(code.length, code),
    };
    this.executionCallbacks[requestId] = onResults;
    this.shellSocket.send(new Message(message));
  }
  inspect(code, cursorPos, onResults) {
    log("ZMQKernel.inspect:", code, cursorPos);
    const requestId = `inspect_${v4()}`;
    const message = _createMessage("inspect_request", requestId);
    message.content = {
      code,
      cursor_pos: cursorPos,
      detail_level: 0,
    };
    this.executionCallbacks[requestId] = onResults;
    this.shellSocket.send(new Message(message));
  }
  inputReply(input) {
    const requestId = `input_reply_${v4()}`;
    const message = _createMessage("input_reply", requestId);
    message.content = {
      value: input,
    };
    this.stdinSocket.send(new Message(message));
  }
  onShellMessage(message) {
    log("shell message:", message);
    if (!_isValidMessage(message)) {
      return;
    }
    const { msg_id } = message.parent_header;
    let callback;
    if (msg_id) {
      callback = this.executionCallbacks[msg_id];
    }
    if (callback) {
      callback(message, "shell");
    }
  }
  onStdinMessage(message) {
    log("stdin message:", message);
    if (!_isValidMessage(message)) {
      return;
    }

    // input_request messages are attributable to particular execution requests,
    // and should pass through the middleware stack to allow plugins to see them
    const { msg_id } = message.parent_header;
    let callback;
    if (msg_id) {
      callback = this.executionCallbacks[msg_id];
    }
    if (callback) {
      callback(message, "stdin");
    }
  }
  onIOMessage(message) {
    log("IO message:", message);
    if (!_isValidMessage(message)) {
      return;
    }
    const { msg_type } = message.header;
    if (msg_type === "status") {
      const status = message.content.execution_state;
      this.setExecutionState(status);
    }
    const { msg_id } = message.parent_header;
    let callback;
    if (msg_id) {
      callback = this.executionCallbacks[msg_id];
    }
    if (callback) {
      callback(message, "iopub");
    }
  }
  destroy() {
    log("ZMQKernel: destroy:", this);
    this.shutdown();
    this._kill();
    fs.unlinkSync(this.connectionFile);
    this.shellSocket.close();
    this.ioSocket.close();
    this.stdinSocket.close();
    super.destroy();
  }
}

function _isValidMessage(message) {
  if (!message) {
    log("Invalid message: null");
    return false;
  }
  if (!message.content) {
    log("Invalid message: Missing content");
    return false;
  }
  if (message.content.execution_state === "starting") {
    // Kernels send a starting status message with an empty parent_header
    log("Dropped starting status IO message");
    return false;
  }
  if (!message.parent_header) {
    log("Invalid message: Missing parent_header");
    return false;
  }
  if (!message.parent_header.msg_id) {
    log("Invalid message: Missing parent_header.msg_id");
    return false;
  }
  if (!message.parent_header.msg_type) {
    log("Invalid message: Missing parent_header.msg_type");
    return false;
  }
  if (!message.header) {
    log("Invalid message: Missing header");
    return false;
  }
  if (!message.header.msg_id) {
    log("Invalid message: Missing header.msg_id");
    return false;
  }
  if (!message.header.msg_type) {
    log("Invalid message: Missing header.msg_type");
    return false;
  }
  return true;
}

function _getUsername() {
  return (
    process.env.LOGNAME ||
    process.env.USER ||
    process.env.LNAME ||
    process.env.USERNAME
  );
}

function _createMessage(msgType, msgId = v4()) {
  const message = {
    header: {
      username: _getUsername(),
      session: "00000000-0000-0000-0000-000000000000",
      msg_type: msgType,
      msg_id: msgId,
      date: new Date(),
      version: "5.0",
    },
    metadata: {},
    parent_header: {},
    content: {},
  };
  return message;
}

module.exports = ZMQKernel;
