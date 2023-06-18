const React = require("react");
const { observer } = require("mobx-react");
const { RichMedia, Media } = require("@nteract/outputs");
const { INSPECTOR_URI } = require("../utils");
const Markdown = require("./result-view/markdown");

function hide() {
  atom.workspace.hide(INSPECTOR_URI);
  return null;
}
const Inspector = observer(({ store: { kernel } }) => {
  if (!kernel) {
    return hide();
  }
  const bundle = kernel.inspector.bundle;
  if (
    !bundle["text/html"] &&
    !bundle["text/markdown"] &&
    !bundle["text/plain"]
  ) {
    return hide();
  }
  return React.createElement(
    "div",
    {
      className: "native-key-bindings",
      tabIndex: -1,
      style: {
        fontSize: atom.config.get(`Hydrogen.outputAreaFontSize`) || "inherit",
      },
    },
    React.createElement(
      RichMedia,
      { data: bundle },
      React.createElement(Media.HTML, null),
      React.createElement(Markdown, null),
      React.createElement(Media.Plain, null)
    )
  );
});

module.exports = Inspector;
