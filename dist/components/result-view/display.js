const React = require("react");
const { toJS } = require("mobx");
const { observer } = require("mobx-react");
const {
  DisplayData,
  ExecuteResult,
  StreamText,
  KernelOutputError,
  Output,
  Media,
  RichMedia
} = require("@nteract/outputs");
const Plotly = require("./plotly");
const {
  VegaLite1,
  VegaLite2,
  VegaLite3,
  VegaLite4,
  Vega2,
  Vega3,
  Vega4,
  Vega5
} = require("@nteract/transform-vega");
const Markdown = require("./markdown");

// All supported media types for output go here
let supportedMediaTypes = React.createElement(
  RichMedia,
  null,
  React.createElement(Vega5, null),
  React.createElement(Vega4, null),
  React.createElement(Vega3, null),
  React.createElement(Vega2, null),
  React.createElement(Plotly, null),
  React.createElement(VegaLite4, null),
  React.createElement(VegaLite3, null),
  React.createElement(VegaLite2, null),
  React.createElement(VegaLite1, null),
  React.createElement(Media.Json, null),
  React.createElement(Media.JavaScript, null),
  React.createElement(Media.HTML, null),
  React.createElement(Markdown, null),
  React.createElement(Media.LaTeX, null),
  React.createElement(Media.SVG, null),
  React.createElement(Media.Image, {
    mediaType: "image/gif",
  }),
  React.createElement(Media.Image, {
    mediaType: "image/jpeg",
  }),
  React.createElement(Media.Image, {
    mediaType: "image/png",
  }),
  React.createElement(Media.Plain, null)
);

function isTextOutputOnly(data) {
  const supported = React.Children.map(
    exports.supportedMediaTypes.props.children,
    (mediaComponent) => mediaComponent.props.mediaType
  );
  const bundleMediaTypes = [...Object.keys(data)].filter((mediaType) =>
    supported.includes(mediaType)
  );
  return bundleMediaTypes.length === 1 && bundleMediaTypes[0] === "text/plain"
    ? true
    : false;
}

class Display extends React.Component {
  render() {
    return React.createElement(
      Output,
      { output: toJS(this.props.output) },
      React.createElement(
        ExecuteResult,
        { expanded: true },
        exports.supportedMediaTypes
      ),
      React.createElement(
        DisplayData,
        { expanded: true },
        exports.supportedMediaTypes
      ),
      React.createElement(StreamText, { expanded: true }),
      React.createElement(KernelOutputError, {
        expanded: true,
      })
    );
  }
}

module.exports = {
  Display,
  isTextOutputOnly,
  supportedMediaTypes,
};
