angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
    $scope.data1 = "Something something";
  })

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.data = [{id: 616, value: "Revived-Awaiting Further Action"}, {id: 630, value: "New Application-Record initialized not assigned to Law Office examiner"},
  {id: 638, value: "New Application-Assigned to an examiner"},{id: 640, value: "Non-final action counted-Not mailed"},
  {id: 641, value: "Non-final action-Mailed"}];

  $scope.onValueChanged = function(value){
  	console.log(value);
  }
});
