<script>
import { url, query } from '../lib/API.svelte'
import ItemGrid from '../lib/item-grid.svelte'

const fetchFunction = fetch(url+"?query="+ encodeURIComponent(query) +"&format=json");
let data = [];

let runQuery = () => {
    fetchFunction
    .then(res => res.json())
    .then(json => {
        data = json.results.bindings
    })
};

runQuery();

 setTimeout(function() {
     console.log(data)
 }, 1000)

</script>

<ul>
    {#each data as result}
       <ItemGrid
        title={result.title.value}
        description={result.description.value}>
        </ItemGrid>
    {/each}
</ul>