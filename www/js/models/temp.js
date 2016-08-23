this.getNotebooksViewForTrademark = function(trademarkInfo){

  var query = "select nt.id, nt.name, nt.description from notebooks nt " +
    "left join notebooks_bookmarks nb on nt.id = nb.notebook_id " +
    "left join bookmarks bm on nb.bookmark_id = bm.id and bm.serial_number = ?";

  // first - get all available notebooks
  this.getNotebooks().then(function(response){
    var notebooks = response.data;
    if(notebooks.length > 0){
      // figure out if this trademark is already bookmarked
      var serialNumber = trademarkInfo.serialNumber;
      this.getBookmarkBySerialNumber(serialNumber).then(function(response){
        if(response.data != null){
          // the trademark is already bookmarked,
          var bookmark = response.data;
          // get all notebooks where the bookmark is attached
          var notebooksQ = this.getNotebooksForBookmark(bookmark.id)
          notebooksQ.then(function(response){
            var bookmarkNotebooks = response.data;
            // mark already

          });

        }else{
          // the trademark is not bookmarked


        }
      })



    }
  })


}
