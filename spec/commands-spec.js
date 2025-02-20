"use babel";

const { class: Store } = require("../dist/store/index.js");
const { toggleInspector, toggleOutputMode } = require("../dist/commands.js");
const KernelTransport = require("../dist/kernel-transport.js");
const Kernel = require("../dist/kernel.js");
const { OUTPUT_AREA_URI } = require("../dist/utils.js");
const OutputPane = require("../dist/panes/output-area.js");

// import { class: Store } from "../dist/store";
// import { toggleInspector, toggleOutputMode } from "../dist/commands";
// import KernelTransport from "../dist/kernel-transport";
// import Kernel from "../dist/kernel";
// import { OUTPUT_AREA_URI } from "../dist/utils";
// import OutputPane from "../dist/panes/output-area";

describe("commands", () => {
  let storeMock;
  let mockKernel;
  let filePath;
  let grammar;
  let editor;

  beforeAll(() => {
    storeMock = new Store();
    filePath = "fake.py";
    grammar = atom.grammars.grammarForScopeName("source.python");
    editor = atom.workspace.buildTextEditor();
    mockKernel = new Kernel(
      new KernelTransport({
        display_name: "Python 3",
        language: "python",
      })
    );

    spyOn(editor, "getPath").and.returnValue(filePath);
    spyOn(storeMock.subscriptions, "dispose");
    storeMock.newKernel(mockKernel, filePath, editor, grammar);
  });

  describe("toggleInspector", () => {
    let codeText;
    let cursorPos;
    let bundle;
    beforeEach(() => {
      codeText = `print('hello world')`;
      bundle = { "text/plain": "Mockstring: so helpful" };

      editor.setText(codeText);
      storeMock.updateEditor(editor);
      spyOn(storeMock.kernel, "inspect");
    });

    it("calls kernel.inspect with code and cursor position", () => {
      toggleInspector(storeMock);
      expect(storeMock.kernel.inspect).toHaveBeenCalledWith(
        codeText,
        codeText.length,
        jasmine.any(Function)
      );
    });
  });

  describe("toggle output-area", () => {
    it("should open the output area if it was not already", () => {
      spyOn(atom.workspace, "open");
      spyOn(atom.workspace, "getPaneItems").and.returnValue([]);
      toggleOutputMode();
      expect(atom.workspace.open).toHaveBeenCalledWith(
        OUTPUT_AREA_URI,
        jasmine.any(Object)
      );
    });
    it("should destroy output-pane if it was active", () => {
      const outputPane = new OutputPane(storeMock);
      const workspacePaneItems = [outputPane];
      spyOn(atom.workspace, "getPaneItems").and.returnValue(workspacePaneItems);
      spyOn(outputPane, "destroy");
      toggleOutputMode();
      expect(outputPane.destroy).toHaveBeenCalled();
    });
  });
});
