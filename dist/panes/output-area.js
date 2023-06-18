const { CompositeDisposable, Disposable } = require("atom");
const React = require("react");
const { reactFactory, OUTPUT_AREA_URI } = require("../utils");
const OutputArea = require("../components/output-area.js");

class OutputPane {
    constructor(store) {
        this.element = document.createElement("div");
        this.disposer = new CompositeDisposable();
        this.getTitle = () => "Hydrogen Output Area";
        this.getURI = () => OUTPUT_AREA_URI;
        this.getDefaultLocation = () => "right";
        this.getAllowedLocations = () => ["left", "right", "bottom"];
        this.element.classList.add("hydrogen");
        this.disposer.add(new Disposable(() => {
            if (store.kernel) {
                store.kernel.outputStore.clear();
            }
        }));
        reactFactory(React.createElement(OutputArea, { store: store }), this.element, null, this.disposer);
    }
    destroy() {
        this.disposer.dispose();
        // When a user manually clicks the close icon, the pane holding the OutputArea
        // is destroyed along with the OutputArea item. We mimic this here so that we can call
        //  outputArea.destroy() and fully clean up the OutputArea without user clicking
        const pane = atom.workspace.paneForURI(OUTPUT_AREA_URI);
        if (!pane) {
            return;
        }
        pane.destroyItem(this);
    }
}

module.exports = OutputPane;
