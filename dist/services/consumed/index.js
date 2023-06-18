var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const status_bar_1 = __importDefault(require("./status-bar"));
const autocomplete_1 = __importDefault(require("./autocomplete"));
exports.default = {
  statusBar: status_bar_1.default,
  autocomplete: autocomplete_1.default,
};
