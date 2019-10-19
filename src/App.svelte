<script>

  import { onMount } from 'svelte'
  import { runTheQuery } from '../components/fetch.svelte'


  onMount(() => {
      runTheQuery()
  });
  </script>



