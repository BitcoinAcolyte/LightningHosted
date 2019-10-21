FilePond.registerPlugin(FilePondPluginFileValidateType);
FilePond.registerPlugin(FilePondPluginFileValidateSize);

const inputElement = document.querySelector('input[type="file"]');
const pondOne = FilePond.create(inputElement);
const pond = document.querySelector('.filepond--root');

pondOne.setOptions(
    {
        maxFileSize: '5MB',
        acceptedFileTypes: ['image/*', '.gif', 'video/mp4'],
        labelTapToUndo: 'Upload another file',
        labelFileProcessingComplete: '',
        labelIdle: 'Drag & Drop your image or <span class="filepond--label-action">Browse</span> to get started',
        server: {
            url: './upload',
            process: {
                onload: (res) => {
                    res = JSON.parse(res);
                    showPayment(res.image, res.invoice)
                    checkPaymentStatus(res.invoice)
                    return res;
                },
                fetch: null,
                revert: null,
            },
        }
    });

pondOne.on('removefile', e => {
    clearMessage();
});

$.get("./user/", function (data, status) {
    $("#satsEarned").text(data.sats)
    data.images.reverse()
    data.images.forEach(element => {
        if (element.deleted === false && element.payStatus === true) {
            addCard(element)
        }

    });
});

function addCard(image, append) {
    if (getExtension(image.fileName) === 'mp4') {
        var newCard = $("#videoCard").clone();
        newCard.toggle();
        newCard.find('.mp4').attr('src', '/noauth/thumb/' + image.fileName)
        newCard.find('.photoThumb').attr('onplay', ' allItems = document.getElementsByClassName("item"); for (x = 0; x < allItems.length; x++) {imagesLoaded(allItems[x], resizeInstance);}');
        newCard.attr("id", "photoCard" + x);
        newCard.addClass(image.imageId);
        newCard.find('.shareLink').attr('href', '../s/' + image.imageId);
        newCard.find('.views').text(image.views);
        newCard.find('.upvotes').text(image.upVotes);
        newCard.find('.sats').text(image.sats);
        newCard.find('.btn').attr('onclick', 'deleteImage("' + image.imageId + '")');
        if (image.title === '') {
            var newTitle = $("#TitleInputTemp").clone();
            newTitle.attr('id', 'title' + image.imageId);
            newTitle.find('.emptyTitle').attr('id', image.imageId);
            newTitle.find('.emptyTitle').attr('onkeyup', 'submitTitle("' + image.imageId + '")');
            newCard.find('.title').html(newTitle);
            newCard.find('.title').attr('class', 'titleInput');
            newTitle.toggle();
        }
        else {
            newCard.find('.titleVal').text(image.title)
        }
        if (append === true) {
            $(".grid").prepend(newCard)
        }
        else {
            $(".grid").append(newCard)
        }

        allItems = document.getElementsByClassName("item");
        for (x = 0; x < allItems.length; x++) {
            imagesLoaded(allItems[x], resizeInstance);
        }
    }
    else {
        var newCard = $("#photoCard").clone();
        newCard.find('.photoThumb').attr('src', '/noauth/thumb/' + image.fileName).attr('onload', '$("#photoCard' + x + '").toggle()');
        newCard.attr("id", "photoCard" + x);
        newCard.addClass(image.imageId);
        newCard.find('.shareLink').attr('href', '../s/' + image.imageId);
        newCard.find('.views').text(image.views);
        newCard.find('.upvotes').text(image.upVotes);
        newCard.find('.sats').text(image.sats);
        newCard.find('.btn').attr('onclick', 'deleteImage("' + image.imageId + '")');
        if (image.title === '') {
            var newTitle = $("#TitleInputTemp").clone();
            newTitle.attr('id', 'title' + image.imageId);
            newTitle.find('.emptyTitle').attr('id', image.imageId);
            newTitle.find('.emptyTitle').attr('onkeyup', 'submitTitle("' + image.imageId + '")');
            newCard.find('.title').html(newTitle);
            newCard.find('.title').attr('class', 'titleInput');
            newTitle.toggle();
        }
        else {
            newCard.find('.titleVal').text(image.title)
        }
        if (append === true) {
            $(".grid").prepend(newCard)
        }
        else {
            $(".grid").append(newCard)
        }

        allItems = document.getElementsByClassName("item");
        for (x = 0; x < allItems.length; x++) {
            imagesLoaded(allItems[x], resizeInstance);
        }
    }
}

