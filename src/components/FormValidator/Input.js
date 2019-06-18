import React, { Component } from 'react'
import PropTypes from 'prop-types'

import validate from "./validation";

import './input.scss'

export default class Input extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired
    }

    state = {
        validate: false,
        valid: false,
        errorText: '',
        value: this.props.children ? '' : (this.props.type === 'checkbox' ? this.props.checked : this.props.defaultValue),
        confirmValue: ''
    }

    async componentDidMount() {
        const { children } = this.props;
        if (children) await this.recursiveSearchInputs(children);

        const { value } = this.state;
        if (value) this.validateField();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.validateAll !== this.props.validateAll && this.props.validateAll) {
            this.setState({ validate: true });
            this.validateField();
        }
    }

    recursiveSearchInputs = children => {
        (Array.isArray(children) ? children : [children]).forEach(async el => {
            if (el.type === 'input' && el.props.defaultChecked) await this.setState({ value: el.props.value });
            if (el.props && el.props.children) this.recursiveSearchInputs(el.props.children);
        })
    }

    handleChange = async e => {
        const { type, onBeforeChange, onAfterChange } = this.props;
        const { validate } = this.state;
        const { checked, value } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        onBeforeChange && onBeforeChange();

        if ((type === 'checkbox' || type === 'select' || type === 'radio' || e.target.type === 'radio') && !validate) await this.setState({ validate: !validate });
        await this.setState({ value: newValue });
        this.validateField();

        onAfterChange && onAfterChange();
    }

    onBlur = e => {
        const { validate } = this.state;
        const { onBlur } = this.props;

        if (!validate) {
            this.setState({ validate: !validate });
            this.validateField();
        }

        onBlur && onBlur();
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

        return (!required && (value === undefined || value.length === 0 || value === false) && (confirmValue === undefined || confirmValue.length === 0 || confirmValue === false)) ? true : false;
    }

    checkRequired = () => {
        const { value, confirmValue } = this.state;
        const { required, rule } = this.props;
        if (!required || (required && value && (value.toString().length > 0 || value === true) && ((rule === 'confirm' && confirmValue && (confirmValue.toString().length > 0 || confirmValue === true)) || rule !== 'confirm'))) {
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
        if (!min || (value.toString().length >= min && ((rule === 'confirm' && confirmValue.toString().length >= min) || rule !== 'confirm'))) {
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
                value={value ? value : ''}
                checked={value ? value : false}
                onChange={this.handleChange}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
            />
        )
    }

    generateRadios = () => {
        const { id, name, disabled, readonly, type, inputClass, inputOptions } = this.props;
        const { value } = this.state;

        return (
            <div onChange={this.handleChange} defaultValue={value}>
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
                                defaultChecked={value === optionValue}
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
                type={type}
                className={'validatedInput__input' + (inputClass ? ' ' + inputClass : '')}
                value={value}
                onChange={this.handleChange}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
            >
                <option readOnly hidden>{placeholder}</option>
                {Array.isArray(inputOptions) && inputOptions.map((el, i) => {
                    const optionName = Array.isArray(el) ? el[0] : el;
                    const optionValue = Array.isArray(el) ? el[1] : el;
                    return <option key={i} value={optionValue}>{optionName}</option>
                })}
            </select>
        )
    }

    render() {
        const { id, title, type, disabled, errorClass, labelClass, children } = this.props;
        const { errorText, validate, valid } = this.state;

        return (
            children
                ? (
                    <div onChange={this.handleChange} onBlur={this.onBlur} onFocus={this.onFocus} className={'validatedInput' + (labelClass ? ' ' + labelClass : '') + (validate && !disabled && (valid ? ' success' : ' error'))}>
                        {children}
                        {validate && !valid && errorText && <p className={'validatedInput__error' + (errorClass ? ' ' + errorClass : '')}>{errorText}</p>}
                    </div>
                ) : (
                    <label htmlFor={id} className={'validatedInput' + (labelClass ? ' ' + labelClass : '') + (validate && !disabled && (valid ? ' success' : ' error'))}>
                        {title && type !== 'checkbox' && <p className={'validatedInput__title'}>{title}</p>}
                        {this.generateField()}
                        {title && type === 'checkbox' && <span className={'validatedInput__title'}>{title}</span>}
                        {validate && !valid && !disabled && errorText && <p className={'validatedInput__error' + (errorClass ? ' ' + errorClass : '')}>{errorText}</p>}
                    </label>
                )
        )
    }
}