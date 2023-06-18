"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const react_1 = __importDefault(require("react"));
const utils_1 = require("../utils");
const kernel_monitor_1 = __importDefault(require("../components/kernel-monitor"));
class KernelMonitorPane {
    constructor(store) {
        this.element = document.createElement("div");
        this.disposer = new atom_1.CompositeDisposable();
        this.getTitle = () => "Hydrogen Kernel Monitor";
        this.getURI = () => utils_1.KERNEL_MONITOR_URI;
        this.getDefaultLocation = () => "bottom";
        this.getAllowedLocations = () => ["bottom", "left", "right"];
        this.element.classList.add("hydrogen");
        (0, utils_1.reactFactory)(react_1.default.createElement(kernel_monitor_1.default, { store: store }), this.element, null, this.disposer);
    }
    destroy() {
        this.disposer.dispose();
        this.element.remove();
    }
}
exports.default = KernelMonitorPane;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2VybmVsLW1vbml0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvcGFuZXMva2VybmVsLW1vbml0b3IudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsK0JBQTJDO0FBQzNDLGtEQUEwQjtBQUMxQixvQ0FBNEQ7QUFFNUQsa0ZBQXlEO0FBQ3pELE1BQXFCLGlCQUFpQjtJQUlwQyxZQUFZLEtBQVk7UUFIeEIsWUFBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEMsYUFBUSxHQUFHLElBQUksMEJBQW1CLEVBQUUsQ0FBQztRQVlyQyxhQUFRLEdBQUcsR0FBRyxFQUFFLENBQUMseUJBQXlCLENBQUM7UUFDM0MsV0FBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLDBCQUFrQixDQUFDO1FBQ2xDLHVCQUFrQixHQUFHLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztRQUNwQyx3QkFBbUIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFadEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLElBQUEsb0JBQVksRUFDViw4QkFBQyx3QkFBYSxJQUFDLEtBQUssRUFBRSxLQUFLLEdBQUksRUFDL0IsSUFBSSxDQUFDLE9BQU8sRUFDWixJQUFJLEVBQ0osSUFBSSxDQUFDLFFBQVEsQ0FDZCxDQUFDO0lBQ0osQ0FBQztJQU9ELE9BQU87UUFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztDQUNGO0FBdkJELG9DQXVCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tIFwiYXRvbVwiO1xyXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCB7IHJlYWN0RmFjdG9yeSwgS0VSTkVMX01PTklUT1JfVVJJIH0gZnJvbSBcIi4uL3V0aWxzXCI7XHJcbnR5cGUgc3RvcmUgPSB0eXBlb2YgaW1wb3J0KFwiLi4vc3RvcmVcIikuZGVmYXVsdDtcclxuaW1wb3J0IEtlcm5lbE1vbml0b3IgZnJvbSBcIi4uL2NvbXBvbmVudHMva2VybmVsLW1vbml0b3JcIjtcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2VybmVsTW9uaXRvclBhbmUge1xyXG4gIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gIGRpc3Bvc2VyID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcclxuXHJcbiAgY29uc3RydWN0b3Ioc3RvcmU6IHN0b3JlKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImh5ZHJvZ2VuXCIpO1xyXG4gICAgcmVhY3RGYWN0b3J5KFxyXG4gICAgICA8S2VybmVsTW9uaXRvciBzdG9yZT17c3RvcmV9IC8+LFxyXG4gICAgICB0aGlzLmVsZW1lbnQsXHJcbiAgICAgIG51bGwsXHJcbiAgICAgIHRoaXMuZGlzcG9zZXJcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBnZXRUaXRsZSA9ICgpID0+IFwiSHlkcm9nZW4gS2VybmVsIE1vbml0b3JcIjtcclxuICBnZXRVUkkgPSAoKSA9PiBLRVJORUxfTU9OSVRPUl9VUkk7XHJcbiAgZ2V0RGVmYXVsdExvY2F0aW9uID0gKCkgPT4gXCJib3R0b21cIjtcclxuICBnZXRBbGxvd2VkTG9jYXRpb25zID0gKCkgPT4gW1wiYm90dG9tXCIsIFwibGVmdFwiLCBcInJpZ2h0XCJdO1xyXG5cclxuICBkZXN0cm95KCkge1xyXG4gICAgdGhpcy5kaXNwb3Nlci5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==