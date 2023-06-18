const { CompositeDisposable } = require("atom");
const React = require("react");
const { reactFactory, WATCHES_URI } = require("../utils");
const Watches = require("../components/watch-sidebar");

class WatchesPane {
    constructor(store) {
        this.element = document.createElement("div");
        this.disposer = new CompositeDisposable();
        this.getTitle = () => "Hydrogen Watch";
        this.getURI = () => WATCHES_URI;
        this.getDefaultLocation = () => "right";
        this.getAllowedLocations = () => ["left", "right"];
        this.element.classList.add("hydrogen");

        reactFactory(React.createElement(Watches, { store: store }), this.element, null, this.disposer);
    }
    destroy() {
        this.disposer.dispose();
        this.element.remove();
    }
}

module.exports = WatchesPane;
