/* -----------------------------------------
 * BoolList
 * ---------------------------------------- */
export class BoolList {
	constructor(items, trueItems) {
		this._items = Array.from(items);
		this._trueItems = Array.from(trueItems);
		this._currentInd = 0;
		this.length = this._items.length;
	}

	// Get list of items
	get items() {
		return this._items;
	}

	// Get index of current item
	get currentInd() {
		return this._currentInd;
	}

	// Set index of current item
	set currentInd(i) {
		i = +i;
		i = i >= 0 ? i : 0;
		i = i < this.length ? i : this.length - 1;
		this._currentInd = i;
	}

	// Get current item
	get currentItem() {
		return this._items[this._currentInd];
	}

	// Advance to next item. Return true if this was successful
	// (did not go off end of list), false otherwise
	next() {
		if (this._currentInd < this.length - 1) {	
			this._currentInd = this._currentInd + 1;
			return true;
		}
		return false;
	}

	// Go to previous item. Return true if this was successful
	// (did not go off end of list), false otherwise
	prev() {
		if (this._currentInd > 0) {
			this._currentInd = this._currentInd - 1;
			return true;
		}
		return false;
	}

	// Return boolean indicating whether ith item is true
	isTrue(i) {
		// Can be converted to constant time operation with map or set
		return this._trueItems.includes(this._items[i]); 
	}

	// Return boolean indicating whether current item is true
	currentTrue() {
		return this.isTrue(this.currentInd);
	}

	// Advance to next *true* item. Return true if this was successful
	// (did not go off end of list), false otherwise
	nextTrue() {
		// Could be done in constant time with w/ data
		// structure. Probably doesn't matter
		var i = this._currentInd + 1;
		while (!this.isTrue(i)) {
			if (i >= this.length) {
				return false;
			}
			i++;
		}
		this._currentInd = i;
		return true;
	}

	// Go to previous *true* item. Return true if this was successful
	// (did not go off end of list), false otherwise
	prevTrue() {
		var i = this._currentInd - 1;
		while (!this.isTrue(i)) {
			if (i < 0) {
				return false;
			}
			i--;
		}
		this._currentInd = i;
		return true;
	}
}
