<script>
import { url, query } from '../lib/API.svelte'

let data = []

function fetchData() {
   runQuery(url, query)

   function runQuery(url, query){
     fetch(url+"?query="+ encodeURIComponent(query) +"&format=json")
        .then(res => res.json())
        .then(json => {
            data = json.results.bindings
            console.log(data)
     })
   }
}

fetchData()

</script>


<ul>
    {#each data as result}
        <li>
            <h1>{result.title.value}</h1>
            <p>{result.description.value}</p>
        </li>
    {/each}
</ul>