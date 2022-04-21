import React, { useState, useEffect } from "react";
import "./App.css";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import LineGraph from "./LineGraph";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import numeral from "numeral";
import Map from "./Map";
import "leaflet/dist/leaflet.css";
import LATLONG from "./latlong";


const App = () => {
  const [country, setInputCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [countries, setCountries] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [indStates, setIndStates] = useState([]);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedState, setSelectedState] = useState("All States");
  const [recovered, setRecovered] = useState(0);
  const [confirmed, setConfirmed] = useState(0);
  const [deaths, setDeaths] = useState(0);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      fetch("https://api.rootnet.in/covid19-in/stats/latest")
        .then((response) => response.json())
        .then((res) => {
          
          const data = res.data;
          console.log(data);
          
          const regions = data.regional;
          setIndStates(regions);

        });
    };

    getCountriesData();
  }, []);
 
  const handleStates = (e)=>{
    const clickedState = e.target.value;
    setSelectedState(clickedState)
    indStates.map((state)=>{
      if(clickedState==state.loc){
        setDeaths(state.deaths)
        setRecovered(state.discharged)
        setConfirmed(state.totalConfirmed)
      }

    })
    LATLONG.map((mapState)=>{
      if(mapState.state===clickedState){
        console.log(mapState)
        setMapCenter({lat:mapState.lat, lng:mapState.long})
        setMapZoom(7)
        
      }
    })
  }



  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={handleStates}
            >
              <MenuItem value="worldwide">{selectedState}</MenuItem>
              {/* {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))} */
              }
              {
                indStates.map((states)=>(
                  <MenuItem key={states.loc} value={states.loc}>{states.loc}</MenuItem>
                  
                )
                )

              }
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={confirmed}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={recovered}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={deaths}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>
        <Map
          countries={LATLONG}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
          indStates = {indStates}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <div className="app__information">
            <h3>Live Cases by State</h3>
            <Table countries={indStates} />
            <h3>Worldwide new {casesType}</h3>
            <LineGraph casesType={casesType} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
