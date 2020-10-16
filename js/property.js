class Property {
	constructor(target_class, type = 'boolean', name, options = 0) {
		if (!target_class.properties) {
			target_class.properties = {};
		}
		target_class.properties[name] = this;

		let scope = this;

		this.class = target_class;
		this.name = name;
		this.type = type;

		if (options.default != undefined) {
			this.default = options.default;
		} else {
			switch (this.type) {
				case 'string': this.default = ''; break;
				case 'molang': this.default = '0'; break;
				case 'number': this.default = 0; break;
				case 'boolean': this.default = false; break;
				case 'array': this.default = []; break;
				case 'vector': this.default = [0, 0, 0]; break;
				case 'vector2': this.default = [0, 0]; break;
			}
		}
		switch (this.type) {
			case 'string': this.isString = true; break;
			case 'molang': this.isMolang = true; break;
			case 'number': this.isNumber = true; break;
			case 'boolean': this.isBoolean = true; break;
			case 'array': this.isArray = true; break;
			case 'vector': this.isVector = true; break;
			case 'vector2': this.isVector2 = true; break;
		}

		if (this.isMolang) {
			Object.defineProperty(target_class.prototype, `${name}_string`, {
				get() {
					return typeof this[name] == 'number' ? trimFloatNumber(this[name]) || scope.getDefault(this) : this[name];
				},
				set(val) {
					this[name] = val;
				}
			})
		}

		if (typeof options.merge == 'function') this.merge = options.merge;
		if (typeof options.reset == 'function') this.reset = options.reset;
		if (typeof options.merge_validation == 'function') this.merge_validation = options.merge_validation;
		if (options.condition) this.condition = options.condition;
		if (options.exposed == false) this.exposed = false;
		if (options.label) this.label = options.label;
		if (options.options) this.options = options.options;
	}
	delete() {
        delete this.class.properties[this.name];
    }
	getDefault(instance) {
		if (typeof this.default == 'function') {
			return this.default(instance);
		} else {
			return this.default;
		}
	}
	merge(instance, data) {
		if (data[this.name] == undefined || !Condition(this.condition, instance)) return;

		if (this.isString) {
			Merge.string(instance, data, this.name, this.merge_validation)
		}
		else if (this.isNumber) {
			Merge.number(instance, data, this.name)
		}
		else if (this.isMolang) {
			Merge.molang(instance, data, this.name)
		}
		else if (this.isBoolean) {
			Merge.boolean(instance, data, this.name, this.merge_validation)
		}
		else if (this.isArray || this.isVector || this.isVector2) {
			if (data[this.name] instanceof Array) {
				if (instance[this.name] instanceof Array == false) {
					instance[this.name] = [];
				}
				instance[this.name].replace(data[this.name]);
			}
		}
	}
	copy(instance, target) {
		if (!Condition(this.condition, instance)) return;

		if (this.isArray || this.isVector || this.isVector2) {
			if (instance[this.name] instanceof Array) {
				target[this.name] = instance[this.name].slice();
			}
		} else {
			target[this.name] = instance[this.name];
		}
	}
	reset(instance) {
		if (instance[this.name] == undefined && !Condition(this.condition, instance)) return;
		var dft = this.getDefault(instance)

		if (this.isArray || this.isVector || this.isVector2) {
			if (instance[this.name] instanceof Array == false) {
				instance[this.name] = [];
			}
			instance[this.name].replace(dft);
		} else {
			instance[this.name] = dft;
		}
	}
}
