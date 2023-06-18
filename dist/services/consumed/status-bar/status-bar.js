var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBarConsumer = void 0;
const react_1 = __importDefault(require("react"));
const atom_1 = require("atom");
const status_bar_component_1 = __importDefault(require("./status-bar-component"));
const signal_list_view_1 = __importDefault(require("./signal-list-view"));
const utils_1 = require("../../../utils");
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
        (0, utils_1.reactFactory)(react_1.default.createElement(status_bar_component_1.default, { store: store, onClick: onClick }), statusBarElement);
        const disposable = new atom_1.Disposable(() => statusBarTile.destroy());
        store.subscriptions.add(disposable);
        return disposable;
    }
    showKernelCommands(store, handleKernelCommand) {
        let signalListView = this.signalListView;
        if (!signalListView) {
            signalListView = new signal_list_view_1.default(store, handleKernelCommand);
            this.signalListView = signalListView;
        }
        else {
            signalListView.store = store;
        }
        signalListView.toggle();
    }
}
exports.StatusBarConsumer = StatusBarConsumer;
const statusBarConsumer = new StatusBarConsumer();
exports.default = statusBarConsumer;
