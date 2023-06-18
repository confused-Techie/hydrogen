"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const react_1 = __importDefault(require("react"));
const utils_1 = require("../utils");
const output_area_1 = __importDefault(require("../components/output-area"));
class OutputPane {
    constructor(store) {
        this.element = document.createElement("div");
        this.disposer = new atom_1.CompositeDisposable();
        this.getTitle = () => "Hydrogen Output Area";
        this.getURI = () => utils_1.OUTPUT_AREA_URI;
        this.getDefaultLocation = () => "right";
        this.getAllowedLocations = () => ["left", "right", "bottom"];
        this.element.classList.add("hydrogen");
        this.disposer.add(new atom_1.Disposable(() => {
            if (store.kernel) {
                store.kernel.outputStore.clear();
            }
        }));
        (0, utils_1.reactFactory)(react_1.default.createElement(output_area_1.default, { store: store }), this.element, null, this.disposer);
    }
    destroy() {
        this.disposer.dispose();
        const pane = atom.workspace.paneForURI(utils_1.OUTPUT_AREA_URI);
        if (!pane) {
            return;
        }
        pane.destroyItem(this);
    }
}
exports.default = OutputPane;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LWFyZWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvcGFuZXMvb3V0cHV0LWFyZWEudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsK0JBQXVEO0FBQ3ZELGtEQUEwQjtBQUMxQixvQ0FBeUQ7QUFFekQsNEVBQW1EO0FBQ25ELE1BQXFCLFVBQVU7SUFJN0IsWUFBWSxLQUFZO1FBSHhCLFlBQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLGFBQVEsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUM7UUFtQnJDLGFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztRQUN4QyxXQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsdUJBQWUsQ0FBQztRQUMvQix1QkFBa0IsR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7UUFDbkMsd0JBQW1CLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBbkJ0RCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ2YsSUFBSSxpQkFBVSxDQUFDLEdBQUcsRUFBRTtZQUNsQixJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hCLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2xDO1FBQ0gsQ0FBQyxDQUFDLENBQ0gsQ0FBQztRQUNGLElBQUEsb0JBQVksRUFDViw4QkFBQyxxQkFBVSxJQUFDLEtBQUssRUFBRSxLQUFLLEdBQUksRUFDNUIsSUFBSSxDQUFDLE9BQU8sRUFDWixJQUFJLEVBQ0osSUFBSSxDQUFDLFFBQVEsQ0FDZCxDQUFDO0lBQ0osQ0FBQztJQU9ELE9BQU87UUFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBSXhCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLHVCQUFlLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsT0FBTztTQUNSO1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDO0NBQ0Y7QUFyQ0QsNkJBcUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSB9IGZyb20gXCJhdG9tXCI7XHJcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcclxuaW1wb3J0IHsgcmVhY3RGYWN0b3J5LCBPVVRQVVRfQVJFQV9VUkkgfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxudHlwZSBzdG9yZSA9IHR5cGVvZiBpbXBvcnQoXCIuLi9zdG9yZVwiKS5kZWZhdWx0O1xyXG5pbXBvcnQgT3V0cHV0QXJlYSBmcm9tIFwiLi4vY29tcG9uZW50cy9vdXRwdXQtYXJlYVwiO1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPdXRwdXRQYW5lIHtcclxuICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICBkaXNwb3NlciA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHN0b3JlOiBzdG9yZSkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoeWRyb2dlblwiKTtcclxuICAgIHRoaXMuZGlzcG9zZXIuYWRkKFxyXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XHJcbiAgICAgICAgaWYgKHN0b3JlLmtlcm5lbCkge1xyXG4gICAgICAgICAgc3RvcmUua2VybmVsLm91dHB1dFN0b3JlLmNsZWFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICAgIHJlYWN0RmFjdG9yeShcclxuICAgICAgPE91dHB1dEFyZWEgc3RvcmU9e3N0b3JlfSAvPixcclxuICAgICAgdGhpcy5lbGVtZW50LFxyXG4gICAgICBudWxsLFxyXG4gICAgICB0aGlzLmRpc3Bvc2VyXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZ2V0VGl0bGUgPSAoKSA9PiBcIkh5ZHJvZ2VuIE91dHB1dCBBcmVhXCI7XHJcbiAgZ2V0VVJJID0gKCkgPT4gT1VUUFVUX0FSRUFfVVJJO1xyXG4gIGdldERlZmF1bHRMb2NhdGlvbiA9ICgpID0+IFwicmlnaHRcIjtcclxuICBnZXRBbGxvd2VkTG9jYXRpb25zID0gKCkgPT4gW1wibGVmdFwiLCBcInJpZ2h0XCIsIFwiYm90dG9tXCJdO1xyXG5cclxuICBkZXN0cm95KCkge1xyXG4gICAgdGhpcy5kaXNwb3Nlci5kaXNwb3NlKCk7XHJcbiAgICAvLyBXaGVuIGEgdXNlciBtYW51YWxseSBjbGlja3MgdGhlIGNsb3NlIGljb24sIHRoZSBwYW5lIGhvbGRpbmcgdGhlIE91dHB1dEFyZWFcclxuICAgIC8vIGlzIGRlc3Ryb3llZCBhbG9uZyB3aXRoIHRoZSBPdXRwdXRBcmVhIGl0ZW0uIFdlIG1pbWljIHRoaXMgaGVyZSBzbyB0aGF0IHdlIGNhbiBjYWxsXHJcbiAgICAvLyAgb3V0cHV0QXJlYS5kZXN0cm95KCkgYW5kIGZ1bGx5IGNsZWFuIHVwIHRoZSBPdXRwdXRBcmVhIHdpdGhvdXQgdXNlciBjbGlja2luZ1xyXG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoT1VUUFVUX0FSRUFfVVJJKTtcclxuICAgIGlmICghcGFuZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBwYW5lLmRlc3Ryb3lJdGVtKHRoaXMpO1xyXG4gIH1cclxufVxyXG4iXX0=