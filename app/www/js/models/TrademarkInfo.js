angular.module('main').factory('TrademarkInfo', function()
{
  var TrademarkInfo = function() {
    //set defaults properties and functions
    angular.extend(this, {
      id:null,
      markId: null, // String
      serialNumber: null, // String
      registrationNumber: null, // String
      title: null, // String
      status: null, // String
      statusDescription: null, // String
      statusLongDescription: null, // String
      statusDate: null, // Date
      statusDateStr: null, // String format of date
      previousStatus: null, // String
      previousStatusDate: null, // Date
      previousStatusDateStr: null, // String format of date
      previousStatusDescription: null, // String
      previousStatusLongDescription: null, // String
      filingDate: null, // Date
      filingDateStr: null, // String
      registrationDate: null, // Date
      registrationDateStr: null,  // String
      imagePath: "", // String
      tsdrWebUrl: "", // String
      bookmarked: false, // boolean, derived property, indicates if this trademark is bookmarked
      setData: function(data){
        angular.extend(this, data);
        return this;
      },
      getSearchText: function(){
        var markId = this.markId;
        if(markId.indexOf("ref") >= 0){
          return markId.substr(3);
        }else{
          return markId.substr(2);
        }
      }

    });

  };

  return {
    newInstance: function(){
      return new TrademarkInfo();
    }
  };
});
