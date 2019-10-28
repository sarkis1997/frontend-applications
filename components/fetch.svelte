<script>
import { url, query } from '../lib/API.svelte'

const fetchFunction = fetch(url+"?query="+ encodeURIComponent(query) +"&format=json")

let data = []
let runQuery = () => {
    fetchFunction
    .then(res => res.json())
    .then(json => {
        data = json.results.bindings
    })
}

runQuery()

 setTimeout(function() {
     console.log(data)
 }, 1000)



</script>


<ul>
    {#each data as result}
        <li>
            <div>
                <h1>{result.title.value}</h1>
                <p>{result.description.value}</p>
            </div>
        </li>
    {/each}
</ul>