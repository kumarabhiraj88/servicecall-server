import validator from 'express-validator';
import messageHelper from '../helpers/messages.js';
import responseHelper from '../helpers/response.js';

//if any error happends with check() then passes to validationResult()
const { check, validationResult } = validator;

//here checking with the urlparsed data from forms whether it is valid or not
const addServicecallValidation = [
    check('companyId')
    .notEmpty()
    .withMessage('Company is required'),
    check('productId')
    .notEmpty()
    .withMessage('Product is required'),
    check('bugDescription')
    .notEmpty()
    .withMessage('Description is required'),
    // check('assignedTo')
    // .notEmpty()
    // .withMessage('Choose the Implementor'),
    
];

const addCommentValidation = [
    check('bugDescription')
    .notEmpty()
    .withMessage('Comment is required'),
    
];


const requestValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if(errors.array().length > 0){
      responseHelper.failure(res, errors.array()[0].msg);
    }
    else{
        next();
    }
}

export default {
    addServicecallValidation,
    addCommentValidation,
    requestValidationResult
}