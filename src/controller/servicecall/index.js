// const awsHelper = require('../../helpers/aws');

import bugMasterModel from '../../models/bugMaster.js';
import bugTransModel from '../../models/bugTransactions.js';
import messageHelper from '../../helpers/messages.js';
import responseHelper from '../../helpers/response.js';

import { s3delete } from '../../helpers/aws.js';


const getServicecallsDashboard = async (req, res, next) => {
	try {
		
			let loggedPrivilegeId = req.query.loggedPrivilegeId;
			let loggedCompanyId = req.query.loggedCompanyId;
			const { statusId }  = req.params;
			let condition = {};
			if(loggedPrivilegeId=='3'){
				condition = { bugStatus: statusId, companyId: loggedCompanyId};
			}
			else{
				condition = { bugStatus: statusId };
			}
			
			let servicecallCount = await bugMasterModel.find(condition).countDocuments();
			responseHelper.data(res, servicecallCount, 200, '');									
	}
	catch(err) {
		next(err);
	}
}

const getServicecallsList = async (req, res, next) => {
	try { 
			let limit = parseInt(req.query.limit);
			let skip = parseInt(req.query.skip);
			let query = req.query.query;
			let criteria = {};

			console.log(query);
			

			let loggedPrivilegeId = req.query.loggedPrivilegeId;
			let loggedUserId = req.query.loggedUserId;
			

			if(loggedPrivilegeId == '3')
			{ 
				let loggedCompanyId = req.query.loggedCompanyId;
				
				//if Client
				criteria = { $and: [
											{ 
												//filedBy : req.query.loggedUserId 
												companyId: loggedCompanyId
											}
										]
								};
			}
			else if (loggedPrivilegeId == '2') 
			{
				//if implementor
				criteria = { $and: [
											{ 
												assignedTo : req.query.loggedUserId 
											}
										]
								};
			}

			

			 if(query){
			 	criteria = {
			 		...criteria,
			 		$or: [
			 			{ bugId: { $regex: query } },
			 			{ companyName: { $regex: query, $options:'i' } },
			 			{ productName: { $regex: query, $options:'i' } },
						{ bugStatus: { $regex: query, $options:'i' } }
			 		]
			 	}
			 }

			if (req.query.pagination == 'false') { 
				let servicecalllist = await bugMasterModel.find()
												.select('bugId')
												.populate({
														path: 'companyId',
														select: 'companyName'
													})
												.populate({
														path: 'productId',
														select: 'productName'
													})
												.populate({
														path: 'filedBy',
														select: 'fullName'
													})
												.populate({
														path: 'assignedTo',
														select: 'fullName'
													})
												.sort({'_id': -1});
				responseHelper.data(res, servicecalllist, 200, '');

			}
			else { 
			let servicecalllist = await bugMasterModel.find(criteria)
												.select('bugId bugStatus expectedCompletionDate')
												.populate({
														path: 'companyId',
														select: 'companyName'
													})
												.populate({
														path: 'productId',
														select: 'productName'
													})
												.populate({
														path: 'filedBy',
														select: 'fullName'
													})
												.populate({
														path: 'assignedTo',
														select: 'fullName'
													})
												//.skip(skip)
												//.limit(limit)
												.sort({'_id': -1});

			let totalServicecallsCount = await bugMasterModel.countDocuments(criteria);
			console.log(totalServicecallsCount);
			responseHelper.page(res, servicecalllist, totalServicecallsCount, skip, 200);
		}
	}
	catch(err) {
		next(err);
	}
}

