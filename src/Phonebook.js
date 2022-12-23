import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './style.css'

const App = () => {
	const [names, setNames] = useState([])
	const [newName, setNewName] = useState('')
	
	const [newNum, setNewNum] = useState('')

  const [search, setSearch] = useState(false);
  const [searchedPerson, setSearchedPerson] = useState([]);

  const [msg, setMsg] = useState("Loading all contacts from DB")

  const baseURL = 'http://localhost:3001/api/contacts'

  const displayInfo = info => {
    setMsg(info)
    setTimeout(() => {
      setMsg(null)
    }, 10000)
  }

  // getting initial saved data from database
  const getInitData = () => {
    axios
      .get(baseURL)
      .then(res => {
        // console.log(res)
        setNames(res.data)
        setMsg(null)
      })
      .catch(e => {
        displayInfo('Failed to load initial data')
      })
  }

  // using effect hook to get initial data when component is mounted
  useEffect(getInitData, [])

  const handleName = e => setNewName(e.target.value)
  const handleNumber = e => setNewNum(e.target.value)

  // adding name and number after form is submitted
	const saveContact = e => {
		e.preventDefault()

    // checking if name or number is already added
    let alreadyAdded = false;

    if (newName === "" || newNum === "") {
      displayInfo("Must add both name & number");
      alreadyAdded = true;
    }

    names.forEach(person => {
      if (person.name === newName) {
        displayInfo(`${newName} already added! Can't add contact with same name!`);
        alreadyAdded = true;
      }
      if (person.number === newNum) {
        displayInfo(`'${newNum}' already added to other person!`);
        alreadyAdded = true;
      }
    });

    // adding contact only if name or number was not previously added
    if (!alreadyAdded) {
      let num = `${newNum}`

      const contactObject = {
        name: newName,
        number: num
      }

      displayInfo('Adding contact to database...')

      axios
        .post(baseURL, contactObject)
        .then(res => {
          // console.log(res)
          setNames(names.concat(res.data))

          displayInfo('Contact saved to Database')

          // clearing input area and onChange state
          document.getElementById('nameInput').value = ''
          document.getElementById('numInput').value = ''
          setNewName('')
          setNewNum('')
        })
        .catch(e => {
          console.log(e)
          displayInfo('Error saving contact!')
        })
    }	
	}

  // searching for entered name
  const searchPerson = (e) => {
    setSearch(true);
    let value = e.target.value.toLowerCase();
    if (value === "") {
      setSearch(false);
      setSearchedPerson([]);
      return;
    }

    let filteredContacts = names.filter((person) => {
      return person.name.toLowerCase().includes(value);
    });

    setSearchedPerson(filteredContacts);
  };

  // deleting clicked contacts
	const deleteContactOf = id => {
    let delURL = `${baseURL}/${id}`

    if (window.confirm('Do you want to delete contact?')) {
  		axios
  			.delete(delURL)
  			.then(res => {
  				setNames(names.filter(name => name.id !== id))
          displayInfo('Deleted contact successfully!')
          setSearch(false)
  			})
  			.catch(e => {
  				displayInfo(`Error deleting contact`)
  			})
    }
	}

	return (
		<div className="main-body">
      <div className="title">
        <Title text="Nabin's Phonebook"/>
      </div>
			
      <InputArea 
        saveContact={saveContact} 
        handleName={handleName} 
        handleNumber={handleNumber} 
      />

      <DisplayInfo msg={msg} />

      <SearchArea searchPerson={searchPerson} />

			<AllContacts 
        contacts={search ? searchedPerson : names} 
        deleteContactOf={deleteContactOf} 
      />

		</div>
	)
}

const DisplayInfo = ({ msg }) => {
  if (msg) {
    return <h3 id="message">{msg}</h3>
  }
  return
}

const Title = ({ text }) => {
  return <h2 >{text}</h2>
}

const InputArea = ({ saveContact, handleName, handleNumber}) => {
  return (
    <form onSubmit={saveContact} className="entry-form" >
      <p>
        <label htmlFor="nameInput">Your Name:</label>
        <input 
          type='text' 
          onChange={handleName} 
          id='nameInput'
        /> 
      </p>

      <p>
        <label htmlFor="numInput">Mobile No:</label>
        <input 
          type='text' 
          onChange={handleNumber} 
          id='numInput'
        /> 
      </p>
      <button 
        type='submit' 
        id="submit-btn">
        Add Contact
      </button>
    </form>
  )
}

const SearchArea = ({ searchPerson }) => {
  return (
    <div>
      <div className="search-title">
        <Title text="All Contacts"/>
      </div>
      <div className="search-section">
        <label htmlFor="search-input">Search by Name</label>
        <input
          type="text"
          onChange={searchPerson} 
          id='search-input'
        />
      </div>
      
    </div>
  )
}

const AllContacts = ({ contacts, deleteContactOf }) => {
	return (

  		contacts.map(contact => {
  			return (
          <EachContact 
            contact={contact} 
            deleteContact={() => deleteContactOf(contact.id)} 
            key={contact.number} 
          />)
  		})
	)
}

const EachContact = ({ contact, deleteContact }) => {
	return (
		<div className="each-contact">
      <span className="contact-name">{contact.name}</span>
      <span className="contact-no">{contact.number}</span>
      <span><button onClick={deleteContact}>Delete</button></span>
		</div>
	)
}

export default App