var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const react_1 = __importStar(require("react"));
const mobx_react_1 = require("mobx-react");
const display_1 = __importDefault(require("./display"));
function RangeSlider({ outputStore }) {
  const {
    index: storeIndex,
    setIndex: setStoreIndex,
    incrementIndex,
    decrementIndex,
    outputs,
  } = outputStore;
  const sliderRef = (0, react_1.useRef)();
  (0, react_1.useEffect)(() => {
    const disposer = new atom_1.CompositeDisposable();
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
  return react_1.default.createElement(
    "div",
    { className: "slider", ref: sliderRef },
    react_1.default.createElement(
      "div",
      { className: "current-output" },
      react_1.default.createElement("span", {
        className: "btn btn-xs icon icon-chevron-left",
        onClick: (e) => decrementIndex(),
      }),
      react_1.default.createElement(
        "span",
        null,
        storeIndex + 1,
        "/",
        outputs.length
      ),
      react_1.default.createElement("span", {
        className: "btn btn-xs icon icon-chevron-right",
        onClick: (e) => incrementIndex(),
      })
    ),
    react_1.default.createElement("input", {
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
const History = (0, mobx_react_1.observer)(({ store }) => {
  const output = store.outputs[store.index];
  return output
    ? react_1.default.createElement(
        "div",
        { className: "history output-area" },
        react_1.default.createElement(RangeSlider, { outputStore: store }),
        react_1.default.createElement(
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
          react_1.default.createElement(display_1.default, { output: output })
        )
      )
    : null;
});
exports.default = History;
