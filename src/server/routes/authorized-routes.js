const Users = require('../models/user-model');
var multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const imageSize = require('image-size');
const ThumbnailGenerator = require('video-thumbnail-generator').default;
const { createInvoice, authenticatedLndGrpc } = require('ln-service');
const keys = require('../config/keys')
const { lnd } = authenticatedLndGrpc(keys.lnd);
const fsPromises = require('fs').promises;
const getVideoDimensions = require('get-video-dimensions');
const { MulterError } = require('multer');
const logger = require('winston')


//seting up multer
var uploadImage = multer({
    dest: 'src/server/uploads/compressed',
    limits: { fileSize: 1024 * 1024 * 1024 * 5 },

    // filter uploaded files based on MimeType
    fileFilter: function fileFilter(req, file, cb) {
        const acceptedMimeTypes = ["image/jpeg", "video/mp4", "image/gif", "image/png"]
        let error = null;
        if (!req.user) {
            error = 'Please log in first';
        }
        if (!acceptedMimeTypes.includes(file.mimetype)) {
            error = 'Unsported file type';
        }
        if (error) {
            // reject the file and return error
            cb(error, false);
        }
        else {
            // if no error accept the file
            cb(null, true);
        }
    },
})

var uploadAvatar = multer({
    dest: 'src/server/uploads/avatars',
    // filter uploaded files using molter based on MimeType
    fileFilter: function fileFilter(req, file, cb) {
        const acceptedMimeTypes = ["image/jpeg", "image/png"]
        let error = null;
        if (!req.user) {
            error = 'Please log in first';
        }
        if (!acceptedMimeTypes.includes(file.mimetype)) {
            error = 'Unsported file type';
        }
        if (error) {
            // return error and reject the file
            cb(error, false);
        }
        else {
            // accept the file
            cb(null, true);
        }
    },
}
)


