


angular.module('main').controller("SearchController", function($scope, $http, $ionicPopup, $ionicListDelegate, TrademarkService, $stateParams, $state, $rootScope, Notebook){

  $scope.searchForm = {
  }
  $scope.searchResults = [];

  $scope.notebooks = [];

  $scope.selectedNotebook = {};

  $scope.noNotebooks = false;
  $scope.searchStatus = 200;

  var notebooksPopup;

  $scope.search = function(){
    $scope.searchStatus = 200;
    $scope.searchResults = [];
    cordova.plugins.Keyboard.close();
    if($scope.searchForm.searchString == null || $scope.searchForm.searchString == ""){
      return;
    }
    console.log($scope.searchForm.searchString);
    TrademarkService.searchTrademarks($scope.searchForm.searchString).then(function(response){
        $scope.searchResults = response.data;
        if($scope.searchResults.length == 0){
          $scope.searchStatus = 404;
        }
      },
      function(response){
        if(response.data.status){
          $scope.searchStatus = response.data.status;
        } else{
          $scope.searchStatus = 500;
        }
        //console.log(error.message);
      }
    );
  }

  $scope.showNotebooksList = function(trademarkInfo){

    $scope.selectedTrademark = trademarkInfo;
    var template = '<ion-list > ' +
                    '<ion-radio ng-model="selectedNotebook.id" ng-value="notebook.id" ng-repeat="notebook in notebooks track by $index" >{{notebook.name}}</ion-radio>' +
                    '</ion-list>';
    TrademarkService.getNotebooks().then(function(response){
      $scope.notebooks = response.data;
      if(!response.data || response.data.length == 0){

        showCreateNotebookPopup();

      }else{
        $scope.selectedNotebook.id = $scope.notebooks[0].id;
        $ionicPopup.show({
          title: "Select Notebook",
          scope: $scope,
          template: $scope.noNotebooks ? noNotebooksTemplate : template,
          buttons: [{
            text: "Cancel",
            onTap: function(){
              $ionicListDelegate.closeOptionButtons();
            }
          },{
            text: "<b>Save</b>",
            type: 'button-positive',
            onTap: function(e){
              TrademarkService.createBookmark($scope.selectedTrademark, $scope.selectedNotebook.id).then(function(){
                $ionicListDelegate.closeOptionButtons();
              });
            }
          }]
        });
      }

    }, function(err){
      console.log("Error - "+err.message);
    });
  }

  function showCreateNotebookPopup(){
    var template = '<div class="list">';
    template += '<label class="item item-input"> <input type="text" placeholder="Notebook name" ng-model="newNotebook.name" > </label>';
    template += '<label class="item item-input"> <textarea placeholder="Description" ng-model="newNotebook.description" ></textarea> </label>';
    template += '</div>';
    $scope.newNotebook = Notebook.newInstance();

    $ionicPopup.show({
      title: "Save to a new notebook",
      scope: $scope,
      template: template,
      buttons: [{
        text: "Cancel",
        onTap: function(){
          $ionicListDelegate.closeOptionButtons();
        }
      },{
        text: "<b>Save</b>",
        type: 'button-positive',
        onTap: function(e) {
          TrademarkService.saveNotebook($scope.newNotebook).then(function(response){
                var notebookId = response.data;
                TrademarkService.createBookmark($scope.selectedTrademark, notebookId).then(function(){
                  $ionicListDelegate.closeOptionButtons();
                });
              },
              function(error){
                console.log(error.message)
              }
          );
        }
      }]
    });
  }

  $scope.shareEvent = function(trademarkInfo){
    TrademarkService.shareTrademark(trademarkInfo, false);
  };

  $scope.clearSearch = function(){
    console.log("In Clear Search");
    $scope.searchResults = [];
    $scope.searchForm.searchString = "";
    $scope.showMessage = false;
  }

  $scope.showNotebooksTab = function(){
    $ionicListDelegate.closeOptionButtons();
    notebooksPopup.close();
    $state.go("tab.notebooks");
    return false;
  }

  $scope.zoomImage = function(trademarkInfo){
    var template = '<img ng-src="http://tsdr.uspto.gov/img/'+trademarkInfo.serialNumber+'/large" style="width: 100%; height: auto;" >';
    $ionicPopup.show({
      title: "Trademark Image",
      scope: $scope,
      template: template,
      buttons: [{
        text: "Cancel",
        onTap: function(){
        }
      }]
    });
    return false;
  }

  $scope.showDetail = function(index, $event){
    if($event.target.tagName.toLowerCase() == "a"){
      return;
    }
    $rootScope.trademarks = $scope.searchResults;
    $rootScope.selectedTrademarkIndex = index;
    var params = {
      trademarks: $scope.searchResults,
      selectedTrademarkIndex: index,
      source: "Search"
    }

    $state.go("tab.search-trademarkDetails", {params: params});
  }

  $scope.$on('$ionicView.enter', function() {
    // perform search again
    $scope.search();
  });

  console.log("State Params - "+JSON.stringify($stateParams));
  if($stateParams.searchString){
    $scope.searchForm.searchString = $stateParams.searchString;
    $scope.search();
  }

});
