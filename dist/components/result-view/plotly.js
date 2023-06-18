/**
 * Adapted from
 * https://github.com/nteract/nteract/blob/master/packages/transform-plotly/src/index.tsx
 * Copyright (c) 2016 - present, nteract contributors All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @NOTE: This `PlotlyTransform` component could be used exactly same as the original `PlotlyTransform` component of @nteract/transform-plotly,
 *        except that this file adds the ability to download a plot from an electron context.
 */

const cloneDeep = require("lodash/cloneDeep");
const React = require("react");

class PlotlyTransform extends React.Component {
  constructor(props) {
    super(props);
    this.plotDivRef = (plotDiv) => {
      this.plotDiv = plotDiv;
    };
    this.getFigure = () => {
      const figure = this.props.data;
      if (typeof figure === "string") {
        return JSON.parse(figure);
      }

      // The Plotly API *mutates* the figure to include a UID, which means
      // they won't take our frozen objects
      if (Object.isFrozen(figure)) {
        return cloneDeep(figure);
      }
      const { data = {}, layout = {} } = figure;
      return {
        data,
        layout,
      };
    };
    this.downloadImage = (gd) => {
      this.Plotly.toImage(gd).then(function (dataUrl) {
        const electron = require("electron");
        electron.remote.getCurrentWebContents().downloadURL(dataUrl);
      });
    };
    this.downloadImage = this.downloadImage.bind(this);
  }
  componentDidMount() {
    // Handle case of either string to be `JSON.parse`d or pure object
    const figure = this.getFigure();
    this.Plotly = require("@nteract/plotly");
    this.Plotly.newPlot(this.plotDiv, figure.data, figure.layout, {
      modeBarButtonsToRemove: ["toImage"],
      modeBarButtonsToAdd: [
        {
          name: "Download plot as a png",
          icon: this.Plotly.Icons.camera,
          click: this.downloadImage,
        },
      ],
    });
  }
  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data;
  }
  componentDidUpdate() {
    const figure = this.getFigure();
    if (!this.plotDiv) {
      return;
    }
    const plotDiv = this.plotDiv;
    plotDiv.data = figure.data;
    plotDiv.layout = figure.layout;
    this.Plotly.redraw(plotDiv);
  }
  render() {
    const { layout } = this.getFigure();
    const style = {};
    if (layout && layout.height && !layout.autosize) {
      style.height = layout.height;
    }
    return React.createElement("div", { ref: this.plotDivRef, style: style });
  }
}

PlotlyTransform.defaultProps = {
  data: "",
  mediaType: "application/vnd.plotly.v1+json",
};

module.exports = PlotlyTransform;
