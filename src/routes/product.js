import express from 'express';
import productController  from '../controller/product/index.js';
import productValidator  from '../validators/productValidator.js';
import { verifyToken } from '../middlewares/userAuth.js';

const router = express.Router();

router.get("/getProducts", verifyToken(), productController.getProducts);
router.get("/getProductsList/:companyId", verifyToken(), productController.getProductsList);
router.post("/addproduct", verifyToken(), productValidator.addProductValidation, productValidator.requestValidationResult, productController.addProduct);
router.get("/:productId/detail", verifyToken(), productController.productDetailById);
router.put("/:productId", verifyToken(), productController.updateProduct);

export default router;