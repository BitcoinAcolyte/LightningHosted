var infScroll = new InfiniteScroll('.grid', {
   path: function () {
      return '/noauth/topPosts/' + this.pageIndex;
   },
   responseType: 'text',
   status: '.page-load-status',
   history: false,
   // maybe this should be disabled? histoy^ to get it to go back to the same part of the page
});

// check if there is a list of upvoted posts on the client
if (!localStorage.getItem("upVoted")) {
   localStorage.setItem("upVoted", JSON.stringify({}))
}
// loading the list of upvoted images from the client
var upVoted = JSON.parse(localStorage.getItem("upVoted"))


infScroll.on('load', function (response) {


   var data = JSON.parse(response);
   console.log(data)
   data.forEach(image => {
      if ($('.' + image.imageId).length === 0) {
         //checking if the image is already on the page in the share spot

         //build a new photocard 
         newCard = $("#photoCard").clone();
         newCard.find('.photoThumb').attr('src', '/noauth/image/' + image.fileName).attr('onload', '$("#photoCard' + x + '").toggle()');
         newCard.attr("id", "photoCard" + x);
         newCard.addClass(image.imageId);
         newCard.find('.shareLink').attr('href', '/noauth/share/' + image.imageId);
         newCard.find('.views').text(image.views);
         if (upVoted[image.imageId] === true) {
            newCard.find('.chevron').addClass("upVoted");
         }
         newCard.find('.upVotes').text(image.upVotes);
         newCard.find('.upVotebtn').attr('onclick', 'upvoteImage("' + image.imageId + '")');
         newCard.find('.titleVal').text(image.title);
         $(".grid").append(newCard);


         allItems = document.getElementsByClassName("item");
         for (x = 0; x < allItems.length; x++) {
            imagesLoaded(allItems[x], resizeInstance);
         }
      }
   });
   if (data != false) {
      newAdCard = $('.adCardTemplate').clone();
      newAdCard.removeClass('adCardTemplate');
      newAdCard.attr("id", "photoCard" + x);
      newAdCard.find('iframe').attr('onload', '$("#photoCard' + x + '").toggle()');
      $(".grid").append(newAdCard);

      allItems = document.getElementsByClassName("item");
      for (x = 0; x < allItems.length; x++) {
         imagesLoaded(allItems[x], resizeInstance);
      }
   }
});

infScroll.loadNextPage();

function resizeGridItem(item) {
   grid = document.getElementsByClassName("grid")[0];
   rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
   rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
   rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
   item.style.gridRowEnd = "span " + rowSpan;
}

function resizeAllGridItems() {
   allItems = document.getElementsByClassName("item");
   for (x = 0; x < allItems.length; x++) {
      resizeGridItem(allItems[x]);
   }
}

function resizeInstance(instance) {
   item = instance.elements[0];
   resizeGridItem(item);
}

window.addEventListener("resize", resizeAllGridItems);

allItems = document.getElementsByClassName("item");
for (x = 0; x < allItems.length; x++) {
   imagesLoaded(allItems[x], resizeInstance);
}

function upvoteImage(id) {
   if ($('.' + id).find('.chevron').hasClass('upVoted')) {
      $('.' + id).find('.upVotes').text(parseInt($('.' + id).find('.upVotes').text()) + -1)
      var upVoted = JSON.parse(localStorage.getItem("upVoted"))
      upVoted[id] = false;
      localStorage.setItem("upVoted", JSON.stringify(upVoted));
   }
   else {
      $('.' + id).find('.upVotes').text(parseInt($('.' + id).find('.upVotes').text()) + 1)
      var upVoted = JSON.parse(localStorage.getItem("upVoted"))
      upVoted[id] = true;
      localStorage.setItem("upVoted", JSON.stringify(upVoted));
      $.get("/noauth/upvote/" + id, function (data, status) {
      });
   }
   $('.' + id).find('.chevron').toggleClass('upVoted')
}



