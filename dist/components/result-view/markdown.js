/**
 * Adapted from
 * https://github.com/nteract/nteract/blob/master/packages/outputs/src/components/media/markdown.tsx
 * Copyright (c) 2016 - present, nteract contributors All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @NOTE: This `Markdown` component could be used exactly same as the original `Media.Markdown` component of @nteract/outputs,
 *        except that this file adds a class name to it for further stylings in styles/hydrogen.less.
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.Markdown = void 0;
const markdown_1 = __importDefault(require("@nteract/markdown"));
const react_1 = __importDefault(require("react"));
class Markdown extends react_1.default.PureComponent {
  render() {
    return react_1.default.createElement(
      "div",
      { className: "markdown" },
      react_1.default.createElement(markdown_1.default, {
        source: this.props.data,
      })
    );
  }
}
exports.Markdown = Markdown;
Markdown.defaultProps = {
  /** Markdown text. */
  data: "",
  /**
   * Media type. Defaults to `text/markdown`. For more on media types, see:
   * https://www.w3.org/TR/CSS21/media.html%23media-types.
   */
  mediaType: "text/markdown",
};
exports.default = Markdown;
