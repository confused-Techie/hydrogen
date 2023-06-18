const { CompositeDisposable } = require("atom");
const React = require("react");
const { reactFactory, INSPECTOR_URI } = require("../utils");
const Inspector = require("../components/inspector.js");

class InspectorPane {
    constructor(store) {
        this.element = document.createElement("div");
        this.disposer = new CompositeDisposable();
        this.getTitle = () => "Hydrogen Inspector";
        this.getURI = () => INSPECTOR_URI;
        this.getDefaultLocation = () => "bottom";
        this.getAllowedLocations = () => ["bottom", "left", "right"];
        this.element.classList.add("hydrogen", "inspector");
        reactFactory(
          React.createElement(Inspector, { store: store }),
          this.element,
          null,
          this.disposer
        );
    }
    destroy() {
        this.disposer.dispose();
        this.element.remove();
    }
}

module.exports = InspectorPane;
