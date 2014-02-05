/** @jsx React.DOM */

var RoundsList = React.createClass({
  getInitialState: function() {
    // this.generatePostRoundEquity();
    return {equityPercentList: [2, 2, 2, 2, 2, 2]};
  },

  generatePostRoundEquity: function() {
    this.state.equityPercentList = [];
    
    var currentEquityPercent = this.props.startingEquityPercent;
    for (var i = 0; i < this.props.roundsLink.value.length; i++) {
      var round = this.props.roundsLink.value[i];
      if (i < this.props.firstDilutingRound) {
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
    // var that = this;
    this.generatePostRoundEquity();
    var renderRound = function(round, i) {
      if (i < this.props.firstDilutingRound) {
        return;
      } else {
        return (
          <div key={round.name} className="Grid Grid--center Grid--gutters row">
            <div className="Grid-cell u-1of3"><h2 className="row-title">{round.name} ROUND</h2></div>
            <div className="Grid-cell math-cell">
              <div className="round-math-surround">
                <span className="equity">{twoDecimalify(this.state.equityPercentList[i - 1])}%</span>
                <span className="times-sign">x</span>
                <span className="paren">(</span>
                1 - 
              </div>
              <div className="fraction">
                <div className="money-input fraction-top">
                  <span className="money-input-dollarsign">$</span>
                  <input 
                    className={"money-input-field round-amount-input series-" + round.name + "-amount"}
                    onChange={this.updateRound.bind(this, round, i)}
                    defaultValue={round.amount} />
                </div>
                
                <div className="money-input fraction-bottom">
                  <span className="money-input-dollarsign">$</span>
                  <input 
                    className={"money-input-field round-valuation-input series-" + round.name + "-valuation"}
                    onChange={this.updateRound.bind(this, round, i)}
                    defaultValue={round.valuation} />
                </div>
              </div>
              <div className="round-math-surround">
                <span className="paren">)</span>
                =
                <span className="equity">{twoDecimalify(this.state.equityPercentList[i])}%</span>
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
          
          round for
          
          <input 
            className="equity"
            onChange={function(e) {
              if (!isNaN(e.target.value) && notNull(e.target.value)) {
                this.props.startingEquityPercentLink.requestChange(parseFloat(e.target.value));
              }
              
            }.bind(this)} 
            defaultValue={this.props.startingEquityPercentLink.value} />
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
      return <option key={round.name} value={round.name}>{round.name}</option>;
    };

    return (
      <select value={this.props.startingRoundLink.value} onChange={this.onChange}>
        {this.props.rounds.map(createRoundOption)}
      </select>
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
      finalEquityPercent: 2,
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
      ],
      exitValuation: 40000000000,
      liquidationPreference: 1
    };
  },
  updateData: function(changes) {
    this.setState(changes);
  },
  onChange: function(event) {
    this.setState({startingEquityPercent: event.target.value});
  },
  getFirstDilutingRoundIndex: function() {
    var firstDilutingRound = 0;
    for (var i = 0; i < this.state.rounds.length; i++) {
      if (this.state.startingRound == this.state.rounds[i].name) {
        firstDilutingRound = i + 1;
        break;
      }
    }
    return firstDilutingRound;
  },
  calculateTakehome: function(includeLiquidation) {
    var firstDilutingRound = this.getFirstDilutingRoundIndex();
    var postLiquidation;
    if (includeLiquidation) {
      postLiquidation = 
        this.state.exitValuation - 
        this.state.liquidationPreference * this.state.rounds.reduce(
          function(partial, round) {
            return partial + round.amount;
          }, 0);
    } else {
      postLiquidation = this.state.exitValuation;
    }

    var takehome = this.state.startingEquityPercent / 100 * postLiquidation;
    for (var i = firstDilutingRound; i < this.state.rounds.length; i++) {
      var round = this.state.rounds[i];
      takehome = takehome * (1 - round.amount / round.valuation);
    }
    return takehome;
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
          firstDilutingRound={this.getFirstDilutingRoundIndex()}
          startingEquityPercent={this.state.startingEquityPercent} />

        <h2 className="exit-divider">NOW WHAT IF WE...</h2>


        <div className="Grid Grid--center Grid--gutters row">
          <div className="Grid-cell u-1of3"><h2 className="row-title">exit</h2></div>
          <div className="Grid-cell">
            If we sell for 

            <div className="money-input fraction-bottom">
              <span className="money-input-dollarsign">$</span>
              <input 
                className={"money-input-field"}
                onChange={function(e) {
                  this.updateData({exitValuation: intify(e.target.value)})
                }.bind(this)}
                defaultValue={this.state.exitValuation} />
            </div>
            I will make 
            <span>${this.calculateTakehome(false).toMoney()}</span>.
          </div>
        </div>
      </div>
    );
  }
});


React.renderComponent(<ValueCalculator />, document.getElementById("container"));
