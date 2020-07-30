const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    commentId: String,
    date: Date,
    comment: String,
    upvotes: Number,
    comenter: String,
    avatar: String,
    comenterId: String,
    deleted: Boolean,
    suppressed: Boolean,
})

const imageSchema = new Schema({
    userId: String,
    imageId: String,
    reviewStatus: Boolean,
    payStatus: Boolean,
    deleted: Boolean,
    views: Number,
    reports: Number,
    fileName: String,
    thumbNail: String,
    width: Number,
    height: Number,
    date: Date,
    caption: String,
    paymentRequest: String,
    upvotes: Number,
    sats: Number,
    numberOfComments: Number,
    fileType: String,
    ogType: String,
    orientation: String,
    twitterCard: String,
    suppressed: Boolean,
    comments: [commentSchema],

});

const accountSchema = new Schema({
    password: String,
    email: String,
    thirdPartyId: String,
    estimatedSats: Number,
    earnedSats: Number,
    sats: Number,
    paidSats: Number,
    views: Number,
    username: String,
    lowerCaseUserName: String,
    upvotes: Number,
    avatarUrl: String,
    avatarFileName: String,
    upvoted: [String],
    reported: [String],
    images: [imageSchema]
});

const Users = mongoose.model('Users', accountSchema);


module.exports = Users;