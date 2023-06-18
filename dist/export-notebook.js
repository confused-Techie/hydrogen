var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportNotebook = void 0;
const path = __importStar(require("path"));
const fs_1 = require("fs");
const { writeFile } = fs_1.promises;
const electron_1 = require("electron");
const { dialog } = electron_1.remote;
const commutable_1 = require("@nteract/commutable");
const store_1 = __importDefault(require("./store"));
async function exportNotebook() {
    const editor = atom.workspace.getActiveTextEditor();
    const editorPath = editor.getPath();
    const directory = path.dirname(editorPath);
    const rawFileName = path.basename(editorPath, path.extname(editorPath));
    const noteBookPath = path.join(directory, `${rawFileName}.ipynb`);
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: editor.getTitle(),
        defaultPath: noteBookPath,
    });
    if (!canceled) {
        await saveNoteBook(filePath);
    }
}
exports.exportNotebook = exportNotebook;
async function saveNoteBook(filePath) {
    if (filePath.length === 0) {
        return;
    }
    // add default extension
    const ext = path.extname(filePath) === "" ? ".ipynb" : "";
    const fname = `${filePath}${ext}`;
    try {
        await writeFile(fname, (0, commutable_1.stringifyNotebook)(store_1.default.notebook));
        atom.notifications.addSuccess("Save successful", {
            detail: `Saved notebook as ${fname}`,
        });
    }
    catch (err) {
        atom.notifications.addError("Error saving file", {
            detail: err.message,
        });
    }
}
