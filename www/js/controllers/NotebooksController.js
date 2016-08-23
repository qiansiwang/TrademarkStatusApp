
angular.module('main').controller("NotebooksController", function($scope, $http, $ionicPopup, TrademarkService, Notebook, $ionicListDelegate){

  $scope.notebooks = [];
  loadNotebooks();
  TrademarkService.checkStatusUpdates();

  var template = '<div class="list">';
  template += '<label class="item item-input"> <input type="text" placeholder="Name" ng-model="newNotebook.name" > </label>';
  template += '<label class="item item-input"> <textarea placeholder="Description" ng-model="newNotebook.description" ></textarea> </label>';
  template += '</div>';

  $scope.showNotebookView = function(){

    $scope.newNotebook = Notebook.newInstance();

    $ionicPopup.show({
      title: "Create Notebook",
      scope: $scope,
      template: template,
      buttons: [{
        text: "Cancel"
      },{
        text: "<b>Save</b>",
        type: 'button-positive',
        onTap: function(e) {
          TrademarkService.saveNotebook($scope.newNotebook).then(function(){
              loadNotebooks();
            },
            function(error){
              console.log(error.message)
            }
          );
        }
      }]
    });
  }

  $scope.editNotebook = function(notebook, index){
    $scope.newNotebook = notebook;
    $ionicPopup.show({
      title: "Edit Notebook",
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
          TrademarkService.updateNotebook($scope.newNotebook).then(function(){
                $ionicListDelegate.closeOptionButtons();
                loadNotebooks();
              },
              function(error){
                console.log(error.message)
              }
          );
        }
      }]
    });

  }

  $scope.deleteNotebook = function(notebook, index){
    TrademarkService.deleteNotebook(notebook.id).then(function(){
      $scope.notebooks.splice(index, 1);
    })
  }

  function loadNotebooks(){
    TrademarkService.getNotebooks().then(function(response){
        $scope.notebooks = response.data;
      },
      function(err){
        console.log("Error in retrieving notebooks - "+err.message);
      }
    );
  }


});
