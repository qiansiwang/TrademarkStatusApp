angular.module('main').controller("PreferredStatusCodesController", function($scope, $stateParams, $state, TrademarkService) {
  loadPreferredStatusGroups();
  console.log("Inside PreferredStatusCodesController");

  $scope.selectAll = {
    value: false
  }

  //$scope.statusCodes = TrademarkService.getStatusCodes();

  function loadPreferredStatusGroups() {
    TrademarkService.getPreferredStatusGroups().then(function(response) {
        $scope.preferredStatusGroups = response.data;
      },
      function(err) {
        console.log("Error in retrieving notebooks - " + err.message);
      }
    );
  }

  $scope.savePreferredStatusCodes = function() {
    console.log($scope.preferredStatusGroups);
    console.log("Inside savePreferredStatusCodes");

    TrademarkService.savePreferredStatusCodes($scope.preferredStatusGroups).then(function(response) {
        console.log("Successfully saved PreferredStatusCodes");
      },
      function(err) {
        console.log("Error in retrieving notebooks - " + err.message);
      }
    );
  };
  $scope.create = function() {
    console.log("Inside create");
    $state.go('tab.bookmarks');
  };

  $scope.showStatusCodes = function(statusGroupId){
    $state.go("tab.statuscode", {statusGroupId: statusGroupId});
  }

  $scope.toggleSelectAll = function(){
    if($scope.selectAll.value){
      $scope.preferredStatusGroups.forEach(function(group){
        group.selected = true;
      });
    }else{
      $scope.preferredStatusGroups.forEach(function(group){
        group.selected = false;
      });
    }
  }

})