function checkPaymentStatus(invoice, incrment) {
    if (incrment === undefined) {
        incrment = 1
    }
    $.get("./paymentStatus/" + invoice, function (data, status) {
        if (data.payStatus === false) {
            if (incrment === 300) {
                return
            }
            incrment++
            setTimeout(() => {
                checkPaymentStatus(invoice, incrment)
            }, 1000)
        }
        else {
            clearMessage();
            addCard(data, true)
            setTimeout(() => {
                showThankYou(window.location.hostname + '/s/' + data.imageId)
            }, 1000)
            // this link will not work in production

        }
    })
};

function deleteImage(id) {
    $.sweetModal.confirm('Are you sure you want to delete this image?', function () {
        $.get("./delete/" + id, function (data, status) {
        });
        $('.' + id).remove()
        $.sweetModal('Image deleted');
    });

}

function submitTitle(id) {
    if (event.which == 13) {
        var title = encodeURIComponent($(':focus').val())
        $.get("./title/" + id + "/" + title + '/', function (data, status) {
            $('#title' + id).parent().html(`<h3>` + $(':focus').val() + `</h3>`).removeClass('centered').removeClass('titleInput').addClass('title')
        });

    }
}

function withdraw() {
    if ($('#satsEarned').text() === '0') {
        $.sweetModal({
            content: 'You have no sats to withdraw',
            title: 'Sorry',
            icon: $.sweetModal.ICON_ERROR,

            buttons: [
                {
                    label: 'Ok',
                    classes: 'redB'
                }
            ]
        });
    }
    else {
        $.sweetModal.prompt('Enter a lighting invoice to withdraw', 'Lightning Invoice', '', function (val) {

            $.get("./withdraw/" + val, function (data, status) {

                if (data.status === 'success') {
                    $('#satsEarned').text(parseInt($('#satsEarned').text()) - data.amount)
                    $.sweetModal({
                        content: 'Sats sent!',
                        icon: $.sweetModal.ICON_SUCCESS
                    });
                }
                else {
                    $.sweetModal({
                        content: data,
                        title: 'Oh noes…',
                        icon: $.sweetModal.ICON_ERROR,

                        buttons: [
                            {
                                label: 'OK',
                                classes: 'redB'
                            }
                        ]
                    });
                }
            });
        });
    }
}

function clearMessage() {
    if ($('#message-container').is(':visible')) {
        $('#message-container').slideToggle('fast')
        setTimeout(function () {
            $('#message-image').html('')
            $('#message').text('');
            $('#message-invoice').text('');
            $('.copyBtn').remove();
            $('.shareButtons').remove();
        }, 500);
    }
}

function showPayment(image, invoice) {
    $('#message-image').html('<img id="message-image" src="' + image + '" />')
    $('#message').text('Please pay the invoice to complete the upload');
    $('#message-invoice').attr("href", "lightning:" + invoice).text('Open Wallet')
    setTimeout(function () {
        $('#message-container').slideToggle('slow')
    }, 500);
}

function showThankYou(link) {
    $('#message').text('Thank you please use this link to share your photo and earn some sats!');
    $('#message-link').text(link)
    $('#message-container').append('<button class="btn copyBtn" onclick="copy()">Copy</button>')
    var shareBtns = $('.shareButtonsTemplate').clone()
    shareBtns.removeClass('shareButtonsTemplate').addClass('shareButtons')
    shareBtns.find('.facebookLink').attr('href', "http://www.facebook.com/sharer.php?u=" + link)
    shareBtns.find('.redditLink').attr('href', "http://reddit.com/submit?url=" + link)
    shareBtns.find('.twitterLink').attr('href', "https://twitter.com/share?url=http://" + link + "&text=LightningHosted.com&hashtags=LightningHosted")
    shareBtns.toggle();
    $('#message-container').append(shareBtns)
    setTimeout(function () {
        $('#message-container').slideToggle('slow')
    }, 100);

}

//working on a copy text button
function copy() {
    // var copyText = $("#message-link").val();

    var copyText = $("#message-link").text();
    $("body").append('<textarea id="temp">' + copyText + '</textarea>')
    $('#temp').select();
    document.execCommand("copy");
    $("#temp").remove()
}

function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
}
