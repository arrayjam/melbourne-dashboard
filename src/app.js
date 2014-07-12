/** @jsx React.DOM */

var Dashboard = React.createClass({
  componentWillMount: function() {
    d3.json(this.props.dataUrl, function(data) {
      this.setState({data: data});
    });
  },

  render: function() {
    return (
      <div>{this.state.data}</div>
    );
  }
});

React.renderComponent(
  <Dashboard dataUrl="data.json"/>,
  document.body
);

