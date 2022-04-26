import express from 'express';
import multer from 'multer';
import { companyImgUpload } from '../helpers/aws.js';
import companyController  from '../controller/company/index.js';
import companyValidator  from '../validators/companyValidator.js';
import { verifyToken } from '../middlewares/userAuth.js';

const router = express.Router();
const singleUpload = companyImgUpload.single("companyLogoUrl");

router.get("/getCompaniesList", verifyToken(), companyController.getCompaniesList);
router.post("/addCompany", verifyToken(), function(req, res, next){
    singleUpload(req, res, function(err){
       next(err);
    });
}, companyValidator.addCompanyValidation, companyValidator.requestValidationResult, companyController.addCompany);
router.get("/:companyId/detail", verifyToken(), companyController.companyDetailById);
//router.put("/:companyId", verifyToken(), companyValidator.addCompanyValidation, companyValidator.requestValidationResult, companyController.updateCompany);
router.post("/updateCompany", verifyToken(), function(req, res, next){
    singleUpload(req, res, function(err){
       next(err);
    });
}, companyValidator.addCompanyValidation, companyValidator.requestValidationResult, companyController.updateCompany);

export default router;