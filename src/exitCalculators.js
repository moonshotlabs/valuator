/** @jsx React.DOM */

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