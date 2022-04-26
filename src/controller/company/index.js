import Companymodel from '../../models/company.js';
import messageHelper from '../../helpers/messages.js';
import responseHelper from '../../helpers/response.js';


const getCompaniesList = async (req, res, next) => {
	try {
			let limit = parseInt(req.query.limit);
			let skip = parseInt(req.query.skip);
			let query = req.query.query;
			let criteria = {};
			if(query){
				criteria = {
					...criteria,
					$or: [
						{ companyName: { $regex: query, $options:'i' } }
					]
				}
			}

			if (req.query.pagination == 'false') {
				let companylist = await Companymodel.find()
												.select('companyName')
												.sort({'companyName': 1});
			responseHelper.data(res, companylist, 200, '');
			}
			else {
			let companylist = await Companymodel.find(criteria)
												.select('companyName')
											//	.skip(skip)
											//	.limit(limit)
												.sort({'companyName': 1});
			let totalCompaniesCount = await Companymodel.countDocuments(criteria);
			responseHelper.page(res, companylist, totalCompaniesCount, skip, 200);
		}
	}
	catch(err) {
		next(err);
	}
}

/* add company */
const addCompany = async (req, res, next) => {
	try {

		let companyExists = await Companymodel.findOne({ companyName: req.body.companyName}); 
        if(companyExists){
            throw Error(messageHelper.COMPANY_EXIST);
         }

		 const uploadPath = req.file ? req.file.key.substring(req.file.key.lastIndexOf('/') + 1) : '';
         //destructure the request body
         const {
            companyName
         } = req.body;

        //here password not need to be hashed, bcz it is passed to Usermodel before saving
        //it is hashed from Usermodel. (there is a query is written for hashing)
         let saveCompany = await new Companymodel({
            companyName: companyName,
			companyLogo: uploadPath
			
         }).save();

		responseHelper.data(res, saveCompany, 200, messageHelper.COMPANY_ADDED);
	} catch (error) {
		next(error);
	}
};

const companyDetailById = async (req, res, next) => {
	try {
			const { companyId } = req.params;
			const company = await Companymodel
									.findOne({ _id: companyId });
			if (!company) {
				throw Error(messageHelper.COMPANY_NOT_EXIST);
			}
			responseHelper.data(res, company, 200);
	} catch (err) {
		next(err);
	}
}

const updateCompany = async (req, res, next) => {
	try {


			const uploadPath = req.file ? req.file.key.substring(req.file.key.lastIndexOf('/') + 1) : req.body.companyLogoUrl;

			//destructure the request body
			const {
				companyId,
				companyName
			} = req.body;

			
			
			let companyExists = await Companymodel.findOne({ companyName:companyName, _id: { $ne: companyId } }); 
			
			if(companyExists){
				 throw Error(messageHelper.COMPANY_EXIST);
			}
			var newvalues = { $set: {companyName: companyName, companyLogoUrl: uploadPath} };

			let result = await Companymodel.updateOne({_id: companyId}, newvalues );
		    responseHelper.data(res, result, 200, messageHelper.COMPANY_UPDATED );
		
	} catch (err) {
		next(err);
	}
}


export default {
	getCompaniesList,
	addCompany,
	companyDetailById,
	updateCompany
};