
angular.module('main').controller("StatusUpdatesController", function($rootScope, $scope, $stateParams, $state, TrademarkService, $cordovaBadge){

    console.log("Inside Status Updates Controller");

    TrademarkService.getStatusUpdates().then(function(response){
        $scope.bookmarks = response.data;
    })

    $scope.dismissItem = function(index){
        var bookmarks = $scope.bookmarks;
        var bookmark = bookmarks[index];
        bookmark.statusUpdated = false;
        TrademarkService.updateBookmark(bookmark).then(function(){
            $scope.bookmarks.splice(index, 1);
            $cordovaBadge.set(bookmarks.length).then(function() {
                console.log("Updated badge count")
            });
            $rootScope.statusUpdateCount = bookmarks.length;
        });
    }

    $scope.shareEvent = function(bookmark) {
        TrademarkService.shareTrademark(bookmark.trademarkInfo, true);
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
            source: "Alerts",
            bookmarks: $scope.bookmarks
        }

        $state.go("tab.statusUpdates-trademarkDetails", {params: params});
    }


});
