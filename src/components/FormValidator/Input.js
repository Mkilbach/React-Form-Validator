import React, { Component } from 'react'

import validate from "./validation";

import './input.scss'

export default class Input extends Component {

    state = {
        validate: false,
        valid: false,
        errorText: '',
        value: this.props.defaultValue,
        confirmValue: ''
    }

    handleChange = async e => {
        await this.setState({ value: e.target.value });
        this.validateField();
    }

    onBlur = e => {
        const { validate } = this.state;
        if (!validate) {
            this.setState({ validate: !validate });
            this.validateField();
        }
    }

    onFocus = e => {
        const { onFocus } = this.props;
        onFocus && onFocus();
    }

    validateField = () => {
        let valid = true;

        if (!this.checkIfOptionalEmpty()) {
            valid && (valid = this.checkRequired());
            valid && (valid = this.validateMinLength());
            valid && (valid = this.validateRule());
        }

        this.setState({ valid });
    }

    // CHECK IF INPUT IS NOT REQUIRED AND EMPTY
    checkIfOptionalEmpty = () => {
        const { value, confirmValue } = this.state;
        const { required } = this.props;
        return (!required && value.length === 0 && confirmValue.length === 0) ? true : false;
    }

    checkRequired = () => {
        const { value, confirmValue } = this.state;
        const { required, rule } = this.props;
        if (!required || (required && value && value.length > 0 && ((rule === 'confirm' && confirmValue && confirmValue > 0) || rule !== 'confirm'))) {
            this.setState({ errorText: '' })
            return true;
        } else {
            this.setState({ errorText: 'input is required' });
            return false;
        }
    }

    validateMinLength = () => {
        const { min, minErrorText, rule } = this.props;
        const { value, confirmValue } = this.state;
        if (!min || (value.length > min && ((rule === 'confirm' && confirmValue > min) || rule !== 'confirm'))) {
            this.setState({ errorText: '' })
            return true;
        } else {
            this.setState({ errorText: minErrorText ? minErrorText : 'input is too short' });
            return false;
        }
    }

    validateRule = () => {
        const { rule, errorText } = this.props;
        const { value, confirmValue } = this.state;

        if (!rule || (rule && validate(rule, value, confirmValue))) {
            this.setState({ errorText: '' })
            return true
        } else {
            this.setState({ errorText: errorText })
            return false
        }
    }

    generateField = () => {
        const { type } = this.props;
        let result;

        switch (type) {
            case 'select':
                result = this.generateSelect();
                break;

            case 'radio':
                result = this.generateRadios();
                break;

            default:
                result = this.generateInput();
                break;
        }

        return result;
    }

    generateInput = () => {
        const { id, name, disabled, readonly, placeholder, type, max, inputClass } = this.props;
        const { value } = this.state;

        return (
            <input
                id={id}
                name={name}
                disabled={disabled ? true : false}
                readOnly={readonly ? true : false}
                placeholder={placeholder}
                type={type}
                maxLength={max}
                className={'validatedInput__input' + (inputClass ? ' ' + inputClass : '')}
                value={value}
                onChange={this.handleChange}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
            />
        )
    }

    generateRadios = () => {
        const { id, name, disabled, readonly, type, inputClass, inputOptions } = this.props;

        return (
            <div onChange={this.handleChange}>
                {Array.isArray(inputOptions) && inputOptions.map((el, i) => {
                    const optionName = Array.isArray(el) ? el[0] : el;
                    const optionValue = Array.isArray(el) ? el[1] : el;
                    return (
                        <label htmlFor={id + '_' + i} key={i}>
                            <input
                                type={type}
                                id={id + '_' + i}
                                disabled={disabled ? true : false}
                                readOnly={readonly ? true : false}
                                name={name}
                                className={'validatedInput__input' + (inputClass ? ' ' + inputClass : '')}
                                onBlur={this.onBlur}
                                onFocus={this.onFocus}
                                value={optionValue}
                            />
                            <span>{optionName}</span>
                        </label>
                    )
                })}
            </div>
        )
    }

    generateSelect = () => {
        const { id, name, disabled, readonly, placeholder, type, inputClass, inputOptions } = this.props;
        const { value } = this.state;

        return (
            <select
                id={id}
                name={name}
                disabled={disabled ? true : false}
                readOnly={readonly ? true : false}
                placeholder={placeholder}
                type={type}
                className={'validatedInput__input' + (inputClass ? ' ' + inputClass : '')}
                value={value}
                onChange={this.handleChange}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
            >
                <option readOnly hidden></option>
                {Array.isArray(inputOptions) && inputOptions.map((el, i) => {
                    const optionName = Array.isArray(el) ? el[0] : el;
                    const optionValue = Array.isArray(el) ? el[1] : el;
                    return <option key={i} value={optionValue}>{optionName}</option>
                })}
            </select>
        )
    }

    render() {
        const { id, title, type } = this.props;
        const { errorText, validate, valid } = this.state;

        return (
            <label htmlFor={id} className={'validatedInput' + (validate && (valid ? ' success' : ' error'))}>
                {title && type !== 'checkbox' && <p className={'validatedInput__title'}>{title}</p>}
                {this.generateField()}
                {title && type === 'checkbox' && <span className={'validatedInput__title'}>{title}</span>}
                {validate && !valid && errorText && <p className={'validatedInput__error'}>{errorText}</p>}
            </label>
        )
    }
}
