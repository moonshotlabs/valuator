/** @jsx React.DOM */

var RoundsList = React.createClass({
  getInitialState: function() {
    // this.generatePostRoundEquity();
    return {equityPercentList: [2, 2, 2, 2, 2, 2]};
  },

  generatePostRoundEquity: function() {
    this.state.equityPercentList = [];
    var firstDilutingRoundIndex = getFirstDilutingRoundIndex(this.props.startingRoundLink.value, this.props.roundsLink.value);
    
    var currentEquityPercent = this.props.startingEquityPercent;
    for (var i = 0; i < this.props.roundsLink.value.length; i++) {
      var round = this.props.roundsLink.value[i];
      if (i < firstDilutingRoundIndex) {
        this.state.equityPercentList.push(currentEquityPercent);
      } else {
        currentEquityPercent = currentEquityPercent * (1 - (round.amount / round.valuation));
        this.state.equityPercentList.push(currentEquityPercent);
      }
    }
  },

  onRoundChanged: function(round, index) {
    newRounds = copyDataObject(this.props.roundsLink.value);
    newRounds[index] = round;
    this.props.roundsLink.requestChange(newRounds);
  },

  updateRound: function(round, i, e) {
    newRound = copyDataObject(round);
    if (hasClass(e.target, "round-amount-input")) {
      newRound.amount = intify(e.target.value);  
    } else if (hasClass(e.target, "round-valuation-input")) {
      newRound.valuation = intify(e.target.value);  
    }
    this.onRoundChanged(newRound, i);
  },

  render: function() {
    var firstDilutingRoundIndex = getFirstDilutingRoundIndex(this.props.startingRoundLink.value, this.props.roundsLink.value);
    this.generatePostRoundEquity();
    var renderRound = function(round, i) {
      if (i < firstDilutingRoundIndex) {
        return;
      } else {
        return (
          <div key={round.name} className="Grid Grid--center Grid--gutters row">
            <div className="Grid-cell u-1of3"><h2 className="row-title">{round.name} ROUND</h2></div>
            <div className="Grid-cell math-cell">
              <div className="math">
                <span className="info-block">
                  <span className="equity">{twoDecimalify(this.state.equityPercentList[i - 1])}%</span>
                  <div className="info-text">before</div>
                </span>
                <span className="times-sign">x</span>
                <span className="big-paren">(</span>
                1 - 
                
                <div className="fraction">
                  <div className="fraction-top">
                    <div className="money-input">
                      <span className="money-input-dollarsign">$</span>
                      <input
                        className={"money-input-field round-amount-input investment series-" + round.name + "-amount"}
                        type="number"
                        step="1000000"
                        min="0"
                        onChange={this.updateRound.bind(this, round, i)}
                        defaultValue={round.amount} />
                    </div>
                    <span className="info-text">invested</span>
                  </div>

                  <div className="fraction-bottom">
                    <div className="money-input">
                      <span className="money-input-dollarsign">$</span>
                      <input 
                        className={"money-input-field round-valuation-input series-" + round.name + "-valuation"}
                        type="number"
                        step="1000000"
                        min="0"
                        onChange={this.updateRound.bind(this, round, i)}
                        defaultValue={round.valuation} />
                    </div>
                    <span className="info-text">valuation</span>
                  </div>
                </div>
                
                <span className="big-paren">)</span>
                =
                <span className="info-block">
                  <span className="equity">{twoDecimalify(this.state.equityPercentList[i])}%</span>
                  <div className="info-text">after</div>
                </span>
              </div>

              
            </div>
          </div>
        )
      }
    }.bind(this);
    return <div>{this.props.roundsLink.value.map(renderRound)}</div>;

  }
});

var JoiningRow = React.createClass({
  render: function() {
    return (
      <div className="Grid Grid--center Grid--gutters row">
        <div className="Grid-cell u-1of3"><h2 className="row-title">JOINED</h2></div>
        <div className="Grid-cell">

          after the
          
          <StartingRoundSelector 
            startingRoundLink={this.props.startingRoundLink}
            rounds={this.props.rounds} />
          
          for
          
          <span className="input-postfix-block">
            <input 
              className="equity percent-input-field input-postfix-field"
              type="number"
              step="0.05"
              min="0"
              max="100"
              onChange={function(e) {
                if (!isNaN(e.target.value) && notNull(e.target.value)) {
                  this.props.startingEquityPercentLink.requestChange(parseFloat(e.target.value));
                }
                
              }.bind(this)} 
              defaultValue={this.props.startingEquityPercentLink.value} />
            <span className="input-postfix-suffix">%</span>
          </span>
          
          of the company.
        </div>
      </div>
    );
  }
});

var StartingRoundSelector = React.createClass({
  onChange: function(e) {
    this.props.startingRoundLink.requestChange(e.target.value);
  },

  render: function() {
    var createRoundOption = function(round) {
      var prettyRoundName = round.name + " round";
      if (round.name === "founding") {
        prettyRoundName = "founding";
      }
      return <option key={round.name} value={round.name}>{prettyRoundName}</option>;
    };

    return (
      <select value={this.props.startingRoundLink.value} onChange={this.onChange}>
        {this.props.rounds.map(createRoundOption)}
      </select>
    );
  }
});

