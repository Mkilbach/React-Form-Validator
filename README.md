# React Form Validator v0.2 :ocean: :fire:

React Form Validator is a library allowing to create controlled in JSX with no DOM structure restrictions.

## instalation

TBA

## Usage

Import these components
```
import { Form, Link } from path/formValidator
```

`Form` is a wrapping component. All your inputs must be inserted inside.
```
return (
    <Form>
        <h2>Form</h2>
        <Input />
        <Input />
        <Input />
    </Form>
)
```

`Input` component in its basic form returns:
```
<label>
    <p>title</p>
    <input>
    <p>error<p>
</label>
``` 

Alternatively you can define your own children structure just by inserting your DOM elements inside `Input` compnent, however this method is suggested to be used `only with radio elements`.

## Form props
All props are optional.

* **onSubmit**: will execute on form submit only after validation has passed. Gets form values object as an argument.
    ```
        <Form onSubmit={result => customSubmit(result)}>
            ...
        </Form>
    ```

* **onFailure**: will execute on form submit only after validation has *not* passed.
* **requiredErrorText**: passed string will be displayed after validation for all required inputs that are empty
* **id**: form ID
* **className**: form class

## Input props
All props except **id** are optional.

* **id**: is `required` and must be `unique`
* **name**: adds [name](https://www.w3schools.com/TAGS/att_input_name.asp) attribute. **Required if you want to pass this input value to onSubmit result object**
* **required**: decides whether input should be validated by default no matter its value or not
* **readonly**: adds [readonly](https://www.w3schools.com/tags/att_input_readonly.asp) attribute
* **disabled**: adds [disabled](https://www.w3schools.com/tags/att_input_disabled.asp) attribute
* **rule**: decides the validation rule for the input ([available rules list](#validation-rules))
* **title**: recieves string for title above the input element
* **confirmPrefix**: recieves string that is placed before confirm input title 
* **placeholder**: adds [placeholder](https://www.w3schools.com/tags/att_input_placeholder.asp) attribute
* **type**: adds [type](https://www.w3schools.com/html/html_form_input_types.asp) attribute ([supported types list](#supported-input-types))
* **errorText**: string that will show as an error message for this input
* **minErrorText**: string that will show as an error message for this input when value shorter than minimum length
* **value**: initial value for that input
* **min**: minimum length for input value
* **max**: maximum length for input value
* **inputClass**: class name that will be added to input element
* **errorClass**: class name that will be added to error element
* **labelClass**: class name that will be added to label element
* **onBeforeChange**: executed right before the input is changed
* **onAfterChange**: executed after the input is changed
* **onFocus**: executed when the input is focused
* **onBlur**: executed when the input is blurred
* **inputOptions**: only works with and **is required for radio and select type**. You can pass array cointaining available options for that input. Option can be either string (when value and name are the same) or array with two values - option value and option name.

    ```
    <Input inputOptions={[['value', 'name'], 'value same as name']} />
    ```

* **group**: allows to group results of submitted form object into groups

    #### JSX:
    ```
    <Form>
        <Input name={'groupElement1'} group={'group'} value={1} />
        <Input name={'groupElement2'} group={'group'} value={2} />
        <Input name={'element'} value={0} />
    <Form />
    ```

    #### Result:
    ```
    {
        group: {
            groupElement1: 1,
            groupElement2: 2
        },
        element: 0
    }
    ```

## Supported input types

* text
* number
* email
* phone
* select
* radio
* checkbox
* hidden

## Validation rules

* **text** - any string
* **letters** - only letters and spaces allowed
* **number** - only numbers available with no whitespaces
* **email** - passes only with proper email address given
* **zip-code** - only numbers with optional hyphen
* **phone** - only numbers with optional hyphens and spaces
* **confirm** - creates two inputs that must contain same values to pass
* **select/radio/checkbox** - checks if option is selected/checked