angular.module('main').factory('Notebook', function()
{
  var Notebook = function() {
    angular.extend(this, {
      id:null,
      name: null, // String
      description: null, // String
      notebookBookmarkId: null, // int - not persisted to db directly, identifies the association this notebook has with a specific trademark
      selected: false, // boolean - not persisted to db directly, combination of notebookBookmarkId and selected will identify which notebooks have been selected for bookmarking a trademark
      bookmarksCount: 0, // integer
      setData: function(data){
        angular.extend(this, data);
        return this;
      }

    });

  };

  return {
    newInstance: function(){
      return new Notebook();
    }
  };
});
