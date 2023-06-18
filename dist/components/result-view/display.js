var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTextOutputOnly = exports.supportedMediaTypes = void 0;
const react_1 = __importDefault(require("react"));
const mobx_1 = require("mobx");
const mobx_react_1 = require("mobx-react");
const outputs_1 = require("@nteract/outputs");
const plotly_1 = __importDefault(require("./plotly"));
const transform_vega_1 = require("@nteract/transform-vega");
const markdown_1 = __importDefault(require("./markdown"));
// All supported media types for output go here
exports.supportedMediaTypes = react_1.default.createElement(
  outputs_1.RichMedia,
  null,
  react_1.default.createElement(transform_vega_1.Vega5, null),
  react_1.default.createElement(transform_vega_1.Vega4, null),
  react_1.default.createElement(transform_vega_1.Vega3, null),
  react_1.default.createElement(transform_vega_1.Vega2, null),
  react_1.default.createElement(plotly_1.default, null),
  react_1.default.createElement(transform_vega_1.VegaLite4, null),
  react_1.default.createElement(transform_vega_1.VegaLite3, null),
  react_1.default.createElement(transform_vega_1.VegaLite2, null),
  react_1.default.createElement(transform_vega_1.VegaLite1, null),
  react_1.default.createElement(outputs_1.Media.Json, null),
  react_1.default.createElement(outputs_1.Media.JavaScript, null),
  react_1.default.createElement(outputs_1.Media.HTML, null),
  react_1.default.createElement(markdown_1.default, null),
  react_1.default.createElement(outputs_1.Media.LaTeX, null),
  react_1.default.createElement(outputs_1.Media.SVG, null),
  react_1.default.createElement(outputs_1.Media.Image, {
    mediaType: "image/gif",
  }),
  react_1.default.createElement(outputs_1.Media.Image, {
    mediaType: "image/jpeg",
  }),
  react_1.default.createElement(outputs_1.Media.Image, {
    mediaType: "image/png",
  }),
  react_1.default.createElement(outputs_1.Media.Plain, null)
);
function isTextOutputOnly(data) {
  const supported = react_1.default.Children.map(
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
exports.isTextOutputOnly = isTextOutputOnly;
let Display = class Display extends react_1.default.Component {
  render() {
    return react_1.default.createElement(
      outputs_1.Output,
      { output: (0, mobx_1.toJS)(this.props.output) },
      react_1.default.createElement(
        outputs_1.ExecuteResult,
        { expanded: true },
        exports.supportedMediaTypes
      ),
      react_1.default.createElement(
        outputs_1.DisplayData,
        { expanded: true },
        exports.supportedMediaTypes
      ),
      react_1.default.createElement(outputs_1.StreamText, { expanded: true }),
      react_1.default.createElement(outputs_1.KernelOutputError, {
        expanded: true,
      })
    );
  }
};
Display = __decorate([mobx_react_1.observer], Display);
exports.default = Display;