var SaleCalculator = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function() {
    return {
      valuation: 40000000000,
      liquidationPreference: 1
    };
  },

  calculateTakehome: function() {
    var postLiquidation = this.calculatePostLiquidation();
    var firstDilutingRoundIndex = getFirstDilutingRoundIndex(this.props.startingRoundLink.value, this.props.state.rounds);
        
    var takehome = this.props.state.startingEquityPercent / 100 * postLiquidation;
    for (var i = firstDilutingRoundIndex; i < this.props.state.rounds.length; i++) {
      var round = this.props.state.rounds[i];
      takehome = takehome * (1 - round.amount / round.valuation);
    }
    return takehome;
  },

  calculatePostLiquidation: function() {
    return this.state.valuation - 
        this.state.liquidationPreference * this.props.state.rounds.reduce(
          function(partial, round) {
            return partial + round.amount;
          }, 0);
  },

  render: function() {
    var totalInvestment = this.props.state.rounds.reduce(
      function(partial, round) {
        return partial + round.amount;
      }, 0);
      
    var takehome = this.calculateTakehome();
    var cashOutPhrase = getCashOutPhrase(takehome);

    return (
      <div className="exit-option-block Grid-cell">
        <h2 className="exit-header">SELL</h2>

        <div className="math">
          <div className="math-row">
            <span className="info-block">
              <div className="money-input">
                <span className="money-input-dollarsign">$</span>
                <input 
                  className={"money-input-field"}
                  type="number"
                  step="10000000"
                  min="0"
                  onChange={function(e) {
                    this.setState({valuation: intify(e.target.value)})
                  }.bind(this)}
                  defaultValue={this.state.valuation} />
              </div>
              <div className="info-text">sale price</div>
            </span>
            
            <span className="minus-sign">-</span>
            <span className="info-block">
              <div className="investment">${totalInvestment / 1000000}M</div>
              <div className="info-text">total investment</div>
            </span>
            <span className="times-sign">x</span>
  
            <span className="info-block">
              <div>
                <span className="input-postfix-block">
                  <input 
                    className="input-postfix-field"
                    type="number"
                    step="1"
                    min="0"
                    max="50"
                    valueLink={this.linkState('liquidationPreference')} />
                  <span className="input-postfix-suffix">x</span>
                </span>
              </div>
              <div className="info-text">liquidation preference</div>
            </span>
          </div>

          <div className="math-row">
            <span className="equals"> = </span>

            <span className="info-block">
              <div>${this.calculatePostLiquidation().toMoney()}</div>
              <div className="info-text">after investors</div>
            </span>
            <span className="times-sign">x</span>
            <span className="info-block">
              <span className="equity">{twoDecimalify(this.props.finalEquity)}%</span>
              <div className="info-text">my equity after dilution</div>
            </span>
            
          </div>

          <div className="math-row">
            <span className="equals"> = </span>

            <span className="info-block">
              <div>${takehome.toMoney()}</div>
              <div className="info-text">{cashOutPhrase}</div>
            </span>
          </div>

        </div>
      </div>
    );
  }
});

// →

var IPOCalculator = React.createClass({
  getInitialState: function() {
    return {
      valuation: 40000000000
    };
  },

  calculateTakehome: function() {
    var postLiquidation = this.state.valuation;
    var firstDilutingRoundIndex = getFirstDilutingRoundIndex(this.props.startingRoundLink.value, this.props.state.rounds);

    var takehome = this.props.state.startingEquityPercent / 100 * postLiquidation;
    for (var i = firstDilutingRoundIndex; i < this.props.state.rounds.length; i++) {
      var round = this.props.state.rounds[i];
      takehome = takehome * (1 - round.amount / round.valuation);
    }
    return takehome;
  },

  render: function() {
    var totalInvestment = this.props.state.rounds.reduce(
      function(partial, round) {
        return partial + round.amount;
      }, 0);
      
    var takehome = this.calculateTakehome();
    var cashOutPhrase = getCashOutPhrase(takehome);

    return (
      <div className="exit-option-block Grid-cell">
        <h2 className="exit-header">IPO</h2>

        <div className="math">
          <div className="math-row">
            <span className="info-block">
              <div className="money-input">
                <span className="money-input-dollarsign">$</span>
                <input 
                  className={"money-input-field"}
                  type="number"
                  step="10000000"
                  min="0"
                  onChange={function(e) {
                    this.setState({valuation: intify(e.target.value)})
                  }.bind(this)}
                  defaultValue={this.state.valuation} />
              </div>
              <div className="info-text">sale price</div>
            </span>

            <span className="times-sign">x</span>
            <span className="info-block">
              <span className="equity">{twoDecimalify(this.props.finalEquity)}%</span>
              <div className="info-text">my equity after dilution</div>
            </span>
          </div>

          <div className="math-row">
            <span className="equals"> = </span>

            <span className="info-block">
              <div>${takehome.toMoney()}</div>
              <div className="info-text">{cashOutPhrase}</div>
            </span>
          </div>


        </div>



        
      </div>
    );
  }
});

var ValueCalculator = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function() {
    app = this;
    return {
      companyName: 'Dropbox',
      companyId: 'dropbox',
      startingEquityPercent: 2,
      startingRound: 'A',
      rounds: [
        {
          name: 'founding',
          valuation: null,
          amount: null
        },
        {
          name: 'A',
          valuation: 20000000,
          amount: 1200000
        },
        {
          name: 'B',
          valuation: 4000000000,
          amount: 250000000
        },
        {
          name: 'C',
          valuation: 10000000000,
          amount: 250000000
        }
      ]
    };
  },
  updateData: function(changes) {
    this.setState(changes);
  },
  onChange: function(event) {
    this.setState({startingEquityPercent: event.target.value});
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
          startingRoundLink={startingRoundLink}
          startingEquityPercentLink={startingEquityPercentLink}
          rounds={this.state.rounds} />

        <RoundsList 
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
