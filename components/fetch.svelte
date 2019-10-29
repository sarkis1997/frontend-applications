<script>
import { onMount } from 'svelte';
import { url, query } from '../lib/API.svelte'
import { filterHTML } from '../lib/regex.svelte'
import ItemGrid from '../lib/item-grid.svelte'
import { Container, Row, Col } from 'sveltestrap'

const fetchString = fetch(url+"?query="+ encodeURIComponent(query) +"&format=json");
let dataRaw = [];

(fetchData => {
    fetchString
    .then(res => res.json())
    .then(json => {
        dataRaw = json.results.bindings
        dataRaw.forEach(filterHTML)
    })
})();




 setTimeout(function() {
    console.log(dataRaw)
 }, 1000)

</script>

<Container>
    <ul>
        {#each dataRaw as result}
        <ItemGrid
            title={result.title.value}
            description={result.description.value}
            img="img">
            </ItemGrid>
        {/each}
    </ul>
</Container>