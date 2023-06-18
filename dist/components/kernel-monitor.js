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
const react_1 = __importDefault(require("react"));
const react_table_1 = __importStar(require("react-table"));
const mobx_react_1 = require("mobx-react");
const tildify_1 = __importDefault(require("tildify"));
const utils_1 = require("../utils");
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
  return react_1.default.createElement(
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
Object.assign(react_table_1.ReactTableDefaults, {
  className: "kernel-monitor",
  showPagination: false,
});
Object.assign(react_table_1.ReactTableDefaults.column, {
  className: "table-cell",
  headerClassName: "table-header",
  style: {
    textAlign: "center",
  },
});
const KernelMonitor = (0, mobx_react_1.observer)(({ store }) => {
  if (store.runningKernels.length === 0) {
    return react_1.default.createElement(
      "ul",
      { className: "background-message centered" },
      react_1.default.createElement("li", null, "No running kernels")
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
          react_1.default.createElement("a", {
            className: "icon icon-zap",
            onClick: interrupt.bind(this, kernel),
            title: "Interrupt kernel",
            key: `${key}interrupt`,
          }),
          react_1.default.createElement("a", {
            className: "icon icon-sync",
            onClick: restart.bind(this, kernel),
            title: "Restart kernel",
            key: `${key}restart`,
          }),
          react_1.default.createElement("a", {
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
          const body = (0, utils_1.isUnsavedFilePath)(filePath)
            ? react_1.default.createElement(
                "a",
                {
                  onClick: openUnsavedEditor.bind(this, filePath),
                  title: "Jump to file",
                  key: `${filePath}jump`,
                },
                filePath
              )
            : react_1.default.createElement(
                "a",
                {
                  onClick: openEditor.bind(this, filePath),
                  title: "Jump to file",
                  key: `${filePath}jump`,
                },
                (0, tildify_1.default)(filePath)
              );
          return react_1.default.createElement(
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
  return react_1.default.createElement(react_table_1.default, {
    data: data,
    columns: columns,
  });
});
KernelMonitor.displayName = "KernelMonitor";
exports.default = KernelMonitor;
