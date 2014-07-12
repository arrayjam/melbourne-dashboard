/** @jsx React.DOM */

var cx = React.addons.classSet;

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
      <div className="app">
        <header className="clearfix">
          <div className="logo col-xs-3"><img src="/images/logo.png" /></div>
          <Hello />
        </header>
        <div className="middle">
          <Weather weatherData={this.state.widgets.weather} />
          <Map />
        </div>
        <div className="metrics">
          <Events />
          <Pedestrians percent={82} />
          <Train />
        </div>
      </div>
    );
  }
});

var Hello = React.createClass({
  getInitialState: function() {
    return { timestamp: new Date() };
  },

  componentDidMount: function() {
    setInterval(function() {
      this.setState({ timestamp: new Date() });
    }.bind(this), 1000);
  },

  render: function() {
    var day = d3.time.format("%A"),
        time = d3.time.format("%_H:%M"),
        ampm = d3.time.format("%p"),
        date = d3.time.format("%e %B %Y");
    return (
      <div className="today col-xs-2 pull-right">
        <div className="hello">Hello, {day(this.state.timestamp)}</div>
        <div className="time">{time(this.state.timestamp)}{ampm(this.state.timestamp).toLowerCase()}&nbsp;&nbsp;|&nbsp;&nbsp;{date(this.state.timestamp)}</div>
      </div>
    );


  }
});

var Map = React.createClass({
  render: function() {
    return (
      <div className="col-xs-9 map"></div>
    );
  }
});

var Weather = React.createClass({
  getMessage: function(type) {
    if (type === "rain") {
      return "Weather sucks, man.";
    }
  },

  render: function() {
    return (
      <div className="weather col-xs-3">
        <div className="weather-top">
          <div className="temperature">{this.props.weatherData.temperature}&deg;</div>
          <img className="icon" src="/images/cloud.png" alt="cloud" />
        </div>
        <div className="weather-message">{this.getMessage(this.props.weatherData.type)}</div>
      </div>
    );
  }
});

var Events = React.createClass({
  getInitialState: function() {
    return { events: [] };
  },

  componentDidMount: function() {
    d3.json("/events", function(data) {
      this.setState({events: data});
    }.bind(this));
  },

  render: function() {
    var content;
    if (this.state.events.length === 0) {
      content = <div className="empty">Fetching events...</div>;
    } else {
      content = this.state.events.map(function(event) {
        return (
          <div className="event" key={event.guid}>
            <div className="event-name">{event.title}</div>
            <div className="fat-link"><a href={event.link}>See this</a></div>
          </div>
        );
      });
    }

    return (
      <div className="col-xs-3 events widget">
        <h1>Things On Today</h1>
        <div className="widget-body">
          {content}
        </div>
      </div>
    );
  }
});

var Pedestrians = React.createClass({
  getMessage: function() {
    if (this.props.percent > 80) {
      return <div>It’s really busy right now.<br />Maybe there’s something on?</div>;
    } else {
      return "Pretty quiet.";
    }
  },

  render: function() {
    return (
      <div className="col-xs-3 pedestrians widget">
        <h1>Is it Busy in the City?</h1>
        <div className="widget-body">
          <div className="busy">
            {this.getMessage()}
          </div>
          <div className="pedestrians-graph">
            <div className="pedestrians-graph-label">busy</div>
            <div className="guage">
              <div className="guage-fill" style={{height: this.props.percent + "%"}}></div>
            </div>
            <div className="pedestrians-graph-label">quiet</div>
          </div>
          <div className="links">
            <a href="http://www.thatsmelbourne.com.au/Pages/Home.aspx" className="fat-link">See what's on</a><br />
            <a href="https://data.melbourne.vic.gov.au/Transport/Pedestrian-Counts/b2ak-trbp" className="fat-link">See foot traffic data</a>
          </div>
        </div>
      </div>
    );
  }
});

var Train = React.createClass({
  getInitialState: function() {
    return {
      line: "",
      direction: "to",
      trains: [],
    };
  },

  directionChange: function(direction) {
    if (direction === "from" || direction === "to") this.setState({direction: direction});
  },

  handleSubmit: function() {
    var line = this.refs.line.getDOMNode().value.trim();
    if (line) {
      this.setState({line: line});
    }
    return false;
  },

  render: function() {
    if (this.state.line !== "" && this.state.trains.length === 0) {
      return (
        <div className="col-xs-3 train widget">
          <h1>CBD Train Times</h1>
          <div className="empty">Loading...</div>
        </div>
      );
    } else if (this.state.line === "") {
      var directionClassFrom = cx({
        directionButton: true,
        from: true,
        active: this.state.direction === "from"
      });

      var directionClassTo = cx({
        directionButton: true,
        to: true,
        active: this.state.direction === "to"
      });

      return (
        <div className="col-xs-3 train widget">
          <h1>CBD Train Times</h1>
          <div className="directionButtons">
            <div className={directionClassFrom} onClick={this.directionChange.bind(this, "from")}>From</div>
            <div className={directionClassTo} onClick={this.directionChange.bind(this, "to")}>To</div>
          </div>
          <form onSubmit={this.handleSubmit}>
            <input type="text" placeholder="eg. Footscray" ref="line" className="form-control" />
          </form>
        </div>
      );
    } else {
      //      var explanation = (this.state.line === "from") ?
      return (
        <div className="col-xs-3 train widget">
          <h1>Want to catch a train?</h1>
          <div>{this.state.line}</div>
        </div>
      );
    }
  }
});


React.renderComponent(
  <Dashboard dataUrl="data.json"/>,
  document.body
);

