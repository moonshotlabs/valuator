var copyDataObject = function(obj) {
  return JSON.parse(JSON.stringify(obj));
}

var intify = function(string) {
  return parseInt(string, 10);  
}