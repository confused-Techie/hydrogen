const { action, computed, observable } = require("mobx");
const {
  escapeCarriageReturn,
  escapeCarriageReturnSafe
} = require("escape-carriage");
const { isTextOutputOnly } = require("../components/result-view/display");

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
      previous.text = escapeCarriageReturnSafe(
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

function isSingleLine(text, availableSpace) {
  // If it turns out escapeCarriageReturn is a bottleneck, we should remove it.
  return (
    (!text || !text.includes("\n") || text.indexOf("\n") === text.length - 1) &&
    availableSpace > escapeCarriageReturn(text).length
  );
}

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
        return isTextOutputOnly(bundle)
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

module.exports = {
  reduceOutputs,
  isSingleLine,
  OutputStore,
};
