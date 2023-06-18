
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = __importDefault(require("../store"));
const code_manager_1 = require("../code-manager");
/**
 * @version 1.0.0 The Plugin API allows you to make Hydrogen awesome. You will
 *   be able to interact with this class in your Hydrogen Plugin using Atom's
 *   [Service API](http://blog.atom.io/2015/03/25/new-services-API.html).
 *
 *   Take a look at our [Example
 *   Plugin](https://github.com/lgeiger/hydrogen-example-plugin) and the [Atom
 *   Flight Manual](http://flight-manual.atom.io/hacking-atom/) for learning how
 *   to interact with Hydrogen in your own plugin.
 * @class HydrogenProvider
 */
class HydrogenProvider {
    constructor(emitter) {
        this._emitter = emitter;
    }

    /*
     * Calls your callback when the kernel has changed.
     * @param {Function} Callback
     */
    onDidChangeKernel(callback) {
        this._emitter.on("did-change-kernel", (kernel) => {
            if (kernel) {
                return callback(kernel.getPluginWrapper());
            }
            return callback(null);
        });
    }

    /*
     * Get the `HydrogenKernel` of the currently active text editor.
     * @return {Class} `HydrogenKernel`
     */
    getActiveKernel() {
        if (!store_1.default.kernel) {
            const grammar = store_1.default.editor ? store_1.default.editor.getGrammar().name : "";
            throw new Error(`No running kernel for grammar \`${grammar}\` found`);
        }
        return store_1.default.kernel.getPluginWrapper();
    }

    /*
     * Get the `Range` that will run if `hydrogen:run-cell` is called.
     * `null` is returned if no active text editor.
     * @return {Class} `Range`
     */
    getCellRange(editor) {
        if (!store_1.default.editor) {
            return null;
        }
        return (0, code_manager_1.getCurrentCell)(store_1.default.editor);
    }
}
exports.default = HydrogenProvider;
