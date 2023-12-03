import React, { useState } from "react";
import { Login } from "./Login";
import { Register } from "./Register";
import { Update } from "./Update";
import "./App.css";
import "./login.css";
import "./about.css";
import "./search.css"
import{Component} from "react";

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
  state = { clicked: false };
  componentDidUpdate(prevProps) {
    // Check if the section changed, if yes, reset the state
    if (this.props.superheroListsClicked !== prevProps.superheroListsClicked || this.props.searchClicked !== prevProps.searchClicked) {
      this.setState({ clicked: false });
    }
  }

  handleClick =()=>{
    this.setState({clicked:!this.state.clicked})
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

              <li><a href="#!" onClick={this.props.onFormSwitch}>Login</a></li>
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
                          <input type="text" class="search-input" placeholder="Search by name" id="search-name"></input>
                          <button id="searchName">Search</button>
                      </li>
                      <li>
                          <a>Race</a>
                          <input type="text" class="search-input" placeholder="Search by race" id="search-race"></input>
                          <button id="searchRace">Search</button>
                      </li>
                      <li>
                          <a>Publisher</a>
                          <input type="text" class="search-input" placeholder="Search by publisher" id="search-publisher"></input>
                          <button id="searchPublisher">Search</button>
                      </li>
                      <li>
                          <a>Power</a>
                          <input type="text" class="search-input" placeholder="Search by power" id="search-power"></input>
                          <button id="searchPower">Search</button>
                      </li>
                  </ul>
              </div>
              
          </section>
      </div>
        )}





      </>
    );
  }
}


export default App;