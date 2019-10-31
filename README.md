# Frontend-Applications | CMD | ID | Year 3 |  Tech-Track

## Requirements
* Know how to use your terminal
* Code Editor

## How to install?
1. Run the terminal
2. `git clone https://github.com/sarkis1997/frontend-applications`
3. Open the complete file in your code editor of choice.
5. `npm i` or `npm install`.
6. `npm run dev` to start the local development server.
    * the app will rebuild everytime you make a change.
7. browse to `localhost:5000` in your browser.

## What is this project about?
This project is about to get more attention of younger people for the 'Nationaal Museum van Wereldculturen' (NMVW).

### but how?
I had the idea to create a 'social media' lookalike app where the user can scroll through.
The focus of the app is on slavery.
I wanted to give the users an idea and feeling of slavery by showing all kind of items that were related to slavery.
By showing the images, titles, descriptions and the periods of introduce I'll try to make a timeline in which the items will be showed from past to present. 
At the bottom of the page, there will be images showed of slavery during the period of that product to make an extra impression.

### How will it look?
This is a raw sketch of how the app will look like.
<img src="https://github.com/sarkis1997/frontend-applications/blob/master/public/images/schets1.png">

## Features
Scroll through the timeline

## API
The API is a dataset of around 700.000 objects of the NMVW. 
I have fetched all the objects related to slavery.
To be more specific, I have fetched the following things per object:
* Titles
* Descriptions
* Periods
* Images

## Query
```
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   PREFIX dc: <http://purl.org/dc/elements/1.1/>
   PREFIX dct: <http://purl.org/dc/terms/>
   PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
   PREFIX edm: <http://www.europeana.eu/schemas/edm/>
   PREFIX foaf: <http://xmlns.com/foaf/0.1/>

   SELECT ?cho ?title ?description ?objLabel ?img ?period WHERE {
     ?cho edm:isRelatedTo <https://hdl.handle.net/20.500.11840/termmaster2647> .
     ?cho dc:title ?title .
       FILTER langMatches(lang(?title), "ned")
     OPTIONAL { ?cho dc:description ?description } .
     ?cho edm:object ?obj .
       VALUES ?type { "gereedschap en uitrusting" "slavenketens" }
     ?obj skos:prefLabel ?objLabel .
     ?cho edm:isShownBy ?img .
     ?cho dct:created ?period
   }
```

## License
<a href="https://github.com/sarkis1997/frontend-applications/blob/master/LICENSE">MIT</a> @ Sarkis Moeradjan
