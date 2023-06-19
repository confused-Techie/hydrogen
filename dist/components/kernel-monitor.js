const React = require("react");
const ReactTable = require("react-table");
const { ReactTableDefaults } = require("react-table");
const { observer } = require("mobx-react");
const tildify = require("tildify");
const Kernel = require("../kernel.js");
const { isUnsavedFilePath } = require("../utils.js");

const showKernelSpec = (kernelSpec) => {
  atom.notifications.addInfo("Hydrogen: Kernel Spec", {
    detail: JSON.stringify(kernelSpec, null, 2),
    dismissable: true,
  });
};

const interrupt = (kernel) => {
  kernel.interrupt();
};

const shutdown = (kernel) => {
  kernel.shutdown();
  kernel.destroy();
};

const restart = (kernel) => {
  kernel.restart(undefined);
};

// @TODO If our store holds editor IDs instead of file paths, these messy matching stuff below would
//       easily be replaced by simpler code. See also components/kernel-monitor.js for this problem.
const openUnsavedEditor = (filePath) => {
  const editor = atom.workspace.getTextEditors().find((editor) => {
    const match = filePath.match(/\d+/);
    if (!match) {
      return false;
    }
    return String(editor.id) === match[0];
  });
  // This path won't happen after https://github.com/nteract/hydrogen/pull/1662 since every deleted
  // editors would be deleted from `store.kernelMapping`. Just kept here for safety.
  if (!editor) {
    return;
  }
  atom.workspace.open(editor, {
    searchAllPanes: true,
  });
};
const openEditor = (filePath) => {
  atom.workspace
    .open(filePath, {
      searchAllPanes: true,
    })
    .catch((err) => {
      atom.notifications.addError("Hydrogen", {
        description: err,
      });
    });
};
const kernelInfoCell = (props) => {
  const { displayName, kernelSpec } = props.value;
  return React.createElement(
    "a",
    {
      className: "icon",
      onClick: showKernelSpec.bind(this, kernelSpec),
      title: "Show kernel spec",
      key: `${displayName}kernelInfo`,
    },
    displayName
  );
};
// Set default properties of React-Table
Object.assign(ReactTableDefaults, {
  className: "kernel-monitor",
  showPagination: false,
});
Object.assign(ReactTableDefaults.column, {
  className: "table-cell",
  headerClassName: "table-header",
  style: {
    textAlign: "center",
  },
});
const KernelMonitor = observer(({ store }) => {
  if (store.runningKernels.length === 0) {
    return React.createElement(
      "ul",
      { className: "background-message centered" },
      React.createElement("li", null, "No running kernels")
    );
  }
  const data = store.runningKernels.map((kernel, key) => {
    return {
      gateway: kernel.transport.gatewayName || "Local",
      kernelInfo: {
        displayName: kernel.displayName,
        kernelSpec: kernel.kernelSpec,
      },
      status: kernel.executionState,
      executionCount: kernel.executionCount,
      lastExecutionTime: kernel.lastExecutionTime,
      kernelKey: {
        kernel,
        key: String(key),
      },
      files: store.getFilesForKernel(kernel),
    };
  });
  const columns = [
    {
      Header: "Gateway",
      accessor: "gateway",
      maxWidth: 125,
    },
    {
      Header: "Kernel",
      accessor: "kernelInfo",
      Cell: kernelInfoCell,
      maxWidth: 125,
    },
    {
      Header: "Status",
      accessor: "status",
      maxWidth: 100,
    },
    {
      Header: "Count",
      accessor: "executionCount",
      maxWidth: 50,
      style: {
        textAlign: "right",
      },
    },
    {
      Header: "Last Exec Time",
      accessor: "lastExecutionTime",
      maxWidth: 100,
      style: {
        textAlign: "right",
      },
    },
    {
      Header: "Managements",
      accessor: "kernelKey",
      Cell: (props) => {
        const { kernel, key } = props.value;
        return [
          React.createElement("a", {
            className: "icon icon-zap",
            onClick: interrupt.bind(this, kernel),
            title: "Interrupt kernel",
            key: `${key}interrupt`,
          }),
          React.createElement("a", {
            className: "icon icon-sync",
            onClick: restart.bind(this, kernel),
            title: "Restart kernel",
            key: `${key}restart`,
          }),
          React.createElement("a", {
            className: "icon icon-trashcan",
            onClick: shutdown.bind(this, kernel),
            title: "Shutdown kernel",
            key: `${key}shutdown`,
          }),
        ];
      },
      width: 150,
    },
    {
      Header: "Files",
      accessor: "files",
      Cell: (props) => {
        return props.value.map((filePath, index) => {
          const separator = index === 0 ? "" : "  |  ";
          const body = isUnsavedFilePath(filePath)
            ? React.createElement(
                "a",
                {
                  onClick: openUnsavedEditor.bind(this, filePath),
                  title: "Jump to file",
                  key: `${filePath}jump`,
                },
                filePath
              )
            : React.createElement(
                "a",
                {
                  onClick: openEditor.bind(this, filePath),
                  title: "Jump to file",
                  key: `${filePath}jump`,
                },
                tildify(filePath)
              );
          return React.createElement(
            "div",
            {
              style: {
                display: "-webkit-inline-box",
              },
              key: filePath,
            },
            separator,
            body
          );
        });
      },
      style: {
        textAlign: "center",
        whiteSpace: "pre-wrap",
      },
    },
  ];
  return React.createElement(ReactTable, {
    data: data,
    columns: columns,
  });
});

KernelMonitor.displayName = "KernelMonitor";
module.exports = KernelMonitor;
