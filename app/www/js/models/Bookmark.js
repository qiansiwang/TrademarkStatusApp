angular.module('main').factory('Bookmark', function()
{
  var Bookmark = function() {
    angular.extend(this, {
      id:null,
      notebookId: null, // integer
      trademarkInfo: null, // TrademarkInfo
      statusUpdated: false, // boolean
      notebooks: null, // [Notebook]
      setData: function(data){
        angular.extend(this, data);
        return this;
      }

    });

  };

  return {
    newInstance: function(){
      return new Bookmark();
    }
  };
});
