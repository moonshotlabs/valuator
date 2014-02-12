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
          <div 
            key={this.props.companyId + round.name + i} 
            className="card row funding-row Grid Grid--center Grid--gutters"
            onClick={function(e) {
              if (!$(e.target).is("input")) {
                $(e.target).closest(".funding-container").toggleClass("expand");
              }
            }}>
            <div className="Grid-cell u-1of3"><h2 className="row-title">{round.name} ROUND</h2></div>
            <div className="Grid-cell math-cell">
              <div className="math">
                <span className="info-block pre-round-equity">
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