const addServicecall = async (req, res, next) => {
	try {
			//const uploadPath = req.file ? req.file.location : '';
			const uploadPath = req.file ? req.file.key : '';
			let scMasterForm;
			if(req.body.assignedTo=="")
			{
				scMasterForm = {  
					companyId: req.body.companyId,
					productId: req.body.productId,
					filedBy: req.body.filedBy,
					expectedCompletionDate: req.body.expectedCompletionDate,
					bugStatus: req.body.bugStatus
				}
			}
			else{
				scMasterForm = {  
					companyId: req.body.companyId,
					productId: req.body.productId,
					filedBy: req.body.filedBy,
					assignedTo: req.body.assignedTo,
					expectedCompletionDate: req.body.expectedCompletionDate,
					bugStatus: req.body.bugStatus
				}
			}
			//here just pass the values to the model to get the _id(masterId) for transaction table
			//and save this to master table with insertion in transaction table 
			let saveScMaster = new bugMasterModel(scMasterForm);
			
			let saveScTransactions= new bugTransModel({
							masterId: saveScMaster._id,
							bugDescription: req.body.bugDescription,
							bugAttachmentsUrl: uploadPath,
							updatedBy: req.body.filedBy,
						});
			await saveScTransactions.save();
			
			//pushing the master id to the transaction array and then saving the array in Master table
			//unshift() is an array function in Node.js, used to insert element to the front of an array.
			saveScMaster.bugChild.unshift(saveScTransactions._id);
			await saveScMaster.save();

			responseHelper.data(res, saveScMaster, 200, messageHelper.SERVICECALL_ADDED);
	}
 catch (error) {
			next(error);
		}
	};
	

// const addServicecall = async (req, res, next) => {
// 	try {
// 		let sessionUserId = await getSessionUserId(req);
// 		//req.body.filedBy=sessionUserId;

// 		//console.log(req);
// 		let scMasterForm = {  companyId: req.body.companyId,
// 							  productId: req.body.productId,
// 							  filedBy: sessionUserId,
// 							  assignedTo: req.body.assignedTo,
// 							  expectedCompletionDate: req.body.expectedCompletionDate,
// 							  bugStatus: req.body.bugStatus
// 							}
							
// 		//let servicecallForm = await servicecallValidator.addServicecall.validateAsync(scMasterForm);
		
// 		let saveScMaster = new bugMasterModel(scMasterForm);

// 		// if (req.file) {
// 		// 	const scImageUrl = await awsHelper.s3Upload(
// 		// 		req.file,
// 		// 		'scImages'
// 		// 	);
// 		// 	if (scImageUrl.errors) {
// 		// 		throw Error(scImageUrl.message);
// 		// 	}
// 		// 	bugAttachmentsUrl = scImageUrl;
// 		// }
// 		// else { bugAttachmentsUrl = ''; }


// 		let saveScTransactions= new bugTransModel({
// 			masterId: saveScMaster._id,
// 			bugDescription: req.body.bugDescription,
// 			//bugAttachments: bugAttachmentsUrl,
// 			updatedBy: sessionUserId,
// 		});

// 		await saveScTransactions.save();
// 		//unshift() is an array function in Node.js, used to insert element to the front of an array.
// 		saveScMaster.bugChild.unshift(saveScTransactions._id)
// 		await saveScMaster.save();

// 		responseHelper.data(res, saveScMaster, 200, messageHelper.SERVICECALL_ADDED);
// 	} catch (error) {
// 		next(error);
// 	}
// };


const servicecallDetailById = async (req, res, next) => {
	try { 
			const { Id }  = req.params;
			const servicecall = await bugMasterModel
									.findOne({ _id: Id })
									.select('bugId expectedCompletionDate bugStatus createdAt')
									.populate({
										path: 'companyId',
										select: 'companyName'
									})
									.populate({
											path: 'productId',
											select: 'productName'
										})
									.populate({
											path: 'filedBy',
											select: 'fullName'
										})
									.populate({
											path: 'assignedTo',
											select: 'fullName'
										})
										// .aggregate([
										// 	{ $lookup:
										// 	   {
										// 		 from: 'bugtransactions',
										// 		 localField: 'masterId',
										// 		 foreignField: '_id',
										// 		 as: 'transactiondetails'
										// 	   }
										// 	 }
										// 	]).toArray()
									
									.populate({
												 path: 'bugChild',
												// model: 'bugtransactions',
												 select: 'bugDescription bugAttachmentsUrl updatedBy',
												 populate: {
														 path: 'updatedBy',
														 model: 'user',
														 select: 'fullName'
												 		}
											});
			if (!servicecall) {
				throw Error(messageHelper.SERVICECALL_NOT_EXIST);
			}
			responseHelper.data(res, servicecall, 200);
	} catch (err) {
		next(err);
	}
}

