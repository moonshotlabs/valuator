/** @jsx React.DOM */

var RoundsList = React.createClass({
  onRoundChanged: function(round, index) {
    newRounds = copyDataObject(this.props.roundsLink.value);
    newRounds[index] = round;
    this.props.roundsLink.requestChange(newRounds);
  },

  updateRound: function(round, i, e) {
    newRound = copyDataObject(round);
    if (e.target.getAttribute("class") == "round-amount-input") {
      newRound.amount = intify(e.target.value);  
    } else if (e.target.getAttribute("class") == "round-valuation-input") {
      newRound.valuation = intify(e.target.value);  
    }
    this.onRoundChanged(newRound, i);
  },

  render: function() {
    var that = this;
    var renderRound = function(round, i) {
      if (i < this.props.firstDilutingRound) {
        return;
      } else {
        return (
          <div key={round.name} className="Grid Grid--center Grid--gutters row">
            <div className="Grid-cell u-1of4"><h2 className="row-title">{round.name} ROUND</h2></div>
            <div className="Grid-cell">
              invested             
              
              <input 
                className={"round-amount-input series-" + round.name + "-amount"}
                onChange={this.updateRound.bind(this, round, i)}
                defaultValue={round.amount} />
              
              at a valuation of  

              <input 
                className={"round-valuation-input series-" + round.name + "-valuation"}
                onChange={this.updateRound.bind(this, round, i)}
                defaultValue={round.valuation} />

              for {(round.amount / round.valuation).toFixed(2)}
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
        <div className="Grid-cell u-1of4"><h2 className="row-title">JOINED</h2></div>
        <div className="Grid-cell">

          after the
          
          <StartingRoundSelector 
            startingRoundLink={this.props.startingRoundLink}
            rounds={this.props.rounds} />
          
          round for
          
          <input 
            onChange={function(e) {
              this.props.startingEquityPercentLink.requestChange(e.target.value);
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
      startingRound: 'A',
      rounds: [
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
      exitValuation: 40000000000
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
  calculateTakehome: function() {
    var firstDilutingRound = this.getFirstDilutingRoundIndex();
    var postLiquidation = this.state.exitValuation - this.state.rounds.reduce(
      function(partial, round) {
        return partial + round.amount;
      }, 0);

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

        <RoundsList roundsLink={roundsLink} firstDilutingRound={this.getFirstDilutingRoundIndex()} />


        <div className="Grid Grid--center Grid--gutters row">
          <div className="Grid-cell u-1of4"><h2 className="row-title">exit</h2></div>
          <div className="Grid-cell">
            If we sell for 
            <input 
              onChange={function(e) {
                this.updateData({exitValuation: intify(e.target.value)})
              }.bind(this)}
              defaultValue={this.state.exitValuation} />
            I will make 
            <span>${this.calculateTakehome().toLocaleString()}</span>.
          </div>
        </div>
      </div>
    );
  }
});


React.renderComponent(<ValueCalculator />, document.getElementById("container"));
