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
  const [aboutClicked, setAboutClicked] = useState(false);
  const [viewPublicLists, setPublicLists] = useState(false);
  const [createClicked, setCreateClicked] = useState(false);

  const switchToLogin = () => {
    setCurrentForm("login");
  };

  const switchToRegister = () => {
    setCurrentForm("register");
  };
  const handleSearchClick = (event) => {
    event.preventDefault(); // Prevent the default behavior of the anchor tag

    setSearchClicked(!searchClicked);
  };

  const handleAboutClick = (event) => {
    event.preventDefault(); // Prevent the default behavior of the anchor tag

    setAboutClicked(!aboutClicked);
  };

  const handlePublicLists = (event) =>{
    event.preventDefault(); // Prevent the default behavior of the anchor tag

    setPublicLists(!viewPublicLists);
  }
  
  const handleCreateClick = (event) =>{
    event.preventDefault(); // Prevent the default behavior of the anchor tag

    setCreateClicked(!createClicked);
  }


  const handleSuperheroListsClick = () => {
    setSuperheroListsClicked(!superheroListsClicked);
 
  };


  return (
    <div className="App">
      {currentForm === "unauthorized" && (
        <Unauthorized onFormSwitch={switchToLogin} 
        onSuperheroListsClick={handleSuperheroListsClick}
        onSearchClick={handleSearchClick}
        onCreateClick={handleCreateClick}
        onAboutClick={handleAboutClick}
        onPublicLists={handlePublicLists}

        superheroListsClicked={superheroListsClicked}
        searchClicked={searchClicked}
        aboutClicked={aboutClicked}
        createClicked={createClicked}
        viewPublicLists={viewPublicLists}/>
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
    publicLists: [],
    expandedHero: null,
    clicked: false, // Add this line

  };
  componentDidUpdate(prevProps) {
    // Check if the section changed, if yes, reset the state
    if (this.props.viewPublicLists && !prevProps.viewPublicLists) {
      // Fetch and update the state only if transitioning to the public lists view
      this.handlePublicLists();
    }
  }
  handleExpand = (heroId) => {
    this.setState((prevState) => ({
      expandedHero: prevState.expandedHero === heroId ? null : heroId,
    }));
  };

  handleClick = (section) => {
    this.setState({
      clicked: section === 'about' ? !this.state.clicked : false,
    });
  };

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
  
  handlePublicLists = (e) => {
    if (e) {
      e.preventDefault(); // Prevent the default behavior of the anchor tag
    }
    // Call your server's route to fetch public lists
    axios.get("http://localhost:8000/public-lists")
      .then(response => {
        console.log("Response data:", response.data); // Add this line for debugging
        if (response && response.data && response.data.publicLists) {
          this.setState({ publicLists: response.data.publicLists }, () => {
            // This callback will be executed after the state has been updated
            console.log("Updated publicLists:", this.state.publicLists); // Add this line for debugging
          });
        } else {
          console.error("Invalid response format");
        }
      })
      .catch(error => {
        console.error("Error during fetching public lists:", error.message);
      });
  };
  
  

  
  renderPublicLists() {
    console.log(this.state.publicLists)
    console.log('hi');
    if (!Array.isArray(this.state.publicLists) || this.state.publicLists.length === 0) {
      console.error("Public lists is not an array or is empty");
      return null;
    }
   
    // Assuming publicLists is an array of superhero list objects
    return this.state.publicLists.map((list) => (
      <div>
      <h2>Public Lists</h2>
      <ul id="superheroInfo" className="superhero-list">
      <li id="list" key={list.listName}>
        <div className="public-list-items">
          <strong>List Name: </strong> {list.listName} | <strong>Nickname: </strong> {list.creatorNickname} |
          <strong>Number of heroes: </strong>{list.numberOfHeroes}|
          <strong>Average Rating: </strong>{list.averageRating}
  
          <button onClick={() => this.handleExpand(list.listName)}>Expand</button>
        </div>
        {this.state.expandedHero === list.listName && (
          <div className="superhero-view">
            {list.heroes.map((hero) => (
              <li key={hero.id}>
                <p><strong>Hero Name:</strong> {hero.name}</p>
                <p><strong>Powers:</strong> {hero.Powers ? hero.Powers.join(", ") : 'N/A'}</p>
                <p><strong>Publisher:</strong> {hero.Publisher}</p>
              </li>
            ))}
          </div>
          
        )}
      </li></ul>
    </div>

    ));
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
              <li><a href="#!" onClick={this.props.onAboutClick}>About</a></li>
              <li><a href="index.html" onClick={(e) => this.props.onPublicLists(e)}>Lists</a></li>
              <li><a href="index.html" onClick={this.props.onSearchClick}> Search</a></li>
              <li><a href="index.html"onClick={this.props.onCreateClick}>Create Lists</a></li>
              <li><a href="index.html">Admin</a></li>

              <li id="login"><a href="#!" onClick={this.props.onFormSwitch}>Login</a></li>
            </ul>
          </div>
          
        </nav>

        {this.props.aboutClicked && (
          <div className="about">
            <h1>Mark's SuperHero Site</h1>
            <p>Organize all of the information about all of your favourite superheros!</p>
          </div>
        )}


        {this.props.viewPublicLists && (
      
          <div id="Superheroes">
            <ul id="superheroInfo" className="superhero-list">
              {this.renderPublicLists()}
            </ul>
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


        {this.props.createClicked && (
            <div class="list-bar">
            <ul>
                <h3>Create Favourite List</h3>
                <li>
                    <input type="text" class="list-input" placeholder="Enter list name" id="create-list"></input>
                    <button id="addList">Confirm</button>
                </li>
            </ul>
            <ul>
                <h3>List Modifications</h3>
                <li>
                    <a>List Name</a>
                    <input type="text" class="list-input" placeholder="Enter list name" id="list-name"></input>
                </li>
                <li>
                    <a>Superhero IDS</a>
                    <input type="text" class="list-input" placeholder="1,2,3...." id="superhero-ids"></input>
                    <button id="add-superhero">Add Superheroes</button>
                    <button id="delete-list">Delete List</button>
                    <button id="view-list">View List</button>
                </li>
            </ul>   
        </div>
        )}




      </>
    );
  }
}


export default App;