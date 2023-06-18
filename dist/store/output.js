var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSingleLine = exports.reduceOutputs = void 0;
const mobx_1 = require("mobx");
const escape_carriage_1 = require("escape-carriage");
const display_1 = require("../components/result-view/display");
const outputTypes = ["execute_result", "display_data", "stream", "error"];

/**
 * https://github.com/nteract/hydrogen/issues/466#issuecomment-274822937 An
 * output can be a stream of data that does not arrive at a single time. This
 * function handles the different types of outputs and accumulates the data into
 * a reduced output.
 *
 * @param {Object[]} outputs - Kernel output messages
 * @param {Object} output - Outputted to be reduced into list of outputs
 * @returns {Object[]} Updated-outputs - Outputs + Output
 */
function reduceOutputs(outputs, output) {
  const last = outputs.length - 1;
  if (
    outputs.length > 0 &&
    output.output_type === "stream" &&
    outputs[last].output_type === "stream"
  ) {
    function appendText(previous, next) {
      previous.text = (0, escape_carriage_1.escapeCarriageReturnSafe)(
        previous.text + next.text
      );
    }
    if (outputs[last].name === output.name) {
      appendText(outputs[last], output);
      return outputs;
    }
    if (outputs.length > 1 && outputs[last - 1].name === output.name) {
      appendText(outputs[last - 1], output);
      return outputs;
    }
  }
  outputs.push(output);
  return outputs;
}
exports.reduceOutputs = reduceOutputs;
function isSingleLine(text, availableSpace) {
  // If it turns out escapeCarriageReturn is a bottleneck, we should remove it.
  return (
    (!text || !text.includes("\n") || text.indexOf("\n") === text.length - 1) &&
    availableSpace > (0, escape_carriage_1.escapeCarriageReturn)(text).length
  );
}
exports.isSingleLine = isSingleLine;
class OutputStore {
  constructor() {
    this.outputs = [];
    this.status = "running";
    this.executionCount = null;
    this.index = -1;
    this.position = {
      lineHeight: 0,
      lineLength: 0,
      editorWidth: 0,
      charWidth: 0,
    };
    this.setIndex = (index) => {
      if (index < 0) {
        this.index = 0;
      } else if (index < this.outputs.length) {
        this.index = index;
      } else {
        this.index = this.outputs.length - 1;
      }
    };
    this.incrementIndex = () => {
      this.index =
        this.index < this.outputs.length - 1
          ? this.index + 1
          : this.outputs.length - 1;
    };
    this.decrementIndex = () => {
      this.index = this.index > 0 ? this.index - 1 : 0;
    };
    this.clear = () => {
      this.outputs = [];
      this.index = -1;
    };
  }
  get isPlain() {
    if (this.outputs.length !== 1) {
      return false;
    }
    const availableSpace = Math.floor(
      (this.position.editorWidth - this.position.lineLength) /
        this.position.charWidth
    );
    if (availableSpace <= 0) {
      return false;
    }
    const output = this.outputs[0];
    switch (output.output_type) {
      case "execute_result":
      case "display_data": {
        const bundle = output.data;
        return (0, display_1.isTextOutputOnly)(bundle)
          ? isSingleLine(bundle["text/plain"], availableSpace)
          : false;
      }
      case "stream": {
        return isSingleLine(output.text, availableSpace);
      }
      default: {
        return false;
      }
    }
  }
  appendOutput(message) {
    if (message.stream === "execution_count") {
      this.executionCount = message.data;
    } else if (message.stream === "status") {
      this.status = message.data;
    } else if (outputTypes.includes(message.output_type)) {
      reduceOutputs(this.outputs, message);
      this.setIndex(this.outputs.length - 1);
    }
  }
  updatePosition(position) {
    Object.assign(this.position, position);
  }
}
__decorate(
  [mobx_1.observable, __metadata("design:type", Array)],
  OutputStore.prototype,
  "outputs",
  void 0
);
__decorate(
  [mobx_1.observable, __metadata("design:type", String)],
  OutputStore.prototype,
  "status",
  void 0
);
__decorate(
  [mobx_1.observable, __metadata("design:type", Number)],
  OutputStore.prototype,
  "executionCount",
  void 0
);
__decorate(
  [mobx_1.observable, __metadata("design:type", Number)],
  OutputStore.prototype,
  "index",
  void 0
);
__decorate(
  [mobx_1.observable, __metadata("design:type", Object)],
  OutputStore.prototype,
  "position",
  void 0
);
__decorate(
  [
    mobx_1.computed,
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", []),
  ],
  OutputStore.prototype,
  "isPlain",
  null
);
__decorate(
  [
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0),
  ],
  OutputStore.prototype,
  "appendOutput",
  null
);
__decorate(
  [
    mobx_1.action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0),
  ],
  OutputStore.prototype,
  "updatePosition",
  null
);
__decorate(
  [mobx_1.action, __metadata("design:type", Object)],
  OutputStore.prototype,
  "setIndex",
  void 0
);
__decorate(
  [mobx_1.action, __metadata("design:type", Object)],
  OutputStore.prototype,
  "incrementIndex",
  void 0
);
__decorate(
  [mobx_1.action, __metadata("design:type", Object)],
  OutputStore.prototype,
  "decrementIndex",
  void 0
);
__decorate(
  [mobx_1.action, __metadata("design:type", Object)],
  OutputStore.prototype,
  "clear",
  void 0
);
exports.default = OutputStore;
