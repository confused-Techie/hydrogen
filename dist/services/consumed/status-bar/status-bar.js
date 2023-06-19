const React = require("react");
const { Disposable } = require("atom");
const { StatusBar: AtomStatusBar } = require("atom/status-bar");
const StatusBar = require("./status-bar-component.js");
const SignalListView = require("./signal-list-view.js");
const { reactFactory } = require("../../../utils.js");

class StatusBarConsumer {

  addStatusBar(store, statusBar, handleKernelCommand) {
    const statusBarElement = document.createElement("div");
    statusBarElement.classList.add("inline-block", "hydrogen");
    const statusBarTile = statusBar.addLeftTile({
      item: statusBarElement,
      priority: 100,
    });
    const onClick = (store) => {
      this.showKernelCommands(store, handleKernelCommand);
    };
    reactFactory(
      React.createElement(StatusBar, {
        store: store,
        onClick: onClick,
      }),
      statusBarElement
    );
    const disposable = new Disposable(() => statusBarTile.destroy());
    store.subscriptions.add(disposable);
    return disposable;
  }

  showKernelCommands(store, handleKernelCommand) {
    let signalListView = this.signalListView;
    if (!signalListView) {
      signalListView = new SignalListView(
        store,
        handleKernelCommand
      );
      this.signalListView = signalListView;
    } else {
      signalListView.store = store;
    }
    signalListView.toggle();
  }
}

module.exports = StatusBarConsumer;
