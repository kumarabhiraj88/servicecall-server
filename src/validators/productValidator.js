import validator from 'express-validator';
import messageHelper from '../helpers/messages.js';
import responseHelper from '../helpers/response.js';

//if any error happends with check() then passes to validationResult()
const { check, validationResult } = validator;

//here checking with the urlparsed data from forms whether it is valid or not
const addProductValidation = [
    check('companyId')
    .notEmpty()
    .withMessage('Company is required'),
    check('productName')
    .notEmpty()
    .withMessage('Product is required')
];


const requestValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if(errors.array().length > 0){
      responseHelper.failure(res, errors.array()[0].msg);
    }
    else{
        next();
    }
}

export default {
    addProductValidation,
    requestValidationResult
}