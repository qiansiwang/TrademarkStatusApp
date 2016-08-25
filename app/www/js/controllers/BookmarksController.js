angular.module('main').controller("BookmarksController", function($scope,$rootScope,$state, $stateParams, TrademarkService) {

  $scope.notebookId = $stateParams.notebookId;
  $scope.bookmarks = [];

  TrademarkService.getBookmarksForNotebook($scope.notebookId).then(function(response) {
    $scope.bookmarks = response.data;
  })
  $scope.shareEvent = function(bookmark) {
    TrademarkService.shareTrademark(bookmark.trademarkInfo, false);
  };

  $scope.deleteBookmarksForNotebook = function(index, bookmark) {
    console.log("bookmark: " + bookmark);
    $scope.bookmarks.splice(index, 1);
    TrademarkService.deleteBookmarksForNotebook(bookmark.id).then(function(response) {
      console.log("successfully deleted bookmark for notebook");
    })
  };

  $scope.showDetail = function(index, $event){

    if($event.target.tagName.toLowerCase() == "a"){
      return;
    }

    var trademarks = $scope.bookmarks.map(function(bookmark){
      return bookmark.trademarkInfo;
    })

    var params = {
      trademarks: trademarks,
      selectedTrademarkIndex: index,
      source: "Bookmarks",
      bookmarks: $scope.bookmarks
    }

    $state.go("tab.bookmarks-trademarkDetails", {params: params});
  }

});
