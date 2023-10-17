`use strict`;

class Draad_Focus_Trap {

	constructor( node ) {

		this._rootEl = node;

	}

	_rootEl = null;

	_active = false;

	_firstFocusableElement = null;

	_lastFocusableElement = null;

	get active() {
		return this._active;
	}

	set active( value ) {

		if ( typeof value !== 'boolean' ) {
			return;
		}

		this._active = value;

		if ( this._active ) {
			this.activate();
		} else {
			this.deactivate();
		}

	}
	
	activate() {

		if ( ! this.active ) {
			return;
		}

		// get all focusable children
		const focusableElements = Array.from( this._rootEl.querySelectorAll( 'a[href], button, textarea, input, select, summary, [tabindex]' ) );

		// filter out elements that are not visible
		const visibleFocusableElements = focusableElements.filter( ( element ) => {
			return element.offsetParent !== null;
		});

		this._firstFocusableElement = visibleFocusableElements[0];

		this._lastFocusableElement = visibleFocusableElements[visibleFocusableElements.length - 1];

		this._rootEl.addEventListener( 'keydown', ( event ) => {

			if ( event.key !== 'Tab' ) {
				return;
			}

			if ( ! event.shiftKey && document.activeElement === this._lastFocusableElement ) {
				event.preventDefault();
				this._firstFocusableElement.focus();
			} else if ( event.shiftKey && document.activeElement === this._firstFocusableElement ) {
				event.preventDefault();
				this._lastFocusableElement.focus();
			}

		});

	}

	deactivate() {

		this._rootEl.removeEventListener( 'keydown', () => {} );

		this._firstFocusableElement = null;

		this._lastFocusableElement = null;

	}

}

export default Draad_Focus_Trap;