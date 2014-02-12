/* 
decimal_sep: character used as deciaml separtor, it defaults to '.' when omitted
thousands_sep: char used as thousands separator, it defaults to ',' when omitted
*/
Number.prototype.toMoney = function(decimals, decimal_sep, thousands_sep) { 
   var n = this,
   c = isNaN(decimals) ? 2 : Math.abs(decimals), //if decimal is zero we must take it, it means user does not want to show any decimal
   d = decimal_sep || '.', //if no decimal separator is passed we use the dot as default decimal separator (we MUST use a decimal separator)

   /*
   according to [http://stackoverflow.com/questions/411352/how-best-to-determine-if-an-argument-is-not-sent-to-the-javascript-function]
   the fastest way to check for not defined parameter is to use typeof value === 'undefined' 
   rather than doing value === undefined.
   */   
   t = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep, //if you don't want to use a thousands separator you can pass empty string as thousands_sep value

   sign = (n < 0) ? '-' : '',

   //extracting the absolute value of the integer part of the number and converting to string
   i = parseInt(n = Math.abs(n).toFixed(c)) + '', 

   j = ((j = i.length) > 3) ? j % 3 : 0; 
   return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : ''); 
};

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

var copyDataObject = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

var intify = function(string) {
  return parseInt(string, 10);  
};

var twoDecimalify = function(num) {
  if (typeof num !== "number") {
    num = parseFloat(num, 10);
  }
  return num.toFixed(2).replace(/\.0{0,2}$/, "");
};

var hasClass = function(element, className) {
  return (element.classList.contains(className));
};

var notNull = function(x) {
  return x !== null && x !== undefined && x !== "";
};

var isNum = function(x) {
  return notNull(x) && !isNaN(x);
}

var getFirstDilutingRoundIndex = function(roundId, rounds) {
  var firstDilutingRound = 0;
  for (var i = 0; i < rounds.length; i++) {
    if (roundId == rounds[i].id) {
      firstDilutingRound = i + 1;
      break;
    }
  }
  return firstDilutingRound;
};

var getCashOutPhrase = function(takehome) {
  var cashOutPhrase = "which is pitiful";
  if (takehome > 3) {
    cashOutPhrase = "to buy a coffee";
  }
  if (takehome > 10) {
    cashOutPhrase = "to buy dinner";
  }
  if (takehome > 200) {
    cashOutPhrase = "to buy a vacation";
  }
  if (takehome > 10000) {
    cashOutPhrase = "to buy a car";
  }
  if (takehome > 150000) {
    cashOutPhrase = "to buy a boat";
  } 
  if (takehome > 500000) {
    cashOutPhrase = "to buy a house";
  }
  if (takehome > 5000000) {
    cashOutPhrase = "to buy a plane";
  }
  if (takehome > 50000000) {
    cashOutPhrase = "to buy an island";
  }
  if (takehome > 500000000) {
    cashOutPhrase = "to fucking swim in";
  } 
  return cashOutPhrase;
};

var getCrunchbaseListing = function(companyName) {
  var searchUrl = 
  "http://api.crunchbase.com/v/1/search.js?api_key=zmsprfmrueqhn9dqt7ds2z87&query=" 
  + companyName
  + "&callback=?";
  $.getJSON(searchUrl, function(data) {
    console.log(data);
  });
};

