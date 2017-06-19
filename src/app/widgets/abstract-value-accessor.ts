import {Provider, forwardRef} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
// https://stackoverflow.com/questions/34948961/angular-2-custom-form-input/34998780#34998780

const noop = () => { };

export abstract class AbstractValueAccessor<T> implements ControlValueAccessor {
    protected _value: T = this.getDefault();
    onChange: (_: any) => void = noop;
    onTouched: () => void = noop;

    get value(): T { return this._value; };
    set value(v: T) {
      if (v !== this._value) {
        this._value = v;
        this.onChange(v);
      }
    }

    abstract getDefault(): T;

    writeValue(value: T) {
      this._value = value;
      // not emitting event, since only want to emit on user intervention
      // this.onChange(value);
    }

    registerOnChange(fn: (_: any) => void): void {
      this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
      this.onTouched = fn;
    }
}

export function MakeProvider(type: any) {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => type),
        multi: true
    };
}
