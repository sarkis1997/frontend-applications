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
        loopData()
        dataRaw.forEach(filterHTML)
    })
})()

let loopData = () => {
    dataRaw.forEach(checkDescription)
            console.log(dataRaw)
}

let checkDescription = (obj) => {
    if (!obj.description) {
        obj.description
        console.log('geen description')
    } else {
        console.log('wel description')
        return
    }
}

</script>


<Container>
    <ul>
        {#each dataRaw as result}
        <ItemGrid
            title={result.title.value}
            description={result.description.value}
            imgSrc={result.img.value}
            period={result.period.value}>
            </ItemGrid>
        {/each}
    </ul>
</Container>