/** @jsx React.DOM */

var Dashboard = React.createClass({
  getInitialState: function() {
    return {widgets: {
    "weather": {}}};
  },

  componentWillMount: function() {
    d3.json(this.props.dataUrl, function(data) {
      console.log(data);
      this.setState({widgets: data.widgets});
    }.bind(this));
  },

  render: function() {
    return (
      <Weather weatherData={this.state.widgets.weather} />
    );
  }
});

var Weather = React.createClass({
  getMessage: function() {
    if (this.props.weatherData.type === "rain") {
      return "Weather sucks, man.";
    }
  },

  render: function() {

    return (
      <div className="weather">
        <div>
          <div>
            <h1>{this.props.weatherData.temperature}</h1>
            <img src={rainIcon} />
          </div>
          <div>{this.getMessage()}</div>
        </div>
      </div>
    );
  }
});

React.renderComponent(
  <Dashboard dataUrl="data.json"/>,
  document.body
);

var rainIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAEq0lEQVR4nO3bya9URRTA4c/3IKIGA/okEhDR4ICSmLhwWIiiURQhTjEqiiYuRHACWbFAY+LCv8A4RXSBQ1wYN2wMEkKCcSFG1BhkCAIOCUZEQAK+wUU1eLtud9/73r23+/ULv6QW3bfOuedU13DqVDWjn4XYXSsLOmxLR9iLoVrZU7byM8pWWAFD0edSbe4pU1k3croBOm1AxUzAeZ02oij7jGwSfBh/YQCvlm9W+1iIX7Bf/mXwMfT7v+EGjYGekJfY+SH8LQyHMc9t0s7346FmAuNKfPkVuB3X40rMRG/t2dFa2Yot+BzbW+iahkW4C7NwgbD+HxACo8/wKX6P5B5PvJMw/p/AxyNzKZvxWIKv1Ld6VhnERjyofiWagXdwPIeOE3hDaKyTrFL/yz9arrv1LMLOHIZmla2YhwdwcATyh3FvzaZxWI11Qm+shAnCr1TU8TLLAFZU5XCS8/FlC0O24hWh9edgCibjYtyANRnyyfItluGymo7JuBzL8V2D+gNCr6yMKfihwYsH8WHNuLxcg/drso2cf1nrTU8PnsI/kdwhTB2GHbk5C980MHQ7ri2gdy5+aqB3S+2deeSPRbJvF7CnKW81MHKDcqKrScKyGOvP68jTkVw/LirBrlPc2cC4L4QlsCzGY32D96zFZvyBP2vlgND4LwnDrgfbIrlnyzKsFzsi5TuFybBsJglDargrwAZ8FH23viyjHokUD+K6spQ34EbNJ8bhlB8TOhdgV4M6u4WNVks2R0KfFPMvF+8q3gCHEvr2tKi3r5Uhl0aVB4UYv2pmJ963XghnpwtxQF/t+VJs0tyxowl9e1vUa9kAz0SVvy7Buby8J99Qu1XoyrFj+xN1FqhPqiTr3N1K+bpIYM0wHGgn50oP1SHcVFRxvLTcUlRhhUyWXq02FVV6IFI4nFC3E8yVXkFWG2FoPA3/RsomlmJmtWyUHgr9wpwyPa+SJUIOLVaUJzbvNE9qPuMfFnIOLXlB80Ck1Pi6Iq7WOj4YFHxsyGKNnd+GlTinQsPLpE/IRbyo+fZ9cSw0U7rbHxMCjm4+PerF80L+MOnbQdHk+EFU4ShubqelFTNfOtG69uTDS4R0UvLh0vbbWDnL1ft4Qm1lWC095rvh3sBw6ZWeE1b1SHf1N2sPxxoDQjY7yTzCpiDZKrPba1dbmaPe192kk4pnd8q6NjBRva9HeoRQMclYHP/NGOzBb9GXMzphSZuIffu1R8iXJansTG0UcEf0eRchUkqOi+/VHzGPFcYJydKkr8sI53bxpYKmG4YuJnl0fjIQOhUOx5nYE9LdpZuZL53feD1ZYZr0Zui4kBjt5uHQi+ekN0OHcGFc+R7pPcGQcBS9AlfpjotGEwRbVwrzWexPy2P0lco5mRmtJddFivtxZBQYW3ZJXqXJpA+vSYfJ3ViO1Xzpa+RoVtg7FfcJ88MsYbI8M0Om0xwXbpbu0Pw63WlOUwJF/8vTafnCFP0vT6flUWzvP1RQV6fl0d05/1KosgG6foxnEQccMVljtGr5ysn6L0+WgVXLV07Wf3myHKhaPhdVZoBHxSyfxelVoELdyatqP3dAvuMUHaOljPEs/gP5dzM6uhmUqgAAAABJRU5ErkJggg=="
