var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelManager = void 0;
const map_1 = __importDefault(require("lodash/map"));
const mapKeys_1 = __importDefault(require("lodash/mapKeys"));
const sortBy_1 = __importDefault(require("lodash/sortBy"));
const kernelspecs_1 = require("kernelspecs");
const electron_1 = require("electron");
const zmq_kernel_1 = __importDefault(require("./zmq-kernel"));
const kernel_1 = __importDefault(require("./kernel"));
const kernel_picker_1 = __importDefault(require("./kernel-picker"));
const store_1 = __importDefault(require("./store"));
const utils_1 = require("./utils");
class KernelManager {
    constructor() {
        this.kernelSpecs = null;
    }
    startKernelFor(grammar, editor, filePath, onStarted) {
        this.getKernelSpecForGrammar(grammar).then((kernelSpec) => {
            if (!kernelSpec) {
                const message = `No kernel for grammar \`${grammar.name}\` found`;
                const pythonDescription = grammar && /python/g.test(grammar.scopeName)
                    ? "\n\nTo detect your current Python install you will need to run:<pre>python -m pip install ipykernel\npython -m ipykernel install --user</pre>"
                    : "";
                const description = `Check that the language for this file is set in Atom, that you have a Jupyter kernel installed for it, and that you have configured the language mapping in Hydrogen preferences.${pythonDescription}`;
                atom.notifications.addError(message, {
                    description,
                    dismissable: pythonDescription !== "",
                });
                return;
            }
            this.startKernel(kernelSpec, grammar, editor, filePath, onStarted);
        });
    }
    startKernel(kernelSpec, grammar, editor, filePath, onStarted) {
      // if kernel startup already in progress don't start additional kernel
        const displayName = kernelSpec.display_name;
        if (store_1.default.startingKernels.get(displayName)) {
            return;
        }
        store_1.default.startKernel(displayName);
        const currentPath = (0, utils_1.getEditorDirectory)(editor);
        let projectPath;
        (0, utils_1.log)("KernelManager: startKernel:", displayName);
        switch (atom.config.get("Hydrogen.startDir")) {
            case "firstProjectDir":
                projectPath = atom.project.getPaths()[0];
                break;
            case "projectDirOfFile":
                projectPath = atom.project.relativizePath(currentPath)[0];
                break;
        }
        const kernelStartDir = projectPath != null ? projectPath : currentPath;
        const options = {
            cwd: kernelStartDir,
            stdio: ["ignore", "pipe", "pipe"],
        };
        const transport = new zmq_kernel_1.default(kernelSpec, grammar, options, () => {
            const kernel = new kernel_1.default(transport);
            store_1.default.newKernel(kernel, filePath, editor, grammar);
            if (onStarted) {
                onStarted(kernel);
            }
        });
    }
    async update() {
        const kernelSpecs = await (0, kernelspecs_1.findAll)();
        const kernelResourcesDict = (0, mapKeys_1.default)(kernelSpecs, function (value, key) {
            return (value.spec.name = key);
        });
        this.kernelSpecs = (0, sortBy_1.default)((0, map_1.default)(kernelResourcesDict, "spec"), (spec) => spec.display_name);
        return this.kernelSpecs;
    }
    async getAllKernelSpecs(grammar) {
        if (this.kernelSpecs) {
            return this.kernelSpecs;
        }
        return this.updateKernelSpecs(grammar);
    }
    async getAllKernelSpecsForGrammar(grammar) {
        if (!grammar) {
            return [];
        }
        const kernelSpecs = await this.getAllKernelSpecs(grammar);
        return kernelSpecs.filter((spec) => (0, utils_1.kernelSpecProvidesGrammar)(spec, grammar));
    }
    async getKernelSpecForGrammar(grammar) {
        const kernelSpecs = await this.getAllKernelSpecsForGrammar(grammar);
        if (kernelSpecs.length <= 1) {
            return kernelSpecs[0];
        }
        if (this.kernelPicker) {
            this.kernelPicker.kernelSpecs = kernelSpecs;
        }
        else {
            this.kernelPicker = new kernel_picker_1.default(kernelSpecs);
        }
        return new Promise((resolve) => {
            if (!this.kernelPicker) {
                return resolve(null);
            }
            this.kernelPicker.onConfirmed = (kernelSpec) => resolve(kernelSpec);
            this.kernelPicker.toggle();
        });
    }
    async updateKernelSpecs(grammar) {
        const kernelSpecs = await this.update();
        if (kernelSpecs.length === 0) {
            const message = "No Kernels Installed";
            const options = {
                description: "No kernels are installed on your system so you will not be able to execute code in any language.",
                dismissable: true,
                buttons: [
                    {
                        text: "Install Instructions",
                        onDidClick: () => electron_1.shell.openExternal("https://nteract.gitbooks.io/hydrogen/docs/Installation.html"),
                    },
                    {
                        text: "Popular Kernels",
                        onDidClick: () => electron_1.shell.openExternal("https://nteract.io/kernels"),
                    },
                    {
                        text: "All Kernels",
                        onDidClick: () => electron_1.shell.openExternal("https://github.com/jupyter/jupyter/wiki/Jupyter-kernels"),
                    },
                ],
            };
            atom.notifications.addError(message, options);
        }
        else {
            const message = "Hydrogen Kernels updated:";
            const displayNames = (0, map_1.default)(kernelSpecs, "display_name"); // kernelSpecs.map((kernelSpec) => kernelSpec.display_name)
            const options = {
                detail: displayNames.join("\n"),
            };
            atom.notifications.addInfo(message, options);
        }
        return kernelSpecs;
    }
}
exports.KernelManager = KernelManager;
// used in the tests
if (atom.inSpecMode()) {
    exports.ks = require("kernelspecs");
}
