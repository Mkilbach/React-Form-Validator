import React, { Component } from 'react'

import Input from "./Input";
import ReCAPTCHA from "react-google-recaptcha";
import _SHOP_CONFIG from '../config';

export default class Form extends Component {

    constructor(props) {
        super(props);
        this.recaptchaRef = React.createRef();
    }

    state = {
        valid: false,
        validateAll: false,
        inputsRefs: [],
        childrenWithProps: null,
        recaptchaCode: null
    }

    recaptcha = () => {
        if (!this.recaptchaRef.current.getValue()) this.recaptchaRef.current.execute();
    }

    handleRecaptcha = async recaptchaCode => {
        this.setState({ recaptchaCode }, this.handleSubmit());
    }

    handleSubmit = (e = null) => {
        e && e.preventDefault();
        const { inputsRefs } = this.state;
        inputsRefs.length && this.checkInputsValidity(inputsRefs);
    }

    checkInputsValidity = async inputs => {
        const { validateAll } = this.state;
        let valid = true;

        inputs.forEach(el => { if (el.current && el.current.state && !el.current.state.valid && !el.current.props.disabled) valid = false });

        if (valid) {
            const { inputsRefs, recaptchaCode } = this.state;
            const { onSubmit, recaptcha } = this.props;

            // CREATE RESULT OBJECT
            const result = {};
            inputsRefs.forEach(elRef => {
                if (elRef.current) {
                    const { props, state } = elRef.current;
                    if (!props.disabled && props.name && state.value) {
                        if (props.group && !result[props.group]) result[props.group] = {};
                        props.group ? result[props.group][props.name] = state.value : result[props.name] = state.value;
                    }
                }
            });

            if (!recaptcha) onSubmit && onSubmit(result);
            else { recaptchaCode ? onSubmit({ ...result, recaptchaCode }) : this.recaptcha() };
        } else {
            !validateAll && this.setState({ validateAll: true });
            this.setState({ childrenWithProps: await this.cloneChildrenWithProps() });
            const { onFailure } = this.props;
            onFailure && onFailure();
        }
    }

    async componentDidMount() {
        const { recaptcha } = this.props;
        recaptcha && this.recaptchaRef.current.reset();
        this.setState({ childrenWithProps: await this.cloneChildrenWithProps() });
    }

    async componentDidUpdate(prevProps) {
        if (prevProps !== this.props) this.setState({ childrenWithProps: await this.cloneChildrenWithProps() });
    }

    cloneChildrenWithProps = async () => {
        await new Promise((resolve) => this.setState({ inputsRefs: [] }, resolve));
        return this.recursiveCloneChildren(this.props.children);
    }

    recursiveCloneChildren = children => {
        const { validateAll } = this.state;
        const { requiredErrorText, disabled } = this.props;
        return React.Children.map(children, child => {
            if (!React.isValidElement(child)) return child;
            let childProps = {};
            if (child.type && child.type === Input) {
                const newRef = React.createRef();

                this.setState({ inputsRefs: [...this.state.inputsRefs, newRef] });

                childProps = {
                    validateAll: validateAll,
                    requiredErrorText: requiredErrorText,
                    ref: newRef
                }
                if (disabled) childProps.disabled = true;
            }
            childProps.children = this.recursiveCloneChildren(child.props.children);
            return React.cloneElement(child, childProps);
        })
    }

    handleKeyDown = e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleSubmit(e);
        }
    }

    render() {
        const { id, className, recaptcha, autocomplete } = this.props;

        // pass recaptcha info to given ref
        (this.props.recaptchaInfoRef && this.props.recaptchaInfoRef.current && (this.props.recaptchaInfoRef.current.innerHTML = '<p>This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="blank">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="blank">Terms of Service</a> apply.</p>'));

        return (
            <form onSubmit={this.handleSubmit} id={id} className={className} onKeyDown={e => this.handleKeyDown(e)} autoComplete={autocomplete}>
                {this.state.childrenWithProps}
                {recaptcha
                    ? (
                        <>
                            <div style={{ display: 'none' }}>
                                <ReCAPTCHA
                                    sitekey={_SHOP_CONFIG._RECAPTCHA_SITEKEY || ''}
                                    onChange={this.handleRecaptcha}
                                    size='invisible'
                                    ref={this.recaptchaRef}
                                />
                            </div>
                            {this.props.recaptchaInfoRef === undefined
                                ? (
                                    <p className="rfv-recaptcha-info">
                                        This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target='blank'>Privacy Policy</a> and <a href="https://policies.google.com/terms" target='blank'>Terms of Service</a> apply.
                                    </p>
                                ) : null
                            }
                        </>
                    )
                    : null
                }
            </form>
        )
    }
}
