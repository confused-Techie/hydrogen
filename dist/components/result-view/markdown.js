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
 const MarkdownComponent = require("@nteract/markdown");
 const React = require("react");

class Markdown extends React.PureComponent {

  static defaultProps = {
    /** Markdown text. */
    data: "",
    /**
     * Media type. Defaults to `text/markdown`. For more on media types, see:
     * https://www.w3.org/TR/CSS21/media.html%23media-types.
     */
    mediaType: "text/markdown"
  };

  render() {
    return React.createElement(
      "div",
      { className: "markdown" },
      React.createElement(MarkdownComponent, {
        source: this.props.data,
      })
    );
  }

}

module.exports = Markdown;
