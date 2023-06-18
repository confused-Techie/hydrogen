var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const jmp_1 = require("jmp");
const uuid_1 = require("uuid");
const spawnteract_1 = require("spawnteract");
const config_1 = __importDefault(require("./config"));
const kernel_transport_1 = __importDefault(require("./kernel-transport"));
const utils_1 = require("./utils");
class ZMQKernel extends kernel_transport_1.default {
    constructor(kernelSpec, grammar, options, onStarted) {
        super(kernelSpec, grammar);
        this.executionCallbacks = {};
        this.options = options || {};
        // Otherwise spawnteract deletes the file and hydrogen's restart kernel fails
        options.cleanupConnectionFile = false;
        (0, spawnteract_1.launchSpec)(kernelSpec, options).then(({ config, connectionFile, spawn }) => {
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
        });
    }
    connect(done) {
        const scheme = this.connection.signature_scheme.slice("hmac-".length);
        const { key } = this.connection;
        this.shellSocket = new jmp_1.Socket("dealer", scheme, key);
        this.stdinSocket = new jmp_1.Socket("dealer", scheme, key);
        this.ioSocket = new jmp_1.Socket("sub", scheme, key);
        const id = (0, uuid_1.v4)();
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
            }
            else {
                (0, utils_1.log)("ZMQKernel: stdout:", data);
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
                (0, utils_1.log)(`ZMQKernel: ${socketName} connected`);
                socket.unmonitor();
                waitGroup--;
                if (waitGroup === 0) {
                    (0, utils_1.log)("ZMQKernel: all main sockets connected");
                    this.setExecutionState("idle");
                    if (done) {
                        done();
                    }
                }
            };
            const monitor = (socketName, socket) => {
                (0, utils_1.log)(`ZMQKernel: monitor ${socketName}`);
                socket.on("connect", onConnect.bind(this, {
                    socketName,
                    socket,
                }));
                socket.monitor();
            };
            monitor("shellSocket", this.shellSocket);
            monitor("ioSocket", this.ioSocket);
        }
        catch (err) {
            (0, utils_1.log)("ZMQKernel:", err);
        }
    }
    interrupt() {
        if (process.platform === "win32") {
            atom.notifications.addWarning("Cannot interrupt this kernel", {
                detail: "Kernel interruption is currently not supported in Windows.",
            });
        }
        else {
            (0, utils_1.log)("ZMQKernel: sending SIGINT");
            this.kernelProcess.kill("SIGINT");
        }
    }
    _kill() {
        (0, utils_1.log)("ZMQKernel: sending SIGKILL");
        this.kernelProcess.kill("SIGKILL");
    }
    _executeStartupCode() {
        const displayName = this.kernelSpec.display_name;
        let startupCode = config_1.default.getJson("startupCode")[displayName];
        if (startupCode) {
            (0, utils_1.log)("KernelManager: Executing startup code:", startupCode);
            startupCode += "\n";
            this.execute(startupCode, (message, channel) => { });
        }
    }
    shutdown() {
        this._socketShutdown();
    }
    restart(onRestarted) {
        this._socketRestart(onRestarted);
    }
    _socketShutdown(restart = false) {
        const requestId = `shutdown_${(0, uuid_1.v4)()}`;
        const message = _createMessage("shutdown_request", requestId);
        message.content = {
            restart,
        };
        this.shellSocket.send(new jmp_1.Message(message));
    }
    _socketRestart(onRestarted) {
        if (this.executionState === "restarting") {
            return;
        }
        this.setExecutionState("restarting");
        this._socketShutdown(true);
        this._kill();
        const { spawn } = (0, spawnteract_1.launchSpecFromConnectionInfo)(this.kernelSpec, this.connection, this.connectionFile, this.options);
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
        (0, utils_1.log)("ZMQKernel.execute:", code);
        const requestId = `execute_${(0, uuid_1.v4)()}`;
        const message = _createMessage("execute_request", requestId);
        message.content = {
            code,
            silent: false,
            store_history: true,
            user_expressions: {},
            allow_stdin: true,
        };
        this.executionCallbacks[requestId] = onResults;
        this.shellSocket.send(new jmp_1.Message(message));
    }
    complete(code, onResults) {
        (0, utils_1.log)("ZMQKernel.complete:", code);
        const requestId = `complete_${(0, uuid_1.v4)()}`;
        const message = _createMessage("complete_request", requestId);
        message.content = {
            code,
            text: code,
            line: code,
            cursor_pos: (0, utils_1.js_idx_to_char_idx)(code.length, code),
        };
        this.executionCallbacks[requestId] = onResults;
        this.shellSocket.send(new jmp_1.Message(message));
    }
    inspect(code, cursorPos, onResults) {
        (0, utils_1.log)("ZMQKernel.inspect:", code, cursorPos);
        const requestId = `inspect_${(0, uuid_1.v4)()}`;
        const message = _createMessage("inspect_request", requestId);
        message.content = {
            code,
            cursor_pos: cursorPos,
            detail_level: 0,
        };
        this.executionCallbacks[requestId] = onResults;
        this.shellSocket.send(new jmp_1.Message(message));
    }
    inputReply(input) {
        const requestId = `input_reply_${(0, uuid_1.v4)()}`;
        const message = _createMessage("input_reply", requestId);
        message.content = {
            value: input,
        };
        this.stdinSocket.send(new jmp_1.Message(message));
    }
    onShellMessage(message) {
        (0, utils_1.log)("shell message:", message);
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
        (0, utils_1.log)("stdin message:", message);
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
        (0, utils_1.log)("IO message:", message);
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
        (0, utils_1.log)("ZMQKernel: destroy:", this);
        this.shutdown();
        this._kill();
        fs_1.default.unlinkSync(this.connectionFile);
        this.shellSocket.close();
        this.ioSocket.close();
        this.stdinSocket.close();
        super.destroy();
    }
}
exports.default = ZMQKernel;
function _isValidMessage(message) {
    if (!message) {
        (0, utils_1.log)("Invalid message: null");
        return false;
    }
    if (!message.content) {
        (0, utils_1.log)("Invalid message: Missing content");
        return false;
    }
    if (message.content.execution_state === "starting") {
      // Kernels send a starting status message with an empty parent_header
        (0, utils_1.log)("Dropped starting status IO message");
        return false;
    }
    if (!message.parent_header) {
        (0, utils_1.log)("Invalid message: Missing parent_header");
        return false;
    }
    if (!message.parent_header.msg_id) {
        (0, utils_1.log)("Invalid message: Missing parent_header.msg_id");
        return false;
    }
    if (!message.parent_header.msg_type) {
        (0, utils_1.log)("Invalid message: Missing parent_header.msg_type");
        return false;
    }
    if (!message.header) {
        (0, utils_1.log)("Invalid message: Missing header");
        return false;
    }
    if (!message.header.msg_id) {
        (0, utils_1.log)("Invalid message: Missing header.msg_id");
        return false;
    }
    if (!message.header.msg_type) {
        (0, utils_1.log)("Invalid message: Missing header.msg_type");
        return false;
    }
    return true;
}
function _getUsername() {
    return (process.env.LOGNAME ||
        process.env.USER ||
        process.env.LNAME ||
        process.env.USERNAME);
}
function _createMessage(msgType, msgId = (0, uuid_1.v4)()) {
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
