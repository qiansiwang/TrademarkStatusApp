angular.module('usageStatistics', ['chart.js'])
    .run(function(){
        console.log("Module initialized");
    });

angular.module('usageStatistics', ["chart.js"]).controller('usageStatisticsController', function ($scope, $http) {

    $scope.topLevel = {
        devices: 10,
        bookmarks: 20,
        notifications: 30,
        searches:40
    };

    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };

    $scope.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    $scope.deviceSessionData = {
        labels: [],
        data: [],
        series: [],
        month: new Date().getMonth()+"",
        year: new Date().getFullYear()
    }

    $scope.bookmarksAltersData = {
        labels: [],
        data: [],
        series: [],
        year: new Date().getFullYear()
    }


    getToplevelStatistics();
    buildDeviceSessionData();
    buildBookmarksAlertsData();

    $scope.refreshDeviceSessionData = function(){
        buildDeviceSessionData();
    }


    function getToplevelStatistics(){
        var url = "/tsdrService/statistics/topLevel"
        $http.get(url).then(function(response){
            $scope.topLevel = response.data;
        });
    }

    function buildDeviceSessionData(){
        var month = parseInt($scope.deviceSessionData.month) + 1;
        var url = "/tsdrService/statistics/sessions/"+$scope.deviceSessionData.year+"/"+month;
        $http.get(url).then(function(response){
            $scope.deviceSessionData.labels = response.data.labels;
            $scope.deviceSessionData.data = [response.data.data];
            $scope.deviceSessionData.series = ["Sessions"];
        });
    }

    function buildBookmarksAlertsData(){
        var url = "/tsdrService/statistics/alerts/"+$scope.bookmarksAltersData.year;
        $http.get(url).then(function(alertsResponse){
            $scope.bookmarksAltersData.labels = alertsResponse.data.labels;
            url = "/tsdrService/statistics/bookmarks/"+$scope.bookmarksAltersData.year;
            $http.get(url).then(function(bookmarksResponse){
                $scope.bookmarksAltersData.data = [alertsResponse.data.data, bookmarksResponse.data.data];
                $scope.bookmarksAltersData.series = ["Alerts", "Bookmarks"];
            });
        });
    }


});