const updateServicecall = async (req, res, next) => {
	try {
			//delete req.body.bugId;
			const { bugMasterId } = req.params;

			//fetching the db status to compare with the new status from the form
			//if both are not same, then create a transaction with new status for a log purpose
			const transaction = await bugMasterModel
									.findOne({ _id: bugMasterId })
									.select('bugStatus bugChild');
			
			let scMasterForm={};
			if(req.body.assignedTo=="")
			{
				scMasterForm = {  
										companyId: req.body.companyId,
										productId: req.body.productId,
										//filedBy: sessionUserId,
										expectedCompletionDate: req.body.expectedCompletionDate,
										bugStatus: req.body.bugStatus,
										bugChild: transaction.bugChild
								}
								
			}
			else{

				scMasterForm = { 
										companyId: req.body.companyId,
										productId: req.body.productId,
										//filedBy: sessionUserId,
										assignedTo: req.body.assignedTo,
										expectedCompletionDate: req.body.expectedCompletionDate,
										bugStatus: req.body.bugStatus,
										bugChild: transaction.bugChild
										
								}
								
			}

							
			if(transaction.bugStatus != req.body.bugStatus){
				let saveScTransactions= new bugTransModel({
					masterId: bugMasterId,
					bugDescription: 'Status changed',
					changedStatus: req.body.bugStatus,
					bugAttachmentsUrl: "",
					updatedBy: req.body.filedBy,
				});
			await saveScTransactions.save();
			scMasterForm.bugChild.unshift(saveScTransactions._id);
			}
			const servicecall = await bugMasterModel.updateOne({_id: bugMasterId}, scMasterForm );
			if (!servicecall) {
				throw Error(messageHelper.SERVICECALL_NOT_EXIST);
			}
			responseHelper.data(res, servicecall, 200, messageHelper.SERVICECALL_UPDATED);
		
	} catch (err) {
		next(err);
	}
}


// const exportServicecall = async (req, res, next) => {
// 	try {

// 		let servicecall = await bugMasterModel.find()
// 												.select('bugId bugStatus createdAt')
// 												.populate({
// 														path: 'companyId',
// 														select: 'companyName'
// 													})
// 												.populate({
// 														path: 'productId',
// 														select: 'productName'
// 													})
// 												.populate({
// 														path: 'filedBy',
// 														select: 'Name'
// 													})
// 												.sort({'_id': -1});

// 		responseHelper.data(res, servicecall, 200);
// 	} catch (error) {
// 		next(error);
// 	}
// };

const deleteServicecall = async (req, res, next) => {
	try {
		const { bugMasterId } = req.params;
		let servicecall = await bugMasterModel.deleteOne({'_id': bugMasterId});

		//fetch the file name of the transaction to delete file from s3 bucket
		const result = await bugTransModel.find({ masterId: bugMasterId }).select('bugAttachmentsUrl');
			result.map((item)=>{
				//Passing the file name to aws page  to delete the file
				//console.log(item.bugAttachmentsUrl);
				s3delete(item.bugAttachmentsUrl);	
			})
				
		let bugTransactions = await bugTransModel.deleteMany({'masterId':bugMasterId})
												
		responseHelper.data(res, servicecall, 200, messageHelper.SERVICECALL_DELETED);
	} catch (error) {
		next(error);
	}
};


//SERVICECALL COMMENTS

const getCommentsList = async (req, res, next) => {
	try { 
			let masterId = req.query.masterId;
			let limit = parseInt(req.query.limit);
			let skip = parseInt(req.query.skip);
			let query = req.query.query;
			
			let criteria = {masterId: masterId};
			//  if(query){ 
			//  	criteria = {
			//  		...criteria,
			//  		$or: [
			//  			{ bugDescription: { $regex: query } },
			//  			{ updatedBy: { $regex: query, $options:'i' } },
			//  		],
			// 		$and: [{ masterId: masterId}]
			//  	}
			//  }

			
			let commentist = await bugTransModel.find(criteria)
												.select('bugDescription bugAttachmentsUrl changedStatus updatedAt')
												.populate({
													path: 'updatedBy',
													select: 'fullName'
												})
												.skip(skip)
												.limit(limit)
												.sort({'_id': -1});

			let totalCommentsCount = await bugTransModel.countDocuments(criteria);
			responseHelper.page(res, commentist, totalCommentsCount, skip, 200);
		
	}
	catch(err) {
		next(err);
	}
}


