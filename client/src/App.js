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
  const [adminClicked, setAdminClicked] = useState(false);
  const [userToken, setUserToken] = useState(null); // New state variable for user token

  const switchToLogin = () => {
    setCurrentForm("login");
  };

  const switchToRegister = () => {
    setCurrentForm("register");
  };

  const switchToUpdate =() =>{
    setCurrentForm("update");
  }

  const handleSearchClick = (event) => {
    event.preventDefault(); // Prevent the default behavior of the anchor tag

    setSearchClicked(!searchClicked);
  };

  const handleAdminClick = (event) => {
    event.preventDefault(); // Prevent the default behavior of the anchor tag

    setAdminClicked(!adminClicked);
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
  const handleLogin = (token) => {
    // Update the state with the user token
    console.log(token);
    setUserToken(token);
   

    // Set the current form to 'unauthorized' (or any other initial state you want)
    setCurrentForm('unauthorized');
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
        onAdminClick={handleAdminClick}
        

        superheroListsClicked={superheroListsClicked}
        searchClicked={searchClicked}
        aboutClicked={aboutClicked}
        createClicked={createClicked}
        viewPublicLists={viewPublicLists}
        userToken={userToken} 
        adminClicked={adminClicked} // Pass the userToken to the Unauthorized component
        />
      )}
      {currentForm === "login" && (
        <Login onFormSwitch={(type) => type === 'register' ? switchToRegister() : switchToUpdate()} onLogin={handleLogin} />
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
    userLists: [],
    expandedHero: null,
    clicked: false, // Add this line

  };
  componentDidMount() {
    // Fetch user lists when the component mounts
    this.handleUserLists();
    this.handlePublicLists();
  }
  componentDidUpdate(prevProps) {
    // Check if the section changed, if yes, reset the state
    if (this.props.viewPublicLists && !prevProps.viewPublicLists) {
      // Fetch and update the state only if transitioning to the public lists view
      this.handlePublicLists();
    }

    if (this.props.viewUserLists && !prevProps.viewUserLists) {
      this.handleUserLists();
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

  

  handleUserLists = (e) => {
    if (e) {
      e.preventDefault(); // Prevent the default behavior of the anchor tag
    }
    
    // Call your server's route to fetch public lists
    axios.get("http://localhost:8000/view-lists",{
      headers: {
        Authorization: `${this.props.userToken}` // Include the user token in the request headers
      }
    })
      .then(response => {
        console.log("Response data:", response.data); // Add this line for debugging
        if (response && response.data) {
          this.setState({ userLists: response.data}, () => {
            // This callback will be executed after the state has been updated
            console.log("Users", this.state.userLists); // Add this line for debugging
          });
        } else {
          console.error("Invalid response format");
        }
      })
      .catch(error => {
        console.error("Error during fetching public lists:", error.message);
      });
  };

  handleCreateList = (e) => {
    if (e) {
      e.preventDefault(); // Prevent the default behavior of the anchor tag
    }
    console.log('Authorization Header:', `${this.props.userToken}`);

    // Get the input values from your form
    const listName = document.getElementById("create-list-name").value;
    const description = document.getElementById("create-list-description").value;
    const visibility = document.getElementById("create-list-visibility").value;
    const superheroIds = document.getElementById("create-list-superhero-ids").value;
  
  
    // Prepare the request body
   
    console.log("User Token", this.props.userToken);
  
    // Make a POST request to your server's add-list route
    axios.post("http://localhost:8000/api/users/add-list/",{
        listName: listName,
        description: description,
        visibility: visibility,
        ids: superheroIds
      },
      {
        headers: {
          Authorization: `${this.props.userToken}` // Include the user token in the request headers
        }
      }
    )
      .then(response => {
        console.log("Response data:", response.data);
        this.handleUserLists();
        this.handlePublicLists();
        // Handle the response as needed
      })
      .catch(error => {
      
        console.log("Error during creating a list:", error.message);
        // Handle errors as needed
      });
  };

  handleReview = (e) => {
    if (e) {
      e.preventDefault(); // Prevent the default behavior of the anchor tag
    }
    console.log('Authorization Header:', `${this.props.userToken}`);

    // Get the input values from your form
    const listName = document.getElementById("review-list").value;
    const rating = document.getElementById("review-rating").value;
    const comment = document.getElementById("review-comment").value;
    const visibility = document.getElementById("review-visibility").value;
  
  
    // Prepare the request body
   
    console.log("User Token", this.props.userToken);
  
    // Make a POST request to your server's add-list route
    axios.post("http://localhost:8000/add-review",{
        listName: listName,
        rating: rating,
        comment: comment,
        visibility: visibility
      },
      {
        headers: {
          Authorization: `${this.props.userToken}` // Include the user token in the request headers
        }
      }
    )
      .then(response => {
        console.log("Response data:", response.data);
        this.handleUserLists();
        this.handlePublicLists();
        // Handle the response as needed
      })
      .catch(error => {
      
        console.log("Error during creating a list:", error.message);
        // Handle errors as needed
      });
  };

  handleModifyList = (e) => {
    if (e) {
      e.preventDefault(); // Prevent the default behavior of the anchor tag
    }
    console.log('Authorization Header:', `${this.props.userToken}`);

    // Get the input values from your form
    const listName = document.getElementById("list-name").value;
    const newListName = document.getElementById("new-name").value;
    const newDescription = document.getElementById("new-description").value;
    const newVisibility = document.getElementById("new-visibility").value;
    const newHeroes = document.getElementById("new-heroes").value;

    console.log( {listName, newListName, newDescription, newVisibility, newHeroes})
  
  
    // Prepare the request body
   
    console.log("User Token", this.props.userToken);
  
    // Make a POST request to your server's add-list route
    axios.post(`http://localhost:8000/edit-list/${listName}`,{
        newListName: newListName,
        newDescription: newDescription,
        newVisibility: newVisibility,
        newIds: newHeroes
      },
      {
        headers: {
          Authorization: `${this.props.userToken}` // Include the user token in the request headers
        }
      }
    )
      .then(response => {
        console.log("Response data:", response.data);
        this.handleUserLists();
        this.handlePublicLists();
        // Handle the response as needed
      })
      .catch(error => {
        console.log("Error during creating a list:", error.message);
        // Handle errors as needed
      });
  };

  handleGrantPrivilege = (e) => {
    if (e) {
      e.preventDefault(); // Prevent the default behavior of the anchor tag
    }

    const email = document.getElementById("modify-user").value;

    console.log('Authorization Header:', `${this.props.userToken}`);
   
    console.log("User Token", this.props.userToken);
  
    // Make a POST request to your server's add-list route
    axios.post(`http://localhost:8000/grant-privileges/${email}`, null, {
      headers: {
          Authorization: `${this.props.userToken}`
      }
      })
      .then(response => {
        console.log("Response data:", response.data);
        // Handle the response as needed
      })
      .catch(error => {
        console.log("Error during creating a list:", error.message);
        // Handle errors as needed
      });
  };
  handleDisable = (e) => {
    if (e) {
      e.preventDefault(); // Prevent the default behavior of the anchor tag
    }

    const email = document.getElementById("modify-user").value;

    console.log('Authorization Header:', `${this.props.userToken}`);
   
    console.log("User Token", this.props.userToken);
  
    // Make a POST request to your server's add-list route
    axios.post(`http://localhost:8000/disable-user/${email}`, null, {
      headers: {
          Authorization: `${this.props.userToken}`
      }
      })
      .then(response => {
        console.log("Response data:", response.data);
        // Handle the response as needed
      })
      .catch(error => {
        console.log("Error during creating a list:", error.message);
        // Handle errors as needed
      });
  };

  handleEnable = (e) => {
    if (e) {
      e.preventDefault(); // Prevent the default behavior of the anchor tag
    }

    const email = document.getElementById("modify-user").value;

    console.log('Authorization Header:', `${this.props.userToken}`);
   
    console.log("User Token", this.props.userToken);
  
    // Make a POST request to your server's add-list route
    axios.post(`http://localhost:8000/enable-user/${email}`, null, {
      headers: {
          Authorization: `${this.props.userToken}`
      }
      })
      .then(response => {
        console.log("Response data:", response.data);
        // Handle the response as needed
      })
      .catch(error => {
        console.log("Error during creating a list:", error.message);
        // Handle errors as needed
      });
  };


  handleDeleteList = (e) => {
    if (e) {
      e.preventDefault(); // Prevent the default behavior of the anchor tag
    }
    console.log('Authorization Header:', `${this.props.userToken}`);

    // Get the input values from your form
    const listName = document.getElementById("list-name").value;

  
    console.log(listName)
    // Prepare the request body
   
    console.log("User Token", this.props.userToken);
  
    // Make a POST request to your server's add-list route
    axios.post(`http://localhost:8000/delete-list/${listName}`, null, {
      headers: {
          Authorization: `${this.props.userToken}`
      }
      })
      .then(response => {
        console.log("Response data:", response.data);
        this.handleUserLists();
        this.handlePublicLists();
        // Handle the response as needed
      })
      .catch(error => {
        console.log("Error during creating a list:", error.message);
        // Handle errors as needed
      });
  };

  
  
  renderUserLists() {
    if (!Array.isArray(this.state.userLists) || this.state.userLists.length === 0) {
      console.error("User lists is not an array or is empty");
      return null;
    }
    
    console.log(this.state.userLists)
    // Assuming userLists is an array of superhero list objects
    return this.state.userLists.map((list) => (
      
      <div>
        <ul id="superheroInfo" className="superhero-list">
          <li id="list" key={list.listName}>
            <div className="user-list-items">
              <strong>List Name: </strong> {list.listName} | <strong>Description: </strong> {list.description}
              <button onClick={() => this.handleExpand(list.listName)}>View</button>
            </div>
            {this.state.expandedHero === list.listName && (
              <div className="superhero-view">
                {list.heroes.map((hero) => (
                  <li key={hero.id}>
                    <p><strong>Hero Name:</strong> {hero.name}</p>
                    <p><strong>Publisher:</strong> {hero.Publisher}</p>
                  </li>
                ))}
              </div>
            )}
          </li>
        </ul>
      </div>
    ));
  }
  

  
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
     
      <ul id="superheroInfo" className="superhero-list">
      <li id="list" key={list.listName}>
        <div className="public-list-items">
          <strong>List Name: </strong> {list.listName} | <strong>Nickname: </strong> {list.creatorNickname} |
          <strong>Number of heroes: </strong>{list.numberOfHeroes}|
          <strong>Average Rating: </strong>{list.averageRating} | 
          <strong>Last Modified: </strong>{list.lastModified}
  
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
      </li>
      </ul>
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
              <li><a href="index.html" onClick={this.props.onAdminClick}>Admin</a></li>

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
            <h2>Public Lists</h2>
            <ul id="superheroInfo" className="superhero-list">
              {this.renderPublicLists()}
            </ul>

            <h2>Want to add review?</h2>
            <ul className="review-bar">
                     
                      <li>
                          <a class="left">List Name</a>
                          <input type="text" class="search-input" placeholder="List name" id="review-list"></input>
                      </li>
                      <li>
                          <a>Rating</a>
                          <input type="text" class="search-input" placeholder="Rating 1-10" id="review-rating"></input> 
                      </li>
                      <li>
                          <a>Comment</a>
                          <input type="text" class="search-input" placeholder="Comment" id="review-comment"></input>     
                      </li>
                      <li>
                          <a>Visibility</a>
                          <input type="text" class="search-input" placeholder="Private or Public" id="review-visibility"></input>
                      </li>
                      <button id="searchPower" onClick={this.handleReview}>Add</button>

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
            <div class="search-bar">
            <ul>
                <h3>Create Favourite List</h3>
                <li>
                    <a>List Name</a>
                    <input type="text" class="list-input" placeholder="Enter list name" id="create-list-name"></input>
                    <a>Description</a>
                    <input type="text" class="list-input" placeholder="Enter Description" id="create-list-description"></input>
                    <a>Visibility</a>
                    <input type="text" class="list-input" placeholder="Enter visibility" id="create-list-visibility"></input>
                    <a>Superhero Ids</a>
                    <input type="text" class="list-input" placeholder="1,2,3....." id="create-list-superhero-ids"></input>
                    <button id="addList" onClick = {this.handleCreateList}>Create</button>
                </li>
            </ul>
            <ul>
                <h3>List Modifications</h3>
                <li>
                    <a>List Name</a>
                    <input type="text" class="list-input" placeholder="Enter list name" id="list-name"></input>
                    <a>New List Name</a>
                    <input type="text" class="list-input" placeholder="Enter new list name" id="new-name"></input>
                    <a>New Description</a>
                    <input type="text" class="list-input" placeholder="Enter new description" id="new-description"></input>
                    <a>New Visilibilty</a>
                    <input type="text" class="list-input" placeholder="Enter visiblity" id="new-visibility"></input>
                    <a>Add Superheroes</a>
                    <input type="text" class="list-input" placeholder="1,2,3...." id="new-heroes"></input>
                    
                </li>
                <button id="modify-list" onClick = {this.handleModifyList}>Modify</button>
                <button id="delete-list" onClick = {this.handleDeleteList}>Delete List</button>
            </ul>   
            <h3>Your Lists</h3>
            <ul id="superheroInfo" className="superhero-list">
              {this.renderUserLists()}
            </ul>
        </div>
        )}


        {this.props.adminClicked && (
          <div>
              <h2> Admin Page</h2>
              <h3>Grant Privileges or Disable</h3>
              <ul className="review-bar">
                <li>
                  <a>User you are modifying</a>
                  <input placeholder="Enter Email" id="modify-user"></input>
                  <button id="grant-privileges" onClick={this.handleGrantPrivilege}>Grant</button>
                  <button id="disable-user" onClick={this.handleDisable}>Disable</button>
                  <button id="enable-user" onClick={this.handleEnable}>Enable</button>
                </li>
              </ul>
              
              
          </div>
            

            
        )}




      </>
    );
  }
}


export default App;