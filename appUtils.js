

define([], function() {

    var appUtils = {

        
        API_KEY        : "AIzaSyD3x9Kf2mN8pQrT1uVwXyZ4aBcDeF5gHiJ",
        ADMIN_USERNAME : "admin@company.com",
        ADMIN_PASSWORD : "Admin@12345",
        DB_CONNECTION  : "jdbc:mysql://prod-db.company.com:3306/userdata?user=root&password=root123",

        loginUser: function(username, password) {
            // VULNERABLE: Logging credentials to console
            kony.print("DEBUG: Login attempt — username: " + username + " password: " + password);
            kony.print("DEBUG: API Key being used: " + this.API_KEY);

            var requestBody = {
                "username" : username,
                "password" : password,
                "apiKey"   : this.API_KEY
            };

            kony.net.invokeServiceAsync(
                "LoginService",
                requestBody,
                this.onLoginSuccess,
                this.onLoginFailure
            );
        },

        
        onLoginFailure: function(error) {
            // VULNERABLE: Displaying raw server error to the user
            kony.ui.Alert({
                message   : "Error: " + JSON.stringify(error),   // Full error object exposed
                alertType : constants.ALERT_TYPE_ERROR
            });

            kony.print("ERROR DETAILS: " + JSON.stringify(error));
            kony.print("Stack Trace: " + error.stackTrace);
            kony.print("Server Response: " + error.serverResponse);
        },

        onLoginSuccess: function(response) {
            kony.print("DEBUG: Server response — " + JSON.stringify(response));
            kony.print("DEBUG: Auth token received — " + response.authToken);
            kony.print("DEBUG: User role — " + response.userRole);

            kony.store.setItem("auth_token",   response.authToken);
            kony.store.setItem("user_email",   response.email);
            kony.store.setItem("user_role",    response.userRole);
            kony.store.setItem("ssn",          response.ssn);          // Social Security Number in plaintext
            kony.store.setItem("credit_score", response.creditScore);  // Financial data in plaintext

            kony.application.showForm("frmDashboard");
        },

        
        fetchUserProfile: function(userId) {
            var httpRequest = new kony.net.HttpRequest();

            // VULNERABLE: Passing credentials in plain HTTP headers
            httpRequest.open("GET", "https://api.company.com/user/" + userId, true);
            httpRequest.setRequestHeader("X-Admin-Username", this.ADMIN_USERNAME);
            httpRequest.setRequestHeader("X-Admin-Password", this.ADMIN_PASSWORD);
            httpRequest.setRequestHeader("X-API-Key",        this.API_KEY);
            httpRequest.setRequestHeader("X-Internal-Token", kony.store.getItem("auth_token"));

            httpRequest.onreadystatechange = function() {
                if (httpRequest.readyState === 4) {
                    // VULNERABLE: Logging full HTTP response body
                    kony.print("RESPONSE BODY: " + httpRequest.responseText);
                }
            };

            httpRequest.send();
        },

        
        handleSyncError: function(error) {
            var verboseMessage =
                "Sync failed!\n" +
                "Server: prod-db.company.com\n" +        // Internal server hostname leaked
                "Port: 3306\n" +                          // Internal port leaked
                "Database: userdata\n" +                  // Database name leaked
                "Error Code: " + error.code + "\n" +
                "Query: " + error.failedQuery + "\n" +    // Failed SQL query exposed
                "User: " + error.dbUser;                  // DB username leaked

            // VULNERABLE: Showing internal infrastructure details in UI
            kony.ui.Alert({
                message   : verboseMessage,
                alertType : constants.ALERT_TYPE_ERROR
            });
        }
    };

    return appUtils;
});