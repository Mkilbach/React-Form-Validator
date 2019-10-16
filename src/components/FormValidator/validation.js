const validate = (rule, value, value2, min) => {
    let result = false;
    let regex;

    switch (rule) {
        case 'text':
            regex = /.*[^ ].*/;
            result = regex.test(String(value).toLowerCase());
            break;

        case 'number':
            regex = /^[0-9]*$/;
            result = regex.test(String(value).toLowerCase());
            break;

        case 'email':
            regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            result = regex.test(String(value).toLowerCase());
            break;

        case 'zip-code':
            regex = /[\d -]+/;
            result = regex.test(String(value).toLowerCase());
            break;

        case 'phone':
            regex = /1?-?\.?\(?\d{3}[-).\s]?\d{3}[-.\s]?\d{3}/;
            result = regex.test(String(value).toLowerCase());
            break;

        case 'confirm':
            result = value === value2 ? true : false;
            break;

        case 'password':
            const regexString = '(?=^.{' + min + ',}$)(?=.*\\d)(?=.*[A-Z])(?=.*[a-z]).*$';
            regex = new RegExp(regexString);
            result = regex.test(String(value));
            break;

        case 'select':
        case 'radio':
        case 'checkbox':
            result = value ? true : false;
            break;

        default:
            break;
    }
    return result;
}

export default validate;