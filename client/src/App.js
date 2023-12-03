import React, { useState } from "react";
import { Login } from "./Login";
import { Register } from "./Register";
import { Update } from "./Update";
import "./App.css";
import "./login.css";
import "./about.css";
import "./search.css"
import{Component} from "react";

import axios from  'axios';

function App() {
  const [currentForm, setCurrentForm] = useState('unauthorized');
  const [superheroListsClicked, setSuperheroListsClicked] = useState(false);
  const [searchClicked, setSearchClicked] = useState(false);

  const switchToLogin = () => {
    setCurrentForm("login");
  };

  const switchToRegister = () => {
    setCurrentForm("register");
  };
  const handleSearchClick = (event) => {
    event.preventDefault(); // Prevent the default behavior of the anchor tag

    setSearchClicked(!searchClicked);
    setSuperheroListsClicked(false); // Reset the state when switching forms
  };

  const handleSuperheroListsClick = () => {
    setSuperheroListsClicked(!superheroListsClicked);
    setSearchClicked(false); // Reset the state when switching forms
  };


  return (
    <div className="App">
      {currentForm === "unauthorized" && (
        <Unauthorized onFormSwitch={switchToLogin} 
        onSuperheroListsClick={handleSuperheroListsClick}
        onSearchClick={handleSearchClick}
        superheroListsClicked={superheroListsClicked}
        searchClicked={searchClicked}/>
      )}
      {currentForm === "login" && (
        <Login onFormSwitch={switchToRegister} />
      )}
      {currentForm === "register" && (
        <Register onFormSwitch={switchToLogin} />
      )}
      {currentForm === "update" && (
        <Update onFormSwitch={switchToLogin} />
      )}
    </div>
  );
}

class Unauthorized extends Component {
  state = {
    searchResults: [],
    expandedHero: null,
    clicked: false, // Add this line

  };
  componentDidUpdate(prevProps) {
    // Check if the section changed, if yes, reset the state
    if (this.props.superheroListsClicked !== prevProps.superheroListsClicked || this.props.searchClicked !== prevProps.searchClicked) {
      this.setState({ clicked: false });
    }
  }
  
  handleExpand = (heroId) => {
    this.setState((prevState) => ({
      expandedHero: prevState.expandedHero === heroId ? null : heroId,
    }));
  };

  handleClick =()=>{
    this.setState({clicked:!this.state.clicked})
  }

  handleDDGSearch(heroName) {
    const name = document.getElementById("search-name").value;
    // Open a new tab/window for DuckDuckGo search with the hero's name
    window.open(`https://duckduckgo.com/?q=${encodeURIComponent(name)}`, '_blank');
  }

  handleSearch = (e) => {
    e.preventDefault();
    const name = document.getElementById("search-name").value;
    const race = document.getElementById("search-race").value;
    const publisher = document.getElementById("search-publisher").value;
    const power = document.getElementById("search-power").value;
  
    // Call your server's search route here
    axios.get(`http://localhost:8000/search?name=${name}&race=${race}&publisher=${publisher}&power=${power}`)
      .then(response => {
        // Check if response and response.data are defined
        if (response && response.data) {
          // Update the state with the search results
          this.setState({ searchResults: response.data });
        } else {
          console.error("Invalid response format");
        }
      })
      .catch(error => {
        // Handle errors, log or display an error message
        console.error("Error during search:", error.message);
      });
  }
  
  renderSearchResults() {
    // Assuming searchResults is an array of superhero objects
    return this.state.searchResults.map((hero) => (
      <li id="list"key={hero.id}>
        <div className="superhero-list-item">
          <strong>Name:</strong> {hero.name} | <strong>Publisher:</strong> {hero.Publisher}
          <button onClick={() => this.handleExpand(hero.id)}>Expand</button>
        </div>
        {this.state.expandedHero === hero.id && (
          <div className="superhero-view">
            <li>
            <p><strong>Gender:</strong> {hero.Gender}</p>
            <p><strong>Eye color:</strong> {hero['Eye color']}</p>
            <p><strong>Race:</strong> {hero.Race}</p>
            <p><strong>Hair color:</strong> {hero['Hair color']}</p>
            <p><strong>Height:</strong> {hero.Height}</p>
            <p><strong>Alignment:</strong> {hero.Alignment}</p>
            <p><strong>Weight:</strong> {hero.Weight}</p>
            <p><strong>Powers:</strong> {hero.Powers ? hero.Powers.join(", ") : 'N/A'}</p>
            </li>
          </div>
        )}
      </li>
    ));
  }
  

  render() {
    return (
    
      <>
      
        <nav className="top-nav">
          <div>
          <h> SUPERHERO WEBSITE</h>
         
            <ul id="nav-bar" >
              <li><a href="#!" onClick={this.handleClick}>About</a></li>
              <li><a href="index.html">Lists</a></li>
              <li><a href="index.html" onClick={this.props.onSearchClick}> Search</a></li>
              <li><a href="index.html">Create Lists</a></li>

              <li id="login"><a href="#!" onClick={this.props.onFormSwitch}>Login</a></li>
            </ul>
          </div>
          
        </nav>

        {this.state.clicked && (
          <div className="about">
            <h1>Mark's SuperHero Site</h1>
            <p>Organize all of the information about all of your favourite superheros!</p>
          </div>
        )}

        {this.props.searchClicked && (
          <div>
          <section id="search">
              <h2>Search Superheroes</h2>
              <div class="search-bar">
                  <ul>
                      <li>
                          <a class="left">Name</a>
                          <input type="text" class="search-input" placeholder="Search name" id="search-name"></input>
                      </li>
                      <li>
                          <a>Race</a>
                          <input type="text" class="search-input" placeholder="Search race" id="search-race"></input> 
                      </li>
                      <li>
                          <a>Publisher</a>
                          <input type="text" class="search-input" placeholder="Search publisher" id="search-publisher"></input>     
                      </li>
                      <li>
                          <a>Power</a>
                          <input type="text" class="search-input" placeholder="Search power" id="search-power"></input>
                      </li>
                      <button id="searchPower" onClick={this.handleSearch} >Search</button>

                      <button id="searchPower" onClick={this.handleDDGSearch} >Search on DDG</button>
                  </ul>
              </div>
              
          </section>
          {this.state.searchResults.length > 0 && (
          <div id="Superheroes">
            <ul id="superheroInfo" className="superhero-list">
              {this.renderSearchResults()}
            </ul>
          </div>
        )}
      </div>
        )}

        





      </>
    );
  }
}


export default App;