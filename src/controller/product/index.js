import Productmodel from '../../models/product.js';
import messageHelper from '../../helpers/messages.js';
import responseHelper from '../../helpers/response.js';


const getProducts = async (req, res, next) => {
	try {	
			let limit = parseInt(req.query.limit);
			let skip = parseInt(req.query.skip);
			let query = req.query.query;
			let criteria = {};
			if(query){
				criteria = {
					...criteria,
					$or: [
						{ productName: { $regex: query, $options:'i' } }
					]
				}
			}
			if (req.query.pagination == 'false') {
				let productlist = await Productmodel.find()
												.select('productName')
												.sort({'productName': 1});
				responseHelper.data(res, productlist, 200, '');
			}
			else {
				let productlist = await Productmodel.find(criteria)
													.select('productName')
													.populate({
														path: 'companyId',
														select: 'companyName'
													})
												//	.skip(skip)
												//	.limit(limit)
													.sort({'productName': 1});
				let totalProductsCount = await Productmodel.countDocuments(criteria);
				responseHelper.page(res, productlist, totalProductsCount, skip, 200);
			}
	}
	catch(err) {
		next(err);
	}
}


const getProductsList = async (req, res, next) => {
	try {	
		const { companyId } = req.params;
				
				let productlist = await Productmodel.find({ companyId: companyId })
												.select('productName')
												.sort({'productName': 1});
				responseHelper.data(res, productlist, 200, '');
			
	}
	catch(err) {
		next(err);
	}
}

const addProduct = async (req, res, next) => {
	try {
		 //destructure the request body
         const {
            companyId,
			productName
         } = req.body;

		 let saveProduct = await new Productmodel({
			companyId,
            productName
         }).save();
		 responseHelper.data(res, saveProduct, 200, messageHelper.PRODUCT_ADDED);

	} catch (error) {
		next(error);
	}
};

const productDetailById = async (req, res, next) => {
	try {
			const { productId } = req.params;
			const product = await Productmodel
									.findOne({ _id: productId })
									.populate("companyId","companyName");
			if (!product) {
				throw Error(messageHelper.PRODUCT_NOT_EXIST);
			}
			responseHelper.data(res, product, 200);
	} catch (err) {
		next(err);
	}
}

const updateProduct = async (req, res, next) => {
	try {
			 //destructure the request body
			 const {
				productId,
				companyId,
				productName
			 } = req.body;

			 var newvalues = { $set: {companyId:companyId, productName: productName} };

			 let result = await Productmodel.updateOne({_id: productId}, newvalues );
		    responseHelper.data(res, result, 200, messageHelper.PRODUCT_UPDATED );
		
	} catch (err) {
		next(err);
	}
}



export default {
	getProducts,
	getProductsList,
	addProduct,
	productDetailById,
	updateProduct
};