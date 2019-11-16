const router = require('express').Router();
const User = require('../models/user-model');
const crypto = require('crypto');
const grpc = require('grpc');
const fs = require('fs');
const qrCode = require('qrcode')
const sizeOf = require('image-size');
const sharp = require('sharp');
const ThumbnailGenerator = require('video-thumbnail-generator').default;
const getVideoDimensions = require('get-video-dimensions');
const keys = require('../config/keys');

// Checks to see if a user is logged in before allowing them to access a page.
const authCheck = (req, res, next) => {
    if (!req.user) {
        // if user is not logged in
        res.redirect('../noauth/login')
    }
    else {
        // if logged in
        next();
    }
};

// setting up LND
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
var m = fs.readFileSync('./config/admin.macaroon');
var macaroon = m.toString('hex');

// build meta data credentials
var metadata = new grpc.Metadata();
metadata.add('macaroon', macaroon);
var macaroonCreds = grpc.credentials.createFromMetadataGenerator((_args, callback) => {
    callback(null, metadata);
});

// build ssl credentials using the cert the same as before
var lndCert = fs.readFileSync("./config/tls.cert");
var sslCreds = grpc.credentials.createSsl(lndCert);

// combine the cert credentials and the macaroon auth credentials
var credentials = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);

// Pass the crendentials when creating a channel
var lnrpcDescriptor = grpc.load("./config/rpc.proto");
var lnrpc = lnrpcDescriptor.lnrpc;

var lightning = new lnrpc.Lightning(keys.lnd.uri, credentials);

var call = lightning.subscribeInvoices({});

call.on('data', function (invoice) {
    if (invoice.settled === true) {
        User.findOne({ 'images.paymentRequest': invoice.payment_request }).then(function (record) {
            record.images.forEach(element => {
                if (element.paymentRequest === invoice.payment_request) {
                    element.payStatus = true;
                }
            })
            record.save();
        });

    }
})

router.get('/', authCheck, (req, res) => {
    res.render('profile', { user: req.user });
});

// Handles the upload and creation of a new image.
router.post('/upload', function (req, res) {
    var newImageDimensions = {};
    fileName = crypto.randomBytes(8).toString('hex');
    if (Object.keys(req.files).length == 0) {
        console.log('no files were uploaded')
        return res.status(400).send('No files were uploaded.');
    }
    lightning.addInvoice({ value: 250, memo: 'LightningHosted Captcha' }, function (err, lndResponse) {
        if (err) {
            console.log(1, err)
            res.status(500).send(err)
        };
        if (req.files.filepond.mimetype != 'video/mp4') {
            sharp(req.files.filepond.data).jpeg({ quality: 75, force: true }).rotate().toFile('./uploads/' + fileName + '.' + 'jpeg', function (err) {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                }
                sizeOf('./uploads/' + fileName + '.jpeg', function (err, dimensions) {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err);
                    }
                    newImageDimensions = dimensions;
                    newRecord('jpeg', lndResponse);
                });

            })
            sharp(req.files.filepond.data).jpeg({ quality: 40, force: true }).rotate().toFile('./thumbnails/' + fileName + '.' + 'jpeg', function (err) {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                }
            })
        }
        else {
            req.files.filepond.mv('./uploads/' + fileName + '.mp4', function (err) {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                }
                fs.copyFile('./uploads/' + fileName + '.mp4', './thumbnails/' + fileName + '.mp4', (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err);
                    };
                });


                getVideoDimensions('./uploads/' + fileName + '.mp4').then(function (dimensions) {
                    newImageDimensions = dimensions;
                    var tg = new ThumbnailGenerator({
                        sourcePath: './uploads/' + fileName + '.mp4',
                        thumbnailPath: './thumbnails/'
                    });
                    tg.generateOneByPercentCb(90, { size: dimensions.width + 'x' + dimensions.height }, (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send(err);
                        }
                        sharp('./thumbnails/' + result).jpeg({ quality: 80, force: true }).toFile('./uploads/' + fileName + '.' + 'jpeg', function (err) {
                            if (err) {
                                console.log(err);
                                res.status(500).send(err);
                            }
                            fs.unlink('./thumbnails/' + result, function (err) {
                                if (err) {
                                    console.log(err);
                                };
                            });


                        });
                        newRecord('mp4', lndResponse);
                    });
                });

            });
        };
    });
    function newRecord(extension, lndResponse) {
        var ogType = 'article';
        var twitterCard ='summary_large_image';
        var orientation = 'horizontal';
        if (extension === 'mp4'){
            ogType = 'video.other'
            twitterCard ='player'
        };
        if (newImageDimensions.height > newImageDimensions.width){
            orientation = 'vertical';
        };
        req.user.images.push({
            orientation: orientation,
            imageId: fileName,
            reviewStatus: false,
            payStatus: true,
            deleted: false,
            views: 0,
            reports: 0,
            fileName: fileName + '.' + extension,
            thumbNail: fileName+'.jpeg',
            width: newImageDimensions.width,
            height: newImageDimensions.height,
            date: new (Date),
            title: '',
            caption: 'String',
            paymentRequest: lndResponse.payment_request,
            upVotes: 0,
            sats: 0,
            numberOfComments: 0,
            fileType: extension,
            ogType: ogType,
            twitterCard: twitterCard, 
        })
        req.user.save().then(() => {
            qrCode.toDataURL(lndResponse.payment_request, function (err, url) {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                }
                res.status(200).send({
                    invoice: lndResponse.payment_request,
                    image: url,
                    fileName: fileName + "." + extension,
                    imageId: fileName
                });
            })
        });
    }
});



router.get('/user', authCheck, (req, res) => {
    User.findOne({ _id: req.user.id }).then((currentUser) => {
        res.send(currentUser)
    })
});

router.get('/title/:imageId/:title', authCheck, (req, res) => {
    req.params.title = req.params.title.replace(/[&\/\\#,+()$~%'":*<>{}]/g, ''
    );
    req.user.images.forEach(element => {
        if (element.imageId == req.params.imageId) {
            element.title = req.params.title;
        }
    });
    req.user.save();
    res.send('Title Updated')
});

router.get('/paymentStatus/:invoice', authCheck, (req, res) => {
    req.user.images.forEach(element => {
        if (element.paymentRequest == req.params.invoice) {
            res.send(element)
            return
        }
    })
})

router.get('/delete/:id/', authCheck, (req, res) => {
    req.user.images.forEach(element => {
        if (element.imageId == req.params.id) {
            element.deleted = true;
        }
    })
    req.user.save();
    res.send('Image deleted')
});


router.get('/withdraw/:invoice', authCheck, (req, res) => {
    lightning.DecodePayReq(req.params.invoice, function (decodeErr, decodeReesponse) {
        if (decodeErr) {
            res.send(decodeErr.details)
        }
        else {
            if (req.user.sats >= decodeReesponse.num_satoshis) {
                lightning.sendPaymentSync({ payment_request: req.params.invoice }, function (err, response) {
                    if (err) {
                        res.send(err.details);
                    }
                    if (response.payment_error) {
                        res.send(response.payment_error);
                    }
                    else {
                        res.send({ status: 'success', amount: decodeReesponse.num_satoshis });
                        req.user.sats = req.user.sats - decodeReesponse.num_satoshis;
                        req.user.paidSats = req.user.paidSats + decodeReesponse.num_satoshis;
                        req.user.save();
                    };
                })
            }
            else {
                res.send('Not enough sats')
            }
        }
    });
});

module.exports = router;

