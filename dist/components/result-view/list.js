const React = require("react");
const { observer } = require("mobx-react");
const Display = require("./display");

class ScrollList extends React.Component {
  scrollToBottom() {
    if (!this.el) {
      return;
    }
    const scrollHeight = this.el.scrollHeight;
    const height = this.el.clientHeight;
    const maxScrollTop = scrollHeight - height;
    this.el.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }
  componentDidUpdate() {
    this.scrollToBottom();
  }
  componentDidMount() {
    this.scrollToBottom();
  }
  render() {
    if (this.props.outputs.length === 0) {
      return null;
    }
    return React.createElement(
      "div",
      {
        className: "scroll-list multiline-container native-key-bindings",
        tabIndex: -1,
        style: {
          fontSize: atom.config.get(`Hydrogen.outputAreaFontSize`) || "inherit",
        },
        ref: (el) => {
          this.el = el;
        },
        "hydrogen-wrapoutput": atom.config
          .get(`Hydrogen.wrapOutput`)
          .toString(),
      },
      this.props.outputs.map((output, index) =>
        React.createElement(
          "div",
          { className: "scroll-list-item" },
          React.createElement(Display, {
            output: output,
            key: index,
          })
        )
      )
    );
  }
}

module.exports = ScrollList;
