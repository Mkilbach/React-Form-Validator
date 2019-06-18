import React, { Component } from 'react'

import Input from "./Input";

export default class Form extends Component {
    state = {
        valid: false,
        validateAll: false,
        index: 0,
        inputsRefs: [],
        childrenWithProps: null
    }

    handleSubmit = e => {
        e.preventDefault();

        const { inputsRefs } = this.state;

        inputsRefs.length && this.checkInputsValidity(inputsRefs);
    }

    checkInputsValidity = async inputs => {
        const { validateAll } = this.state;
        let valid = true;

        inputs.forEach(el => !el.current.state.valid && (valid = false));

        if (valid) {
            const { inputsRefs } = this.state;

            // CREATE RESULT OBJECT
            const result = {};
            inputsRefs.forEach(elRef => {
                const { props, state } = elRef.current;
                if (!props.disabled && props.name && state.value) {
                    if (props.group && !result[props.group]) result[props.group] = {};
                    props.group ? result[props.group][props.name] = state.value : result[props.name] = state.value;
                }
            });

            // INVOKE FUN PASSED TO FORM COMPONENT WITH RESULT AS ARGUMENT
            const { onSubmit } = this.props;
            onSubmit && onSubmit(result);
        } else {
            !validateAll && this.setState({ validateAll: true });
            this.setState({ childrenWithProps: await this.cloneChildrenWithProps() });
        }
    }

    async componentDidMount() {
        this.setState({ childrenWithProps: await this.cloneChildrenWithProps() });
    }

    cloneChildrenWithProps = async () => {
        await this.setState({ inputsRefs: [] });
        return this.recursiveCloneChildren(this.props.children);
    }

    recursiveCloneChildren = children => {
        const { validateAll } = this.state;
        const { requiredErrorText } = this.props;
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
            }
            childProps.children = this.recursiveCloneChildren(child.props.children);
            return React.cloneElement(child, childProps);
        })
    }

    render() {

        return (
            <form onSubmit={this.handleSubmit}>
                {this.state.childrenWithProps}
            </form>
        )
    }
}
