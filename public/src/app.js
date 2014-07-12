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
      console.log(this.state.times);
      var now = +new Date(),
          format = d3.time.format("%_I:%M%p");
      var remaining = this.state.times
          .filter(function(time) { return time > now; })
          .map(function(time) { return { time: time, remaining: time - now }; })
          .map(function(train) {
            return (
              <div><span>{format(train.time)}</span><span>{~~(train.remaining / 1000 / 60)}mins</span></div>
            );
          });

      console.log(remaining);

      return (
        <div className="col-xs-3 train widget">
          <h1>Want to catch a train?</h1>
          <div><span className="from">{this.state.wherefrom}</span> to <span className="to">{this.state.towhere}</span></div>
          <div>
            {remaining}
          </div>
        </div>
      );
    }
  }
});


React.renderComponent(
  <Dashboard dataUrl="data.json"/>,
  document.body
);


// var test =
// {"from":"Mordialloc Station","trains":[{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12257,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-12T23:04:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12259,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-12T23:24:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12261,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-12T23:44:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12263,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-12T23:54:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12265,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T00:04:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12267,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T00:14:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12269,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T00:24:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12271,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T00:34:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12273,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T00:44:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12275,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T00:54:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12277,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T01:04:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12279,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T01:14:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12281,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T01:24:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12283,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T01:34:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12285,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T01:44:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12287,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T01:54:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12289,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T02:04:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12291,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T02:14:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12293,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T02:24:00Z","time_realtime_utc":null,"flags":""},{"platform":{"realtime_id":0,"stop":{"suburb":"Mordialloc","transport_type":"train","stop_id":1134,"location_name":"Mordialloc","lat":-38.006588,"lon":145.087662,"distance":0},"direction":{"linedir_id":24,"direction_id":0,"direction_name":"City (Flinders Street)","line":{"transport_type":"train","line_id":6,"line_name":"Frankston","line_number":"Frankston"}}},"run":{"transport_type":"train","run_id":12295,"num_skipped":0,"destination_id":1071,"destination_name":"Flinders Street"},"time_timetable_utc":"2014-07-13T02:34:00Z","time_realtime_utc":null,"flags":""}]}
