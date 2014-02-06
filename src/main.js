/** @jsx React.DOM */

var getCrunchbaseListing = function(companyName) {
  var searchUrl = 
  "http://api.crunchbase.com/v/1/search.js?api_key=zmsprfmrueqhn9dqt7ds2z87&query=" 
  + companyName
  + "&callback=?";
  $.getJSON(searchUrl, function(data) {
    console.log(data);
  });
};

var ValueCalculator = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function() {
    app = this;
    return {"companyName":"Dropbox","companyId":"dropbox","startingEquityPercent":1,"startingRound":1391729687681,"rounds":[{"name":"founding","id":1391729687681,"valuation":null,"amount":null,"fundedYear":2007,"fundedMonth":6,"fundedDay":1},{"name":"seed","id":372,"fundedYear":2007,"fundedMonth":6,"fundedDay":1,"amount":500000,"valuation":2500000},{"name":"seed","id":3366,"fundedYear":2008,"fundedMonth":9,"fundedDay":4,"amount":1200000,"valuation":6000000},{"name":"a","id":9737,"fundedYear":2009,"fundedMonth":11,"fundedDay":24,"amount":6000000,"valuation":30000000},{"name":"b","id":25090,"fundedYear":2011,"fundedMonth":10,"fundedDay":18,"amount":250000000,"valuation":1250000000},{"name":"c","id":61611,"fundedYear":2014,"fundedMonth":1,"fundedDay":17,"amount":250000000,"valuation":1250000000}]};
    // {
    //   companyName: 'Dropbox',
    //   companyId: 'dropbox',
    //   startingEquityPercent: 2,
    //   startingRound: 'A',
    //   rounds: [
    //     {
    //       name: 'founding',
    //       valuation: null,
    //       amount: null
    //     },
    //     {
    //       name: 'A',
    //       valuation: 20000000,
    //       amount: 1200000
    //     },
    //     {
    //       name: 'B',
    //       valuation: 4000000000,
    //       amount: 250000000
    //     },
    //     {
    //       name: 'C',
    //       valuation: 10000000000,
    //       amount: 250000000
    //     }
    //   ]
    // };
  },
  updateData: function(changes) {
    this.setState(changes);
  },
  onChange: function(event) {
    this.setState({startingEquityPercent: event.target.value});
  },

  fetchCompany: function(crunchbaseKey) {
    var searchUrl = 
      "http://api.crunchbase.com/v/1/company/"
      + crunchbaseKey
      + ".js?api_key=zmsprfmrueqhn9dqt7ds2z87"
      + "&callback=?";
      $.getJSON(searchUrl, function(data) {
        console.log(data);
        var newState = {
          companyName: data.name,
          companyId: data.permalink,
          startingEquityPercent: 1
        };

        var newRounds = [{
          name: 'founding',
          id: new Date().getTime(),
          valuation: null,
          amount: null,
          fundedYear: isNum(data.founded_year) ? data.founded_year : 0,
          fundedMonth: isNum(data.founded_month) ? data.founded_month : 0,
          fundedDay: isNum(data.founded_day) ? data.founded_day : 0,
        }];

        newState.startingRound = newRounds[0].id;

        for (var i = 0; i < data.funding_rounds.length; i++) {
          round = data.funding_rounds[i];
          var newRound = {};
          newRound.name = round.round_code.replace(/_/g, ' ');
          newRound.id = round.id;
          newRound.fundedYear = isNum(round.funded_year) ? round.funded_year : 0;
          newRound.fundedMonth = isNum(round.funded_month) ? round.funded_month : 0;
          newRound.fundedDay = isNum(round.funded_day) ? round.funded_day : 0;
          if (notNull(round.raised_amount)) {
            newRound.amount = round.raised_amount;
          } else {
            newRound.amount = 500000
          }
          newRound.valuation = 5 * newRound.amount
          newRounds.push(newRound);
        }

        newRounds.sort(function(a, b) {
          if (a.fundedYear !== b.fundedYear) {
            return a.fundedYear - b.fundedYear;
          } else if (a.fundedMonth !== b.fundedMonth) {
            return a.fundedMonth - b.fundedMonth;
          } else {
            return a.fundedDay - b.fundedDay;
          }
        });

        newState.rounds = newRounds;
        console.log(JSON.stringify(newState));
        this.setState(newState);
      }.bind(this));
  },

  calculateFinalEquity: function() {
    var equity = this.state.startingEquityPercent;
    for (var i = getFirstDilutingRoundIndex(this.state.startingRound, this.state.rounds); i < this.state.rounds.length; i++) {
      var round = this.state.rounds[i];
      equity = equity * (1 - round.amount / round.valuation);
    }
    return equity;
  },

  render: function() {
    var startingRoundLink = this.linkState('startingRound');
    var startingEquityPercentLink = this.linkState('startingEquityPercent');
    var roundsLink = this.linkState('rounds');

    return (
      <div>

        <JoiningRow
          companyId={this.state.companyId}
          startingRoundLink={startingRoundLink}
          startingEquityPercentLink={startingEquityPercentLink}
          rounds={this.state.rounds} />

        <RoundsList 
          companyId={this.state.companyId}
          roundsLink={roundsLink} 
          startingRoundLink={startingRoundLink}
          startingEquityPercent={this.state.startingEquityPercent} />

        <h2 className="exit-divider">Now what if we...</h2>

        <div className="Grid">
          <SaleCalculator 
            state={this.state} 
            startingRoundLink={startingRoundLink}
            finalEquity={this.calculateFinalEquity()} />
          <IPOCalculator 
            state={this.state} 
            startingRoundLink={startingRoundLink}
            finalEquity={this.calculateFinalEquity()} />
        </div>
        
      </div>
    );
  }
});


React.renderComponent(<ValueCalculator />, document.getElementById("container"));

var companies = new Bloodhound({
  datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.name); },
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  limit: 10,
  prefetch: {
    url: '/src/company-prefetch-trimmed.json'
  },
  remote: {
    url: 'http://api.crunchbase.com/v/1/search.js?api_key=zmsprfmrueqhn9dqt7ds2z87&query=%QUERY&callback=?',
    filter: function(data) {
      return $.map(data.results, function(result) {
        if (result.namespace === "company") {
          return result;
        }
      });
    }
  }
});
 
companies.initialize();
 
$('.typeahead').typeahead(null, {
  name: 'companies',
  displayKey: 'name',
  source: companies.ttAdapter()
}).on("typeahead:selected", function(e, suggestion, dataset) {
  app.fetchCompany(suggestion.permalink);
});
















