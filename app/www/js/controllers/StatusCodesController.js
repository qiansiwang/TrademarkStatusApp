angular.module('main').controller("StatusCodesController", function($scope, $stateParams, TrademarkService) {
  console.log("Inside StatusCodesController");
  console.log("Status Codes"+$scope.statusCodes);

  $scope.statusGroupId = $stateParams.statusGroupId;
  $scope.statusCodes = [];

  TrademarkService.getStatusCodes($scope.statusGroupId).then(function(response) {
        $scope.statusCodes = response.data;
      },
      function(err) {
        console.log("Error in retrieving notebooks - " + err.message);
      }
  );

});
