const { CompositeDisposable } = require("atom");
const React = require("react");
const { useEffect, useRef } = require("react");
const { observer } = require("mobx-react");
const Display = require("./display.js");

function RangeSlider({ outputStore }) {
  const {
    index: storeIndex,
    setIndex: setStoreIndex,
    incrementIndex,
    decrementIndex,
    outputs,
  } = outputStore;
  const sliderRef = useRef();
  useEffect(() => {
    const disposer = new CompositeDisposable();
    disposer.add(
      atom.commands.add(sliderRef.current, "core:move-left", () =>
        decrementIndex()
      ),
      atom.commands.add(sliderRef.current, "core:move-right", () =>
        incrementIndex()
      )
    );
    return () => disposer.dispose();
  }, []);
  function onIndexChange(e) {
    const newIndex = Number(e.target.value);
    setStoreIndex(newIndex);
  }
  return React.createElement(
    "div",
    { className: "slider", ref: sliderRef },
    React.createElement(
      "div",
      { className: "current-output" },
      React.createElement("span", {
        className: "btn btn-xs icon icon-chevron-left",
        onClick: (e) => decrementIndex(),
      }),
      React.createElement(
        "span",
        null,
        storeIndex + 1,
        "/",
        outputs.length
      ),
      React.createElement("span", {
        className: "btn btn-xs icon icon-chevron-right",
        onClick: (e) => incrementIndex(),
      })
    ),
    React.createElement("input", {
      className: "input-range",
      max: outputs.length - 1,
      min: "0",
      id: "range-input",
      onChange: onIndexChange,
      type: "range",
      value: storeIndex,
    })
  );
}
const History = observer(({ store }) => {
  const output = store.outputs[store.index];
  return output
    ? React.createElement(
        "div",
        { className: "history output-area" },
        React.createElement(RangeSlider, { outputStore: store }),
        React.createElement(
          "div",
          {
            className: "multiline-container native-key-bindings",
            tabIndex: -1,
            style: {
              fontSize:
                atom.config.get(`Hydrogen.outputAreaFontSize`) || "inherit",
            },
            "hydrogen-wrapoutput": atom.config
              .get(`Hydrogen.wrapOutput`)
              .toString(),
          },
          React.createElement(Display, { output: output })
        )
      )
    : null;
});

module.exports = History;