module.exports = function (app) {


    app.post('/api/avatar', uploadAvatar.single("avatar", (err) => { console.log(err) }), async function (req, res) {
        var avatarFileName = 'A' + crypto.randomBytes(8).toString('hex') + '.jpeg'
        await sharp(req.file.path).jpeg({ quality: 50, force: true })
            .rotate()
            .toFile('src/server/uploads/avatars/' + avatarFileName)
        fsPromises.unlink(req.file.path);
        fsPromises.unlink('src/server/uploads/avatars/' + req.user.avatar)
        req.user.avatar = avatarFileName;
        req.user.save();
        res.status(200).send({ avatar: avatarFileName });
    })


    app.post('/api/upload', uploadImage.single("filepond"), async function (req, res) {
        if (Object.keys(req.file).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        else {
            const imageFileName = crypto.randomBytes(8).toString('hex')
            let imageExtension = ''
            try {
                let imageInvoice = createInvoice({ lnd, description: 'LightningHosted deposit', tokens: '100' })

                const processedImage = new Promise(async (resolve, reject) => {
                    // console.log('starting image proccessing')
                    try {
                        if (req.file.mimetype === 'image/gif') {
                            await fsPromises.rename(req.file.path, 'src/server/uploads/compressed/' + imageFileName + '.gif')
                            resolve('gif')
                        }
                        if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png') {
                            await sharp(req.file.path).jpeg({ quality: 75, force: true })
                                .rotate()
                                .toFile('src/server/uploads/compressed/' + imageFileName + '.' + 'jpeg').catch(err => { return err })
                            fsPromises.unlink(req.file.path);
                            resolve('jpeg')

                        }
                        if (req.file.mimetype === 'video/mp4') {
                            await fsPromises.rename(req.file.path, 'src/server/uploads/compressed/' + imageFileName + '.mp4')
                            resolve('mp4')
                        }

                    } catch (error) {
                        reject('error proessing the image' + error)
                    }
                })
                await processedImage.then(ext => imageExtension = ext)
                // console.log('image has been proccesed')


                const getDimensions = new Promise(async (resolve, reject) => {
                    // console.log('getting dimensions')
                    try {


                        if (imageExtension === 'mp4') {
                            result = await getVideoDimensions('src/server/uploads/compressed/' + imageFileName + '.mp4')
                            resolve(result)

                        }
                        else {
                            result = await imageSize('src/server/uploads/compressed/' + imageFileName + '.' + imageExtension)
                            resolve(result)
                        }
                    } catch (error) {
                        reject('problems getting dimensions' + error)
                    }
                })
                var dimensions = await getDimensions.then((d) => dimensions = d)
                // console.log(dimensions, 'got dimensions')


                const generateThumbnail = new Promise(async (resolve, reject) => {
                    // console.log('begining thumbnail creation')
                    try {
                        if (imageExtension === 'mp4') {
                            const tg = new ThumbnailGenerator({
                                sourcePath: 'src/server/uploads/compressed/' + imageFileName + '.mp4',
                                thumbnailPath: 'src/server/uploads/thumbnails/',
                            });
                            let result = await tg.generateOneByPercent(1, { size: dimensions.width + 'x' + dimensions.height })
                            sharp('src/server/uploads/thumbnails/' + result)
                                .jpeg({ quality: 80, force: true })
                                .toFile('src/server/uploads/thumbnails/' + imageFileName + '.' + 'jpeg')
                            fsPromises.unlink('src/server/uploads/thumbnails/' + result)
                            resolve(true)
                        }
                        else {

                            sharp('src/server/uploads/compressed/' + imageFileName + '.' + imageExtension)
                                .jpeg({ quality: 40, force: true })
                                .rotate()
                                .toFile('src/server/uploads/thumbnails/' + imageFileName + '.' + 'jpeg')
                        }
                    } catch (err) {

                        // console.log(err)
                        reject('Thumbnail generation error' + err)
                    }
                    resolve(true)
                })

                await generateThumbnail

                await imageInvoice.then((invoice) => {
                    imageInvoice = invoice;
                    // console.log(invoice)
                }).catch(err => {
                    throw err[2].err.details
                })

                let imageOrientation = 'horizontal'
                if (dimensions.height > dimensions.width) {
                    imageOrientation = 'vertical';
                };

                imageData = {
                    recentViews: [],
                    posterId: req.user._id,
                    orientation: imageOrientation,
                    imageId: imageFileName,
                    reviewStatus: false,
                    payStatus: false,
                    deleted: false,
                    views: 0,
                    reports: 0,
                    fileName: imageFileName + '.' + imageExtension,
                    thumbNail: imageFileName + '.jpeg',
                    width: dimensions.width,
                    height: dimensions.height,
                    date: new (Date),
                    title: req.body.title,
                    caption: req.body.caption,
                    paymentRequest: imageInvoice.request,
                    upvotes: 0,
                    sats: 0,
                    numberOfComments: 0,
                    fileType: imageExtension,
                    ogType: 'ogType',
                    twitterCard: 'twitterCard',
                    suppressed: false,
                }
                await req.user.images.push(imageData);
                req.user.save();

                res.status(200).send(imageData);
            } catch (err) {
                console.log('error was caught')
                logger.log({
                    level: 'error',
                    message: err
                })
                res.status(400).send({ error: err })
            }
        }
        //there is a random false console log in this function no idea why
    })

    app.get('/api/profileinfo/', async (req, res) => {
        if (req.user) {
            fillteredImages = req.user.images.filter((image) => {
                if (image.deleted === false) {
                    return image;
                }

            })
            req.user.images = fillteredImages;
            res.send(req.user)
        }
        else {
            res.status(401).send()
        }
    })

    app.get('/api/upvote/:imageId', async (req, res) => {

        if (req.user) {
            const doc = await Users.findOne({ 'images.imageId': req.params.imageId })

            const index = await doc.images.findIndex(image => image.imageId === req.params.imageId)
            doc.images[index].upvotes = doc.images[index].upvotes + 1;
            doc.save()
            res.status(200).send()
        }
        else {
            res.send('please login')
        }
    })

    app.get('/api/report/:imageId', async (req, res) => {
        if (req.user) {
            const doc = await Users.findOne({ 'images.imageId': req.params.imageId })
            const index = await doc.images.findIndex(image => image.imageId === req.params.imageId)
            doc.images[index].reports = doc.images[index].reports + 1;
            doc.save()
            res.status(200).send()
        }
        else {
            res.send('please login')
        }
    })

    app.post('/api/newcomment', async (req, res) => {
        var { imageId, comment } = req.body
        if (req.user) {
            var newComment = {
                commentId: 'CI' + crypto.randomBytes(8).toString('hex'),
                date: new Date,
                comment: comment,
                upvotes: 0,
                comenterId: req.user._id,
                comenter: req.user.userName,
                avatar: req.user.avatar,
            }
            const doc = await Users.findOne({ 'images.imageId': imageId })
            const index = await doc.images.findIndex(image => image.imageId === imageId)
            console.log(doc.images[index])
            doc.images[index].comments.push(newComment)
            doc.save()
            res.status(200).send()

        }
        else {
            res.send('please login')
        }
    })

    // im kind of suprised this works but i guess req.user pulls the datbase everytime 
    app.get('/api/deleteimage/:imageId', async (req, res) => {
        if (req.user) {
            const index = await req.user.images
                .findIndex(image => image.imageId === req.params.imageId)
            req.user.images[index].deleted = true;
            req.user.save()
            res.status(200).send({ message: 'deleted' })
        }
        else {
            res.send({ message: 'please login' })
        }
    })

    app.get('/api/changeusername/:username', (req, res) => {
        if (req.user) {
            req.user.userName = req.params.username;
            req.user.save()
            res.status(200).send({ message: 'updated' })
        }
        else {
            res.send({ message: 'please login' })
        }
    })

}