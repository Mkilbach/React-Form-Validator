import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './styles.scss'
import eye from './assets/eye.svg'
import _CONFIG from '../config'

import validate from "./validation";

export default class Input extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired
    }

    parseJson = item => {
        try { return JSON.parse(item) }
        catch { return item }
    }

    state = {
        validate: false,
        valid: this.props.required ? false : true,
        errorText: '',
        value: this.props.children ? '' : (this.props.value || (this.props.type === 'checkbox' ? this.props.checked : this.parseJson(this.props.defaultValue))),
        confirmValue: '',
        showPassword: false,
        passwordStrenght: 0
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
        if (this.props.value !== undefined && this.props.value !== this.state.value) {
            this.setState({ value: this.props.value });
        }
    }

    recursiveSearchInputs = async children => {
        for(const el of (Array.isArray(children) ? children : [children]) ) {
            if (el.type === 'input' && el.props.defaultChecked) await new Promise((resolve) => this.setState({ value: this.parseJson(el.props.value) }, resolve));
            if (el.props && el.props.children) this.recursiveSearchInputs(el.props.children);
        }
    }

    handleChange = async e => {
        const { type, onBeforeChange, onAfterChange } = this.props;
        const { validate } = this.state;
        const { checked, value, type: targetType } = e.target;
        const newValue = type === 'checkbox' ? checked : this.parseJson(value);

        onBeforeChange && onBeforeChange(e);

        if ((type === 'checkbox' || type === 'select' || type === 'radio' || targetType === 'radio') && !validate) this.setState({ validate: !validate });
        await new Promise((resolve) => this.setState({ value: String(newValue) }, resolve));
        this.validateField();

        onAfterChange && onAfterChange(e);
    }

    handleConfirmChange = async e => {
        const { onBeforeChange, onAfterChange } = this.props;
        const { value } = e.target;

        onBeforeChange && onBeforeChange(e);

        await new Promise((resolve) => this.setState({ confirmValue: this.parseJson(value) }, resolve));
        this.validateField();

        onAfterChange && onAfterChange(e);
    }

    onBlur = (e, doValidation = true) => {
        const { validate } = this.state;
        const { onBlur } = this.props;

        if (!validate && doValidation) {
            this.setState({ validate: !validate });
            this.validateField();
        }

        onBlur && onBlur(e);
    }

    onFocus = e => {
        const { onFocus } = this.props;
        onFocus && onFocus(e);
    }

    validateField = () => {
        let valid = true;

        if (!this.checkIfOptionalEmpty()) {
            if (this.props.rule === 'password') this.checkStrength();
            valid && (valid = this.checkRequired());
            valid && (valid = this.validateMinLength());
            valid && (valid = this.validateRule());
        }

        this.setState({ valid });
    }

    checkStrength = () => {
        const { min } = this.props;
        const { value } = this.state;
        const regexUppercase = /(?=.*[A-Z])/;
        const regexLowercase = /(?=.*[a-z])/;
        const regexDigit = /\d/;
        const string = value ? String(value) : '';
        const hasUppercase = regexUppercase.test(string);
        const hasLowercase = regexLowercase.test(string);
        const hasDigit = regexDigit.test(string);
        const passLength = value ? string.length : 0;

        this.setState({ passwordStrenght: (passLength >= min ? 50 : ((50 / min) * passLength)) + (hasLowercase ? 10 : 0) + (hasUppercase ? 20 : 0) + (hasDigit ? 20 : 0) });
    }

    // CHECK IF INPUT IS NOT REQUIRED AND EMPTY
    checkIfOptionalEmpty = () => {
        const { value, confirmValue } = this.state;
        const { required } = this.props;

        return (!required &&
            (value === undefined
                || (value && (value.length === 0))
                || value === ''
                || value === false)
            && (confirmValue === undefined
                || (confirmValue && (confirmValue.length === 0))
                || confirmValue === ''
                || confirmValue === false)
            ) ? true : false;
    }

    checkRequired = () => {
        const { value, confirmValue } = this.state;
        const { required, rule, requiredErrorText } = this.props;
        if (!required || (required && value && (value.toString().length > 0 || value === true) && ((rule === 'confirm' && confirmValue && (confirmValue.toString().length > 0 || confirmValue === true)) || rule !== 'confirm'))) {
            this.setState({ errorText: '' })
            return true;
        } else {
            this.setState({ errorText: requiredErrorText || 'input is required' });
            return false;
        }
    }

    validateMinLength = () => {
        const { min, minErrorText, errorText: propErrorText, rule } = this.props;
        const { value, confirmValue } = this.state;
        if (!min || (value.toString().length >= min && ((rule === 'confirm' && confirmValue.toString().length >= min) || rule !== 'confirm'))) {
            this.setState({ errorText: '' })
            return true;
        } else {
            this.setState({ errorText: minErrorText ? minErrorText : (propErrorText ? propErrorText :'input is too short') });
            return false;
        }
    }

    validateRule = () => {
        const { rule, errorText, min } = this.props;
        const { value, confirmValue } = this.state;

        if (rule === 'confirm' && value === confirmValue) {
            this.setState({ errorText: '' })
            return true
        } else if (!rule || (rule && validate(rule, value, confirmValue, min))) {
            this.setState({ errorText: '' })
            return true
        } else {
            this.setState({ errorText: errorText })
            return false
        }
    }

    generateField = () => {
        const { rule } = this.props;
        let result;

        switch (rule) {
            case 'select':
                result = this.generateSelect();
                break;

            case 'radio':
                result = this.generateRadios();
                break;

            case 'password':
                result = this.generatePassword();
                break;

            default:
                result = this.generateInput();
                break;
        }

        return result;
    }

    generateInput = () => {
        const { id, name, disabled, readonly, placeholder, type, max, inputClass, rule, autocomplete } = this.props;
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
                className={'rfv-validatedInput__input' + (inputClass ? ' ' + inputClass : '')}
                value={value ? value : ''}
                checked={value ? true : false}
                onChange={this.handleChange}
                onBlur={e => this.onBlur(e, !(rule === 'confirm'))}
                onFocus={this.onFocus}
                autoComplete={autocomplete}
            />
        )
    }

    generateConfirmInput = () => {
        const { id, name, disabled, readonly, placeholder, type, max, inputClass, confirmText, autocomplete } = this.props;
        const { confirmValue } = this.state;

        return (
            <input
                id={id && ('confirm_' + id)}
                name={name && ('confirm_' + name)}
                disabled={disabled ? true : false}
                readOnly={readonly ? true : false}
                placeholder={(placeholder && confirmText) && confirmText + ' ' + placeholder}
                type={type}
                maxLength={max}
                className={'rfv-validatedInput__input' + (inputClass ? ' ' + inputClass : '')}
                value={confirmValue ? confirmValue : ''}
                checked={confirmValue ? true : false}
                onChange={this.handleConfirmChange}
                onBlur={this.onBlur}
                onFocus={this.onFocus}
                autoComplete={autocomplete}
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
                                className={'rfv-validatedInput__input' + (inputClass ? ' ' + inputClass : '')}
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

    generatePassword = () => {
        const { id, name, disabled, readonly, placeholder, max, inputClass, rule, autocomplete } = this.props;
        const { showPassword, passwordStrenght } = this.state;

        return (
            <div style={{ position: 'relative' }}>
                <input
                    id={id}
                    name={name}
                    disabled={disabled ? true : false}
                    readOnly={readonly ? true : false}
                    placeholder={placeholder}
                    type={showPassword ? 'test' : 'password'}
                    style={{ paddingRight: '35px' }}
                    maxLength={max}
                    className={'rfv-validatedInput__input' + (inputClass ? ' ' + inputClass : '')}
                    onChange={this.handleChange}
                    onBlur={e => this.onBlur(e, !(rule === 'confirm'))}
                    onFocus={this.onFocus}
                    autoComplete={autocomplete}
                />
                <img
                    id={id + '_eye'}
                    alt={'eye'}
                    src={_CONFIG._CDN_ADDRESS + eye}
                    style={{
                        maxHeight: '20px',
                        maxWidth: '30px',
                        position: 'absolute',
                        top: '50%',
                        right: '5px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer'
                    }}
                    onClick={() => this.setState({ showPassword: !showPassword })}
                />
                <div
                    id={id + '_strength'}
                    style={{
                        position: 'absolute',
                        left: '0',
                        top: 'calc(100% - 1px)',
                        height: '4px',
                        width: passwordStrenght + '%',
                        minWidth: '5%',
                        background: 'hsl(' + (String(1.1 * passwordStrenght)) + ', 90%, 45%)',
                        transition: 'width .2s'
                    }}
                ></div>
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
                className={'rfv-validatedInput__input' + (inputClass ? ' ' + inputClass : '')}
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
        const { id, title, type, disabled, errorClass, labelClass, children, rule, confirmText } = this.props;
        const { errorText, validate, valid } = this.state;

        return (
            children
                ? (
                    <div onChange={this.handleChange} onBlur={this.onBlur} onFocus={this.onFocus} className={'rfv-validatedInput' + (labelClass ? ' ' + labelClass : '') + ((validate && !disabled && valid) ? ' success' : ' error')}>
                        {children}
                        {validate && !valid && errorText && <p className={'rfv-validatedInput__error' + (errorClass ? ' ' + errorClass : '')}>{errorText}</p>}
                    </div>
                ) : (
                    <>
                        <label htmlFor={id} className={'position-relative rfv-validatedInput' + (labelClass ? ' ' + labelClass : '') + (validate ? ((!disabled && valid) ? ' success' : ' error') : '') + (type ? ' rfv-validatedInput--' + type : '')}>
                            {title && type !== 'checkbox' && <p className={'rfv-validatedInput__title'}>{title}</p>}
                            {this.generateField()}
                            {title && type === 'checkbox' && <><div className='rfv-validatedInput__custom-checkbox'></div><span className={'rfv-validatedInput__title'}> {title}</span></>}
                            {rule !== 'confirm' && validate && !valid && !disabled && errorText && <p className={'rfv-validatedInput__error' + (errorClass ? ' ' + errorClass : '')}>{errorText}</p>}
                        </label>
                        {rule === 'confirm' &&
                            <label htmlFor={id && ('confirm_' + id)} className={'position-relative rfv-validatedInput' + (labelClass ? ' ' + labelClass : '') + (validate ? ((!disabled && valid) ? ' success' : ' error') : '')}>
                                {title && type !== 'checkbox' && <p className={'rfv-validatedInput__title'}>{confirmText + ' ' + title}</p>}
                                {this.generateConfirmInput()}
                                {title && type === 'checkbox' && <><div className='rfv-validatedInput__custom-checkbox'></div><span className={'rfv-validatedInput__title'}> {confirmText + ' ' + title}</span></>}
                                {validate && !valid && !disabled && errorText && <p className={'rfv-validatedInput__error' + (errorClass ? ' ' + errorClass : '')}>{errorText}</p>}
                            </label>
                        }
                    </>
                )
        )
    }
}