const fs = require('fs');

//app.log to store log message
const logFile = fs.createWriteStream('app.log', { flags: 'a' });

// log function
function log(eventType, user, details) {
  const timestamp = new Date().toISOString();
  var logMessage
  if(user != undefined) {
    logMessage = `${timestamp} - ${eventType} - User: ${user.email} - ${details}\n`;
  } else {
    logMessage = `${timestamp} - ${eventType} - ${details}\n`;
  }
  
  
  // write to file
  logFile.write(logMessage);
  
  // show in console
  console.log(logMessage);
}

// simulate authentication
function authenticateUser(user, status) {
  if(status == 1) {
    log("Authentication", user, "Login successful");
  } else if(status == 2){
    log("Authentication", user, "Login failed");
  } else {
    log("Authentication", user, "Logout");
  }
}

// simulate admin action
function adminAction(admin, action) {
  log("Admin Action", admin, `Performed action: ${action}`);
}

// 导出函数供其他模块使用
module.exports = {
  authenticateUser,
  adminAction,
  log
};