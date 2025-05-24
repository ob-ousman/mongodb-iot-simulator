import React, { Component } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import './App.css';
import temp from './assets/temp.svg';
import hum from './assets/hum.svg';
import light from './assets/light.svg';
import dayjs from "dayjs";

// interval between refresh
const interval = 5000;

class App extends Component {

  constructor() {
    super();
    this.state = {
      sensors: [],
      structuredSensors: {},
	  temperatures: {},
	  humidites: {},
	  lumieres: {},
	  selectedSite: 'Usine Nord', // default selected site
    };
  }

  // when component fetched reset the timer
  componentWillUnmount() {
    clearInterval(this.timer);
    this.timer = null;
  }

  // send get reuest every 1sec
  componentDidMount() {
    this.timer = setInterval(() => this.getValues(), interval);
  }

  // get the values from the response and set the state
  getValues() {
  fetch("/api/sensors", {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
  .then((res) => res.json())
  .then((sensors) => {
    const newStructuredData = {};
    const newTemps = { ...this.state.temperatures };
    const newHums = { ...this.state.humidites };
    const newLums = { ...this.state.lumieres };

    sensors.forEach(sensor => {
      const { site, type, valeur, timestamp } = sensor;

      if (!newStructuredData[site]) {
        newStructuredData[site] = {};
        newStructuredData[site].timestamp = timestamp;
      }

      if (["temperature", "humidite", "lumiere"].includes(type)) {
        newStructuredData[site][type] = valeur;

        if (type === "temperature") {
          if (!newTemps[site]) newTemps[site] = [];
          newTemps[site].push(valeur);
		  newTemps[site] = newTemps[site].slice(-6); // keep only the last 6 values
        } else if (type === "humidite") {
          if (!newHums[site]) newHums[site] = [];
          newHums[site].push(valeur);
		  newHums[site] = newHums[site].slice(-6); // keep only the last 6 values
        } else if (type === "lumiere") {
          if (!newLums[site]) newLums[site] = [];
          newLums[site].push(valeur);
		  newLums[site] = newLums[site].slice(-6); // keep only the last 6 values
        }
      }
    });

    this.setState({
      structuredSensors: newStructuredData,
      temperatures: newTemps,
      humidites: newHums,
      lumieres: newLums
    });
  });
}


  render() {
    return (
      <div className="App">
        <div>
          <h1>Tableau de board</h1>
          {Object.entries(this.state.structuredSensors).map(([site, data]) => (
            <div className={`container ${this.state.selectedSite && site !== this.state.selectedSite ? 'hidden' : ''}`}>
              <div className="card_container topbar">
				<div className="card">
					<div className="value">
						<h2>{dayjs(data.timestamp).format("DD/MM/YYYY HH:mm:ss")}</h2></div>
					<div className="title"> <h2>{site}</h2> </div>
					<div className="usine">
						<select className="select" value={this.state.selectedSite} onChange={this.handleSelectChange}>
							<option value="">Sélectionner...</option>
							<option value="Usine Nord">Usine Nord</option>
							<option value="Usine Sud">Usine Sud</option>
							<option value="Usine Est">Usine Est</option>
							<option value="Usine Ouest">Usine Ouest</option>
						</select>
					</div>
				</div>
			  </div>

              <div className="card_container topbar">
                <div className="card">
                  <div className="icon">
                    <img src={temp} alt="hot_icon" width="40vw" />
                  </div>
                  <div className="title">
                    <h2>Température</h2>
                  </div>
                  <div className="value">
                    <h2>
                      {data.temperature}
                    </h2>
                  </div>
                </div>
                <div className="card">
                  <div className="icon">
                    <img src={hum} alt="hum_icon" width="40vw" />
                  </div>
                  <div className="title">
                    <h2>Humidité</h2>
                  </div>
                  <div className="value">
                    <h2>{data.humidite}</h2>
                  </div>
                </div>
                <div className="card">
                  <div className="icon">
                    <img src={light} alt="light_icon" width="40vw" />
                  </div>
                  <div className="title">
                    <h2>Lumière ambiante</h2>
                  </div>
                  <div className="value">
                    <h2>{data.lumiere}</h2>
                  </div>
                </div>
              </div>

              <div className="card_container">
                <div className="card">
                  <div className="chart" height="600px">
                    <Line
                      data={{
                        //labels: this.state.sensors.map(sensor => sensor.Date.split()),
                        labels: [1, 2, 3, 4, 5, 6],
                        datasets: [
                          {
                            label: "Temperature",
                            data: this.state.temperatures[site] || [],
                            backgroundColor: "rgba(54, 162, 235, 0.2)",

                            borderColor: "rgba(54, 162, 235, 1)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      height={250}
                      options={{
                        responsive: true,
                        responsiveAnimationDuration: 400,
                        maintainAspectRatio: false,
                        scales: {
                          xAxes: [
                            {
                              gridLines: {
                                display: false,
                                color: "#666",
                              },
                              ticks: {
                                fontColor: "#999",
                              },
                            },
                          ],
                          yAxes: [
                            {
                              gridLines: {
                                display: false,
                                color: "#666",
                              },
                              ticks: {
                                fontColor: "#999",
                              },
                            },
                          ],
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="card">
                  <div className="chart">
                    <Bar
                      data={{
                        //labels: this.state.sensors.map(sensor => sensor.id),
                        labels: [1, 2, 3, 4, 5, 6],
                        datasets: [
                          {
                            label: "Humidité",
                            data: this.state.humidites[site] || [],
                            backgroundColor: [
                              "rgba(255, 99, 132, 0.2)",
                              "rgba(54, 162, 235, 0.2)",
                              "rgba(255, 206, 86, 0.2)",
                              "rgba(75, 192, 192, 0.2)",
                              "rgba(153, 102, 255, 0.2)",
                              "rgba(255, 159, 64, 0.2)",
                            ],
                            borderColor: [
                              "rgba(255, 99, 132, 1)",
                              "rgba(54, 162, 235, 1)",
                              "rgba(255, 206, 86, 1)",
                              "rgba(75, 192, 192, 1)",
                              "rgba(153, 102, 255, 1)",
                              "rgba(255, 159, 64, 1)",
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                      height={250}
                      options={{
                        responsive: true,
                        responsiveAnimationDuration: 400,
                        maintainAspectRatio: false,
                        scales: {
                          xAxes: [
                            {
                              gridLines: {
                                display: false,
                                color: "#666",
                              },
                              ticks: {
                                fontColor: "#999",
                              },
                            },
                          ],
                          yAxes: [
                            {
                              gridLines: {
                                display: false,
                                color: "#666",
                              },
                              ticks: {
                                fontColor: "#999",
                              },
                            },
                          ],
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="card">
                  <div className="chart">
                    <Line
                      data={{
                        //labels: this.state.sensors.map(sensor => sensor.id),
                        labels: [1, 2, 3, 4, 5, 6],
                        datasets: [
                          {
                            label: "Lumière ambiante",
                            data: this.state.lumieres[site] || [],
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 1,
                          },
                          {
                            label: "Temperature",
                            data: this.state.temperatures[site] || [],
                            backgroundColor: "rgba(54, 162, 235, 0.1)",

                            borderColor: "rgba(54, 162, 235, 1)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      height={250}
                      options={{
                        responsive: true,
                        responsiveAnimationDuration: 400,
                        maintainAspectRatio: false,
                        scales: {
                          xAxes: [
                            {
                              gridLines: {
                                display: false,
                                color: "#666",
                              },
                              ticks: {
                                fontColor: "#999",
                              },
                            },
                          ],
                          yAxes: [
                            {
                              gridLines: {
                                display: false,
                                color: "#666",
                              },
                              ticks: {
                                fontColor: "#999",
                              },
                            },
                          ],
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <footer>
          IONIS-STM
          &nbsp;&nbsp;&nbsp;.&nbsp;&nbsp;&nbsp;
          Master 2 Informatique - Data
          <p>&copy; Développé par : Koffi, Ghofrane et Boukar, 2025</p>
        </footer>
      </div>
    );
  }

  handleSelectChange = (event) => {
	this.setState({ selectedSite: event.target.value });
	console.log("Selected site:", event.target.value);
  }
}

export default App;
