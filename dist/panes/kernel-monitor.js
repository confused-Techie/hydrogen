const { CompositeDisposable } = require("atom");
const React = require("react");
const { reactFactory, KERNEL_MONITOR_URI } = require("../utils");
const KernelMonitor = require("../components/kernel-monitor");

class KernelMonitorPane {
    constructor(store) {
        this.element = document.createElement("div");
        this.disposer = new CompositeDisposable();
        this.getTitle = () => "Hydrogen Kernel Monitor";
        this.getURI = () => KERNEL_MONITOR_URI;
        this.getDefaultLocation = () => "bottom";
        this.getAllowedLocations = () => ["bottom", "left", "right"];
        this.element.classList.add("hydrogen");
        reactFactory(React.createElement(KernelMonitor, { store: store }), this.element, null, this.disposer);
    }
    destroy() {
        this.disposer.dispose();
        this.element.remove();
    }
}

module.exports = KernelMonitorPane;