const commentDetailById = async (req, res, next) => {
	try { 
			const { Id }  = req.params;
			const comment = await bugTransModel
									.findOne({ _id: Id })
									.select('bugDescription bugAttachmentsUrl masterId updatedAt')
									.populate({
											path: 'updatedBy',
											select: 'fullName'
										})
								
			if (!comment) {
				throw Error(messageHelper.COMMENT_NOT_EXIST);
			}
			responseHelper.data(res, comment, 200);
	} catch (err) {
		next(err);
	}
}

const addComment = async (req, res, next) => {
	try {
			// originalname: 'Dashboard sample.png',
			//key: '60ae1f44f46de433cc52d0f2Dashboard sample.png',
			//const uploadPath = req.file ? req.file.location : '';
			const uploadPath = req.file ? req.file.key : '';

			//save comments to the transaction table
			let saveScTransactions= await new bugTransModel({
							masterId: req.body.masterId,
							bugDescription: req.body.bugDescription,
							bugAttachmentsUrl: uploadPath,
							updatedBy: req.body.updatedBy,
						}).save();
			
			let scMasterForm = {  
				bugChild: saveScTransactions._id
			  }
			//update those transaction ids to the master table
			let scMaster = await bugMasterModel.updateOne({ _id: req.body.masterId },  { $addToSet: scMasterForm })
			
			let responseData = { 
                masterId: req.body.masterId 
                };
			responseHelper.data(res, responseData, 200, messageHelper.COMMENT_ADDED);
	}
 catch (error) {
			next(error);
		}
	};

const updateComment = async (req, res, next) => {
	try {	
		
			//Passing the file name to aws page  to delete the old file
			s3delete(req.body.bugAttachmentsUrlOld);

			//const uploadPath = req.file ? req.file.location : req.body.bugAttachmentsUrl;
			const uploadPath = req.file ? req.file.key : req.body.bugAttachmentsUrl;
			const commentId = req.body.commentId;
			
			let scTransactionForm = {  
								bugDescription: req.body.bugDescription,
								bugAttachmentsUrl: uploadPath,
								updatedBy: req.body.updatedBy
			  }

			let saveScTransactions = await bugTransModel.updateOne({_id: commentId}, scTransactionForm, { new: true } );

			let responseData = { 
                masterId: req.body.masterId 
                };
			responseHelper.data(res, responseData, 200, messageHelper.COMMENT_UPDATED);
		
	} catch (err) {
		next(err);
	}
}

const deleteComment = async (req, res, next) => {
	try { 
		const { commentId } = req.params;

		const transResult = await bugTransModel.findOne({ _id: commentId }).select('masterId');
		
		//fetch the file name of the transaction to delete file from s3 bucket
		const result = await bugTransModel.findOne({ _id: commentId }).select('bugAttachmentsUrl');

		//Passing the file name to aws page  to delete the file
		s3delete(result.bugAttachmentsUrl);						

		let bugTransactions = await bugTransModel.deleteMany({'_id':commentId});
		
		//https://servicecalluploads.s3.ap-south-1.amazonaws.com/60ae1f44f46de433cc52d0f2em.PNG
		//console.log(bugTransactions);
		let responseData = { 
			masterId: transResult.masterId 
			};

		responseHelper.data(res, responseData, 200, messageHelper.COMMENT_DELETED);
	} catch (error) {
		next(error);
	}
};



export default {
    getServicecallsList,
    addServicecall,
    servicecallDetailById,
	updateServicecall,
	getServicecallsDashboard,
	//exportServicecall,
	deleteServicecall,

	getCommentsList,
	commentDetailById,
	addComment,
	updateComment,
	deleteComment
}