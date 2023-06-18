"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const react_1 = __importDefault(require("react"));
const utils_1 = require("../utils");
const watch_sidebar_1 = __importDefault(require("../components/watch-sidebar"));
class WatchesPane {
    constructor(store) {
        this.element = document.createElement("div");
        this.disposer = new atom_1.CompositeDisposable();
        this.getTitle = () => "Hydrogen Watch";
        this.getURI = () => utils_1.WATCHES_URI;
        this.getDefaultLocation = () => "right";
        this.getAllowedLocations = () => ["left", "right"];
        this.element.classList.add("hydrogen");
        (0, utils_1.reactFactory)(react_1.default.createElement(watch_sidebar_1.default, { store: store }), this.element, null, this.disposer);
    }
    destroy() {
        this.disposer.dispose();
        this.element.remove();
    }
}
exports.default = WatchesPane;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2hlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9wYW5lcy93YXRjaGVzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLCtCQUEyQztBQUMzQyxrREFBMEI7QUFDMUIsb0NBQXFEO0FBRXJELGdGQUFrRDtBQUNsRCxNQUFxQixXQUFXO0lBSTlCLFlBQVksS0FBWTtRQUh4QixZQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QyxhQUFRLEdBQUcsSUFBSSwwQkFBbUIsRUFBRSxDQUFDO1FBT3JDLGFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUNsQyxXQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsbUJBQVcsQ0FBQztRQUMzQix1QkFBa0IsR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7UUFDbkMsd0JBQW1CLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFQNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLElBQUEsb0JBQVksRUFBQyw4QkFBQyx1QkFBTyxJQUFDLEtBQUssRUFBRSxLQUFLLEdBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQU9ELE9BQU87UUFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztDQUNGO0FBbEJELDhCQWtCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tIFwiYXRvbVwiO1xyXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCB7IHJlYWN0RmFjdG9yeSwgV0FUQ0hFU19VUkkgfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxudHlwZSBzdG9yZSA9IHR5cGVvZiBpbXBvcnQoXCIuLi9zdG9yZVwiKS5kZWZhdWx0O1xyXG5pbXBvcnQgV2F0Y2hlcyBmcm9tIFwiLi4vY29tcG9uZW50cy93YXRjaC1zaWRlYmFyXCI7XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdGNoZXNQYW5lIHtcclxuICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICBkaXNwb3NlciA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHN0b3JlOiBzdG9yZSkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoeWRyb2dlblwiKTtcclxuICAgIHJlYWN0RmFjdG9yeSg8V2F0Y2hlcyBzdG9yZT17c3RvcmV9IC8+LCB0aGlzLmVsZW1lbnQsIG51bGwsIHRoaXMuZGlzcG9zZXIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0VGl0bGUgPSAoKSA9PiBcIkh5ZHJvZ2VuIFdhdGNoXCI7XHJcbiAgZ2V0VVJJID0gKCkgPT4gV0FUQ0hFU19VUkk7XHJcbiAgZ2V0RGVmYXVsdExvY2F0aW9uID0gKCkgPT4gXCJyaWdodFwiO1xyXG4gIGdldEFsbG93ZWRMb2NhdGlvbnMgPSAoKSA9PiBbXCJsZWZ0XCIsIFwicmlnaHRcIl07XHJcblxyXG4gIGRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VyLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcclxuICB9XHJcbn1cclxuIl19