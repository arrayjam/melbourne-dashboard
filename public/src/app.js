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
          <Twitter />
        </div>
        <div className="bottom">
          <AirQuality />
          <WaterSupply />
          <Rainfall />
        </div>
        <footer>Made at Govhack 2014 by 3 dudes</footer>
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
      <div className="today col-xs-5 pull-right">
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

  componentDidMount: function() {
    d3.select(this.refs.guageFill.getDOMNode())
        .style("height", "0%")
        .transition().duration(2000)
        .style("height", this.props.percent + "%");
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
              <div className="guage-fill" ref="guageFill" style={{height: this.props.percent + "%"}}></div>
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
      stop: "",
      direction: "downtown",
      times: [],
      towhere: "",
      wherefrom: "",
    };
  },

  directionChange: function(direction) {
    if (direction === "downtown" || direction === "uptown") this.setState({direction: direction});
  },

  handleSubmit: function() {
    var stop = this.refs.stop.getDOMNode().value.trim();
    if (stop) {
      this.setState({stop: stop});
      console.log("/trains/" + this.state.direction + "/" + stop);
      d3.json("/trains/" + this.state.direction + "/" + stop, function(data) {
        console.log(JSON.stringify(data));
        var update = {};
        //"2014-07-12T22:40:00Z"
        var utc = d3.time.format.utc("%Y-%m-%dT%H:%M:%SZ");
        update.times = data.trains.map(function(train) {
          return utc.parse(train.time_timetable_utc);
        }).sort(d3.ascending);

        if (this.state.direction === "downtown") {
          update.towhere = "CBD";
          update.wherefrom = data.from;
        } else {
          update.towhere = data.to;
          update.wherefrom = "CBD";
        }

        this.setState(update);
      }.bind(this));
    }
    return false;
  },

  render: function() {
    if (this.state.stop !== "" && this.state.times.length === 0) {
      return (
        <div className="col-xs-3 train widget">
          <h1>CBD Train Times</h1>
          <div className="empty">Loading...</div>
        </div>
      );
    } else if (this.state.stop === "") {
      var directionClassDowntown = cx({
        directionButton: true,
        downtown: true,
        active: this.state.direction === "downtown"
      });

      var directionClassUptown = cx({
        directionButton: true,
        uptown: true,
        active: this.state.direction === "uptown"
      });

      return (
        <div className="col-xs-3 train widget">
          <h1>CBD Train Times</h1>
          <div className="directionButtons">
            <div className={directionClassDowntown} onClick={this.directionChange.bind(this, "downtown")}>To the CBD</div>
            <div className={directionClassUptown} onClick={this.directionChange.bind(this, "uptown")}>From the CBD</div>
          </div>
          <form onSubmit={this.handleSubmit}>
            <input type="text" placeholder="eg. Footscray" ref="stop" className="form-control" />
          </form>
        </div>
      );
    } else {
      var now = +new Date(),
          format = d3.time.format("%_I:%M%p");
      var remaining = this.state.times
          .filter(function(time) { return time > now; })
          .map(function(time) { return { time: time, remaining: time - now }; })
          .map(function(train) {
            return (
              <div className="departure">
                <img src="/images/clock.png" />
                <span className="from">{format(train.time)}</span>
                <span className="time-remaining">{~~(train.remaining / 1000 / 60)} mins</span>
              </div>
            );
          });

      return (
        <div className="col-xs-3 train widget">
            <h1>Want to catch a train?</h1>
            <div className="widget-body">
              <div className="desc"><span className="from">{this.state.wherefrom}</span> to <span className="to">{this.state.towhere}</span></div>
              <div>
                {remaining}
              </div>
          </div>
        </div>
      );
    }
  }
});

var Twitter = React.createClass({
  render: function() {
    return (
      <div className="col-xs-3 twitter widget">
        <h1>#Melbourne</h1>
        <a className="twitter-timeline" data-dnt="true" href="https://twitter.com/hashtag/melbourne" data-widget-id="488140500407291904">#melbourne Tweets</a>
      </div>
    );
  }
});

var AirQuality = React.createClass({
  getInitialState: function() {
    return { value: "Very Good" };
  },

  render: function() {
    return (
      <div className="big-widget air-quality col-xs-4">
        <img src="/images/wind.png" alt="WIND (of the WIND EARTH SEA FIRE trilogy)" />
        <div>Current air quality is <strong>Very Good</strong></div>
      </div>
    );
  }
});

var WaterSupply = React.createClass({
  getInitialState: function() {
    return { value: 80 };
  },

  render: function() {
    return (
      <div className="big-widget water-supply col-xs-4">
        <img src="/images/water.png" alt="water (of the WIND EARTH SEA FIRE trilogy)" />
        <div>Melbourne water supply is at <strong>{this.state.value}%</strong></div>
      </div>
    );
  }
});

var Rainfall = React.createClass({
  getInitialState: function() {
    return { value: "8mm" };
  },

  render: function() {
    return (
      <div className="big-widget rainfall col-xs-4">
        <img src="/images/rain.png" alt="water (of the WIND EARTH SEA FIRE trilogy)" />
        <div>Hourly rainfall is at <strong>{this.state.value}</strong></div>
      </div>
    );
  }
});

React.renderComponent(
  <Dashboard dataUrl="data.json"/>,
  document.body
);

