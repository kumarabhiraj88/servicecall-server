import express from 'express';
import multer from 'multer';
import { scImgUpload, s3Download } from '../helpers/aws.js';
//import path from 'path';
import servicecallController  from '../controller/servicecall/index.js';
import servicecallValidator  from '../validators/servicecallValidator.js';
import { verifyToken } from '../middlewares/userAuth.js';

const router = express.Router();

const singleUpload = scImgUpload.single("bugAttachmentsUrl");

//For localy storing uploaded images starts.....

// var storage = multer.diskStorage({
//     //here we can set the image upload folder path 
//     //this path will be within the node project folder (like server/uploads/qrcodes/)
//     destination: function (req, file, cb) {
//      cb(null, 'uploads/qrcodes/')
//     },
//     // By default, multer removes file extensions so let's add them back
//     filename: function (req, file, cb) {
//         //file.originalname will show the original image name
//       //path.extname(file.originalname) will get the extension of the file
//       //here any type of file saved in png format
//       cb(null, req.user.userId + '.png') 
//    } });
//   var upload = multer({ storage: storage });

//router.post('/generate-qrcode', verifyToken(), upload.single('bugAttachmentsUrl'), qrcodeController.generateQrcode);

//For localy storing uploaded images ends.....


router.get('/getServicecallsList', verifyToken(), servicecallController.getServicecallsList);
//router.get("/exportServicecall", verifyToken(), servicecallController.exportServicecall);
//router.post("/addServicecall",[[multer().single("bugAttachments")], verifyToken()], servicecallController.addServicecall);
router.post("/addServicecall",verifyToken(), function(req, res, next){
    singleUpload(req, res, function(err){
       next(err);
    });
}, servicecallValidator.addServicecallValidation, servicecallValidator.requestValidationResult, servicecallController.addServicecall);
// router.post("/addServicecallComments",[[multer().single("bugAttachments")], verifyToken()], servicecallController.addServicecallTrans);
router.put("/:bugMasterId", verifyToken(), servicecallController.updateServicecall);
router.delete("/:bugMasterId/delete", verifyToken(), servicecallController.deleteServicecall);
router.get("/:Id/detail", verifyToken(), servicecallController.servicecallDetailById);
router.get("/:statusId/count", verifyToken(), servicecallController.getServicecallsDashboard);

//SERVICECALL COMMENTS
router.get('/comment/getCommentsList', verifyToken(), servicecallController.getCommentsList);
router.post("/comment/addComment",verifyToken(), function(req, res, next){
    singleUpload(req, res, function(err){
       next(err);
    });
}, servicecallValidator.addCommentValidation, servicecallValidator.requestValidationResult, servicecallController.addComment);
router.post("/comment/updateComment", verifyToken(), function(req, res, next){
    singleUpload(req, res, function(err){
       next(err);
    });
}, servicecallValidator.addCommentValidation, servicecallValidator.requestValidationResult, servicecallController.updateComment);
router.delete("/comment/:commentId/delete", verifyToken(), servicecallController.deleteComment);
router.get("/comment/:Id/detail", verifyToken(), servicecallController.commentDetailById);
router.post("/comment/downloadImg",  function(req, res, next){
    
    req.body.filename='https://servicecalluploads.s3.ap-south-1.amazonaws.com/1623914503385email.PNG';
     s3Download(req, res, (err)=>{
        if(err){
            next(err);
        }
        else {
                console.log("File downloaded");
        }
    });

});

export default router;