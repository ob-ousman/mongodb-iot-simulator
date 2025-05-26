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
          if (!newTemps[site]) newTemps[site] = [0,0,0,0,0,0]; // initialize with 6 zeros
          newTemps[site].push(valeur);
		  newTemps[site] = newTemps[site].slice(-6); // keep only the last 6 values
        } else if (type === "humidite") {
          if (!newHums[site]) newHums[site] = [0,0,0,0,0,0]; // initialize with 6 zeros
          newHums[site].push(valeur);
		  newHums[site] = newHums[site].slice(-6); // keep only the last 6 values
        } else if (type === "lumiere") {
          if (!newLums[site]) newLums[site] = [0,0,0,0,0,0]; // initialize with 6 zeros
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
    if (!this.state.structuredSensors || Object.keys(this.state.structuredSensors).length === 0) {
      return <div className="App"><h1>Chargement en cours...</h1></div>;
    }
    return (
      <div className="App">
        <div>
          <h1>Tableau de board</h1>
            <div className="container">
              <div className="card_container topbar">
                <div className="card">
                  <div className="value">
                    <h2>{dayjs(Object.values(this.state.structuredSensors[this.state.selectedSite]).at(-1).timestamp).format("DD/MM/YYYY - HH:mm:ss")}</h2></div>
                  <div className="title"> <h2>{this.state.selectedSite}</h2> </div>
                  <div className="usine">
                    <select className="select" value={this.state.selectedSite} onChange={this.handleSelectChange}>
                      <option value="">Sélectionner...</option>
                      {Object.entries(this.state.structuredSensors).map(([site, data]) => (
                        <option key={site} value={site}>{site}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="card_container topbar">
                <div className="card">
                  <div className={`icon ${this.state.temperatures?.[this.state.selectedSite]?.slice(-1)[0] > 40 ? 'alert' : ''}`}>
                    <img src={temp} alt="hot_icon" width="40vw" />
                    </div>
                  <div className="title"> <h2>Température</h2> </div>
                  <div className="value"> <h2> {this.state.temperatures[this.state.selectedSite].slice(-1)[0]} </h2> </div>
                </div>
                <div className="card">
                  <div className={`icon ${this.state.humidites?.[this.state.selectedSite]?.slice(-1)[0] > 70 ? 'alert' : ''}`}>
                    <img src={hum} alt="hum_icon" width="40vw"/>
                    </div>
                  <div className="title"> <h2>Humidité</h2> </div>
                  <div className="value"> <h2>{this.state.humidites[this.state.selectedSite].slice(-1)[0]}</h2> </div>
                </div>
                <div className="card">
                  <div className={`icon ${this.state.lumieres?.[this.state.selectedSite]?.slice(-1)[0] > 1000 ? 'alert' : ''}`}>
                    <img src={light} alt="light_icon" width="40vw" />
                    </div>
                  <div className="title"> <h2>Lumière ambiante</h2> </div>
                  <div className="value"> 
                    <h2>{this.state.lumieres[this.state.selectedSite].slice(-1)[0]}</h2>
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
                            data: this.state.temperatures[this.state.selectedSite] || [],
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
                            data: this.state.humidites[this.state.selectedSite] || [],
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
                            data: this.state.lumieres[this.state.selectedSite] || [],
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
                            borderColor: "rgba(75, 192, 192, 1)",
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
