/** @jsx React.DOM */

var StartingRoundSelector = React.createClass({
  onChange: function(e) {
    this.props.startingRoundLink.requestChange(e.target.value);
  },

  render: function() {
    var createRoundOption = function(round, index) {
      var prettyRoundName = round.name + " round";
      if (round.name === "founding") {
        prettyRoundName = "founding";
      }
      return (
        <option 
          key={this.props.companyId + round.name + index} 
          value={round.id}>
            {prettyRoundName.toProperCase()}
          </option>
      );
    }.bind(this);

    return (
      <select value={this.props.startingRoundLink.value} onChange={this.onChange}>
        {this.props.rounds.map(createRoundOption)}
      </select>
    );
  }
});
