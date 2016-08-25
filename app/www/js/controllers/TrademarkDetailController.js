angular.module('main').controller("TrademarkDetailController", function($scope, $rootScope, $state, $stateParams, TrademarkService, $ionicHistory,$cordovaBadge, $ionicPopup) {

    var params = $stateParams.params;
    $scope.trademarks = params.trademarks;
    $scope.source = params.source;
    $scope.bookmarks = params.bookmarks;

    $scope.selectedNotebook = {};

    var notebooksPopup;

    $scope.data = {};
    $scope.$watch('data.slider', function(nv, ov) {
        $scope.slider = $scope.data.slider;
    })

    $scope.swiperOptions = {
        initialSlide: params.selectedTrademarkIndex
    }

    $scope.share = function(trademarkInfo){
        console.log("Inside Share method");
        TrademarkService.shareTrademark(trademarkInfo, false);
    }

    $scope.deleteBookmark = function(trademarkInfo) {
        var index = getTrademarkIndex(trademarkInfo);
        var bookmark = $scope.bookmarks[index];
        console.log("bookmark: " + bookmark);
        TrademarkService.deleteBookmarksForNotebook(bookmark.id).then(function(response) {
            $scope.bookmarks.splice(index, 1);
            $scope.trademarks.splice(index, 1);
            $scope.slider.removeSlide(index);
            $scope.slider.update();
            console.log("successfully deleted bookmark for notebook");
            if($scope.bookmarks.length == 0){
                $ionicHistory.goBack();
            }
        })
    };

    $scope.dismissItem = function(trademarkInfo){
        var index = getTrademarkIndex(trademarkInfo);
        var bookmark = $scope.bookmarks[index];
        bookmark.statusUpdated = false;
        TrademarkService.updateBookmark(bookmark).then(function(){
            $scope.bookmarks.splice(index, 1);
            $scope.trademarks.splice(index, 1);
            $scope.slider.removeSlide(index);
            $scope.slider.update();
            $cordovaBadge.set($scope.bookmarks.length).then(function() {
                console.log("Updated badge count")
            });
            $rootScope.statusUpdateCount = $scope.bookmarks.length;
        });

    }


    $scope.showNotebooksList = function(trademarkInfo){

        $scope.selectedTrademark = trademarkInfo;
        var template = '<ion-list > ' +
            '<ion-radio ng-model="selectedNotebook.id" ng-value="notebook.id" ng-repeat="notebook in notebooks track by $index" >{{notebook.name}}</ion-radio>' +
            '</ion-list>';
        TrademarkService.getNotebooks().then(function(response){
            $scope.notebooks = response.data;
            if(!response.data || response.data.length == 0){
                template = '<p>Please create a notebook in <a href="#" ng-click="showNotebooksTab()" >Notebooks</a> tab</p>';
                notebooksPopup = $ionicPopup.show({
                    title: "Select Notebook",
                    scope: $scope,
                    template: template,
                    buttons: [{
                        text: "Cancel",
                        onTap: function(){
                            // $ionicListDelegate.closeOptionButtons();
                        }
                    }]
                });
            }else{
                $ionicPopup.show({
                    title: "Select Notebook",
                    scope: $scope,
                    template: template,
                    buttons: [{
                        text: "Cancel",
                        onTap: function(){
                            // $ionicListDelegate.closeOptionButtons();
                        }
                    },{
                        text: "<b>Save</b>",
                        type: 'button-positive',
                        onTap: function(e){
                            TrademarkService.createBookmark($scope.selectedTrademark, $scope.selectedNotebook.id).then(function(){
                                // $ionicListDelegate.closeOptionButtons();
                                $scope.selectedTrademark.bookmarked = true;
                            });
                        }
                    }]
                });
            }

        }, function(err){
            console.log("Error - "+err.message);
        });
    }


    function getTrademarkIndex(trademarkInfo){
        var trademarkIndex;
        $scope.trademarks.forEach(function(item, index){
            if(item.markId == trademarkInfo.markId){
                trademarkIndex = index;
            }
        })
        return trademarkIndex;
    }

    $scope.showNotebooksTab = function(){
        notebooksPopup.close();
        $state.go("tab.notebooks");
        return false;
    }


});
