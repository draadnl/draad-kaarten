`use strict`;

class Draad_Tabs {

	/** 
	 * Constructor
	 * 
	 * @param {HTMLElement} groupNode The HTML element tat contains the tabs.
	 */
	constructor(groupNode) {
		if (!groupNode) {
			throw new Error('Draad Tabs: No tablist node provided.');
		}

		this.tablistNode = groupNode;
		this.tabs = Array.from(this.tablistNode.querySelectorAll('[role=tab]'));
		this.tabPanels = this.tabs?.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
		this.firstTab = this.tabs[0] || null;
		this.lastTab = this.tabs[this.tabs.length - 1] || null;

		this.tabs?.forEach(tab => {
			tab.setAttribute('aria-selected', 'false');
			tab.addEventListener('keydown', this.onKeydown.bind(this));
			tab.addEventListener('click', this.onClick.bind(this));
		});

		this.setSelectedTab(this.firstTab);
	}

	/**
	 * Set the selected tab.
	 * 
	 * @param {HTMLElement} currentTab the current tab element.
	 */
	setSelectedTab(currentTab) {
		this.tabs?.forEach( (tab, i) => {
			const isSelected = tab === currentTab;
			tab.setAttribute('aria-selected', isSelected);
			this.tabPanels[i].hidden = !isSelected;
		});
	}

	/**
	 * Move focus to a tab.
	 * 
	 * @param {HTMLElement} currentTab The current tab element.
	 */
	moveFocusToTab(currentTab) {
		currentTab.focus();
	}

	/**
	 * Moves the focus to the adjacent tab based on teh spcified direction.
	 * 
	 * @param {HTMLElement} currentTab The current tab element.
	 * @param {number} direction -	The direction to move the focus.
	 * 								-1: Move to the previous tab.
	 * 								1: Move to the next tab.
	 */
	moveFocusToAdjacentTab(currentTab, direction) {
		let index = this.tabs.indexOf(currentTab);
		index = (index + direction + this.tabs.length) % this.tabs.length;
		this.moveFocusToTab(this.tabs[index]);
	}

	/**
	 * onKeyDown event handler for tabs.
	 * 
	 * @param {object} event The keyboard event object.
	 */
	onKeydown(event) {
		const tgt = event.currentTarget;
		let stopPropagation = false;

		switch (event.key) {
			case 'ArrowLeft':
				this.moveFocusToAdjacentTab(tgt, -1);
				stopPropagation = true;
				break;
			case 'ArrowRight':
				this.moveFocusToAdjacentTab(tgt, 1);
				stopPropagation = true;
				break;
			case 'Home':
				this.moveFocusToTab(this.firstTab);
				stopPropagation = true;
				break;
			case 'End':
				this.moveFocusToTab(this.lastTab);
				stopPropagation = true;
				break;
		}

		if (stopPropagation) {
			event.stopPropagation();
		}
	}

	/**
	 * onClick event handler for tabs.
	 * 
	 * @param {object} event The click event object.
	 */
	onClick(event) {
		this.setSelectedTab(event.currentTarget);
	}

}

// Initialize tablist.
window.addEventListener( 'DOMContentLoaded', () => document.querySelectorAll( '.draad-tabs' )?.forEach( tablist => new Draad_Tabs( tablist ) ) );