var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleOutputMode = exports.toggleInspector = void 0;
const utils_1 = require("./utils");
const code_manager_1 = require("./code-manager");
const output_area_1 = __importDefault(require("./panes/output-area"));
function toggleInspector(store) {
    const { editor, kernel } = store;
    if (!editor || !kernel) {
        atom.notifications.addInfo("No kernel running!");
        return;
    }
    const [code, cursorPos] = (0, code_manager_1.getCodeToInspect)(editor);
    if (!code || cursorPos === 0) {
        atom.notifications.addInfo("No code to introspect!");
        return;
    }
    kernel.inspect(code, cursorPos, (result) => {
        (0, utils_1.log)("Inspector: Result:", result);
        if (!result.found) {
            atom.workspace.hide(utils_1.INSPECTOR_URI);
            atom.notifications.addInfo("No introspection available!");
            return;
        }
        kernel.setInspectorResult(result.data, editor);
    });
}
exports.toggleInspector = toggleInspector;
function toggleOutputMode() {
  // There should never be more than one instance of OutputArea
    const outputArea = atom.workspace
        .getPaneItems()
        .find((paneItem) => paneItem instanceof output_area_1.default);
    if (outputArea) {
        return outputArea.destroy();
    }
    else {
        (0, utils_1.openOrShowDock)(utils_1.OUTPUT_AREA_URI);
    }
}
exports.toggleOutputMode = toggleOutputMode;
