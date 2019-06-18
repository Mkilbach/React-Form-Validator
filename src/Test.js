import React, { Component } from 'react'

import Form from "./components/FormValidator/Form";
import Input from "./components/FormValidator/Input";

export default class Test extends Component {
    state = {
        test: true
    }

    render() {
        return (
            <>
                <Form onSubmit={res => console.log(res)}>
                    <Input type={'radio'} id={'radio'} defaultValue={22} group={'test'} inputOptions={[[12, 22], 3, 4]} name={'test2'} title={'radios'} />
                    <div>
                        <h2>
                            Input
                    </h2>
                        <div>
                            <Input id={'id'} name={'name'} max={7} checked={false} group={'test'} type={'checkbox'} title={'title'} rule={'select'} inputOptions={[[1, 2], 3, 4, [5, 6]]} required={true} errorText={'only numbers allowed'} />
                            {this.state.test && 
                            <Input name={'name2'} type={'text'} title={'title'} rule={'text'} required={true}/>}
                        </div>
                    </div>
                    <div>
                        <Input id={'input'} name={'name'} max={7} type={'input'} title={'input'} rule={'text'} required={false} min={2} errorText={'not allowed'} />
                    </div>
                    <Input type={'select'} errorClass={'customerror'} labelClass={'customlabel'} rule={'select'} inputOptions={[[12, 22], 3, 4, [5, 6]]} name={'select'} required={true} title={'select'} placeholder={'select your option'} />

                    <Input name="wrapper" required={true}>
                        <h5>radio1</h5>
                        <label htmlFor="radio1">
                            <input type='radio' id='radio1' name='test' value={1} /> <span>radio1</span>
                        </label>
                        <div>
                            <h5>radio2</h5>
                            <label htmlFor="radio2">
                                <input type="radio" name="test" id="radio2" value={'aaa'} /> <span>radio2</span>
                            </label>
                        </div>
                        <div>
                            <div>
                                <h5>radio3</h5>
                                <label htmlFor="radio3">
                                    <input type="radio" name="test" id="radio3" value={33} /> <span>radio2</span>
                                </label>
                            </div>
                        </div>
                    </Input>
                    <button type="submit">submit</button>
                </Form>

                <button onClick={() => this.setState({ test: !this.state.test })}>test</button>
            </>
        )
    }
}
