angular.module('main').factory('AppConfig', function()
{
  var AppConfig = function() {
    angular.extend(this, {
      appId:null, // String
      pushId: null, // String
      pushEnabled: false, // boolean
      dbVersion: 0, // int
      remoteDeviceId: null, // int
      setData: function(data){
        angular.extend(this, data);
        return this;
      }

    });

  };

  return {
    newInstance: function(){
      return new AppConfig();
    }
  };
});
