/** @jsx React.DOM */

var JoiningRow = React.createClass({
  render: function() {
    return (
      <div className="Grid Grid--center Grid--gutters row">
        <div className="Grid-cell u-1of3"><h2 className="row-title">JOINED</h2></div>
        <div className="Grid-cell">

          after the
          
          <StartingRoundSelector 
            companyId={this.props.companyId}
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
              valueLink={this.props.startingEquityPercentLink}
              defaultValue={this.props.startingEquityPercentLink.value} />
            <span className="input-postfix-suffix">%</span>
          </span>
          
          of the company.
        </div>
      </div>
    );
  }
});

// onChange={function(e) {
//                 if (!isNaN(e.target.value) && notNull(e.target.value)) {
//                   this.props.startingEquityPercentLink.requestChange(parseFloat(e.target.value));
//                 }
                
//               }.bind(this)} 