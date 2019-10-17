<p></p>


<script>
  import { onMount } from "svelte";

  onMount(async () => {

   const el = document.querySelector('p')
   const url ="https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-07/sparql"
   //Note that the query is wrapped in es6 template strings to allow for easy copy pasting
   const query = `
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



   `
   runQuery(url, query)

   function runQuery(url, query){
     //Test if the endpoint is up and print result to page
     // (you can improve this script by making the next part of this function wait for a succesful result)
     fetch(url)
       .then(res => el.innerText = "Status of API: " + res.status)
     // Call the url with the query attached, output data
     fetch(url+"?query="+ encodeURIComponent(query) +"&format=json")
     .then(res => res.json())
     .then(json => {
     console.log(json)
     console.table(json.results);
     el.textContent = JSON.stringify(json.results)
     })
   }

  });

  </script>
