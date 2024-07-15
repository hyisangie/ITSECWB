const fs = require('fs');

//app.log to store log message
const logFile = fs.createWriteStream('app.log', { flags: 'a' });

// log function
function log(eventType, userId, details) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${eventType} - User: ${userId} - ${details}\n`;
  
  // write to file
  logFile.write(logMessage);
  
  // show in console
  console.log(logMessage);
}

// simulate authentication
function authenticateUser(username, status) {
  if(status == 1) {
    log("Authentication", username, "Login successful");
  } else if(status == 2){
    log("Authentication", username, "Login failed");
  } else {
    log("Authentication", username, "Logout");
  }
}

// simulate admin action
function adminAction(adminId, action) {
  log("Admin Action", adminId, `Performed action: ${action}`);
}

// 导出函数供其他模块使用
module.exports = {
  authenticateUser,
  adminAction,
  log
};