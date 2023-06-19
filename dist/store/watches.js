const { TextEditor, CompositeDisposable } = require("atom");
const { action, observable } = require("mobx");
const SelectListView = require("atom-select-list");
const WatchStore = require("./watch.js");
const AutocompleteConsumer = require("../services/consumed/autocomplete.js");
const { setPreviouslyFocusedElement } = require("../utils.js");

class WatchesStore {
  constructor(kernel) {
    this.watches = [];
    this.createWatch = () => {
      const lastWatch = this.watches[this.watches.length - 1];
      if (!lastWatch || lastWatch.getCode().trim() !== "") {
        const watch = new WatchStore(this.kernel);
        this.watches.push(watch);
        if (AutocompleteConsumer.isEnabeled) {
          AutocompleteConsumer.addAutocompleteToWatch(this, watch);
        }
        return watch;
      }
      return lastWatch;
    };
    this.addWatch = () => {
      this.createWatch().focus();
    };
    this.addWatchFromEditor = (editor) => {
      if (!editor) {
        return;
      }
      const watchText = editor.getSelectedText();
      if (!watchText) {
        this.addWatch();
      } else {
        const watch = this.createWatch();
        watch.setCode(watchText);
        watch.run();
      }
    };
    this.removeWatch = () => {
      const watches = this.watches
        .map((v, k) => ({
          name: v.getCode(),
          value: k,
        }))
        .filter((obj) => obj.value !== 0 || obj.name !== "");
      const watchesPicker = new SelectListView({
        items: watches,
        elementForItem: (watch) => {
          const element = document.createElement("li");
          element.textContent = watch.name || "<empty>";
          return element;
        },
        didConfirmSelection: (watch) => {
          const selectedWatch = this.watches[watch.value];
          // This is for cleanup to improve performance
          if (AutocompleteConsumer.isEnabeled) {
            AutocompleteConsumer.removeAutocompleteFromWatch(
              this,
              selectedWatch
            );
          }
          this.watches.splice(watch.value, 1);
          modalPanel.destroy();
          watchesPicker.destroy();
          if (this.watches.length === 0) {
            this.addWatch();
          } else if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus();
          }
        },
        filterKeyForItem: (watch) => watch.name,
        didCancelSelection: () => {
          modalPanel.destroy();
          if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus();
          }
          watchesPicker.destroy();
        },
        emptyMessage: "There are no watches to remove!",
      });
      setPreviouslyFocusedElement(this);
      const modalPanel = atom.workspace.addModalPanel({
        item: watchesPicker,
      });
      watchesPicker.focus();
    };
    this.run = () => {
      this.watches.forEach((watch) => watch.run());
    };
    this.kernel = kernel;
    this.kernel.addWatchCallback(this.run);
    if (AutocompleteConsumer.isEnabeled) {
      const disposable = new CompositeDisposable();
      this.autocompleteDisposables = disposable;
      AutocompleteConsumer.register(disposable);
    }
    this.addWatch();
  }
  destroy() {
    if (AutocompleteConsumer.isEnabeled && this.autocompleteDisposables) {
      AutocompleteConsumer.dispose(this.autocompleteDisposables);
    }
  }
}

module.exports = WatchesStore;
