`use strict`;

class Draad_Focus_Trap {
  /**
   * Constructor
   *
   * @param {HTMLElement} node HTML element to trap focus in
   */
  constructor(node) {
    this.rootEl = node;
  }

  rootEl = null;

  _active = false;

  firstFocusableElement = null;

  lastFocusableElement = null;

  get active() {
    return this._active;
  }

  set active(value) {
    if (typeof value !== "boolean") {
      return;
    }

    this._active = value;

    if (this._active) {
      this.activate();
    } else {
      this.deactivate();
    }
  }

  /**
   * Activate focus trap
   */
  activate() {
    if (!this._active) {
      return;
    }

    // get all focusable children
    const focusableElements = Array.from(
      this.rootEl.querySelectorAll(
        "a[href], button, textarea, input, select, summary, [tabindex]",
      ),
    );
    // filter out elements with tabindex="-1"
    focusableElements.filter(
      (element) => element.getAttribute("tabindex") !== "-1",
    );

    if (focusableElements.length === 0) {
      return;
    }

    // filter out elements that are not visible
    const visibleFocusableElements = focusableElements.filter(
      (element) => element.offsetParent !== null,
    );

    this.firstFocusableElement = visibleFocusableElements[0];

    this.lastFocusableElement =
      visibleFocusableElements[visibleFocusableElements.length - 1];

    this.rootEl.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") {
        return;
      }

      if (
        !event.shiftKey &&
        document.activeElement === this.lastFocusableElement
      ) {
        event.preventDefault();
        this.firstFocusableElement.focus();
      } else if (
        event.shiftKey &&
        document.activeElement === this.firstFocusableElement
      ) {
        event.preventDefault();
        this.lastFocusableElement.focus();
      }
    });
  }

  /**
   * Deactivate focus trap
   */
  deactivate() {
    this.rootEl.removeEventListener("keydown", () => {});

    this.firstFocusableElement = null;

    this.lastFocusableElement = null;
  }
}

export default Draad_Focus_Trap;
