const React = require("react");
const { CompositeDisposable } = require("atom");
const History = require("../result-view/history.js");

class Watch extends React.Component {
  constructor() {
    super(...arguments);
    this.subscriptions = new CompositeDisposable();
  }
  componentDidMount() {
    if (!this.container) {
      return;
    }
    const container = this.container;
    container.insertBefore(
      this.props.store.editor.element,
      container.firstChild
    );
  }
  componentWillUnmount() {
    this.subscriptions.dispose();
  }
  render() {
    return React.createElement(
      "div",
      {
        className: "hydrogen watch-view",
        ref: (c) => {
          this.container = c;
        },
      },
      React.createElement(History, {
        store: this.props.store.outputStore,
      })
    );
  }
}

module.exports = Watch;
